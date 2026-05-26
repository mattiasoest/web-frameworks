class Ship < ApplicationRecord
  self.table_name = "ships"
  # AR refuses to define attribute methods for the reserved column name `class`.
  self.ignored_columns = %w[class]

  has_many :crewmates, dependent: :destroy
  has_many :missions, dependent: :destroy

  SHIP_CLASSES = %w[cruiser frigate destroyer scout].freeze
  SELECT_COLUMNS = <<~SQL.squish.freeze
    ships.id,
    ships.name,
    ships.registry,
    ships.warp_capable,
    ships.created_at,
    ships.updated_at,
    ships.class AS ship_class_value
  SQL

  default_scope { select(SELECT_COLUMNS) }

  attribute :ship_class_value, :string

  validates :name, :registry, presence: true
  validates :registry, uniqueness: true
  validates :ship_class_value, inclusion: { in: SHIP_CLASSES }

  before_save :sync_class_column

  def as_json(_options = {})
    {
      "id" => id,
      "name" => name,
      "class" => ship_class_value,
      "registry" => registry,
      "warp_capable" => warp_capable,
      "created_at" => created_at&.utc&.iso8601,
      "updated_at" => updated_at&.utc&.iso8601
    }
  end

  private

  def sync_class_column
    return if ship_class_value.nil?
    return if new_record?
    return unless will_save_change_to_ship_class_value?

    self.class.connection.exec_update(
      self.class.sanitize_sql_array(
        ["UPDATE ships SET class = ?::ship_class WHERE id = ?", ship_class_value, id]
      ),
      "Ship Update Class",
      []
    )
  end

  # Ignored columns are omitted from AR's INSERT; persist `class` explicitly.
  def _create_record(_attribute_names = self.attribute_names)
    validate!

    row_id = self.class.connection.select_value(
      self.class.sanitize_sql_array(
        [
          "INSERT INTO ships (name, class, registry, warp_capable) VALUES (?, ?::ship_class, ?, ?) RETURNING id",
          name,
          ship_class_value,
          registry,
          warp_capable
        ]
      )
    )

    fresh = self.class.find(row_id)
    @attributes = fresh.instance_variable_get(:@attributes)
    @new_record = false
    @previously_new_record = true
    row_id
  end
end
