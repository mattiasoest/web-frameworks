class Ship < ApplicationRecord
  self.table_name = "ships"

  has_many :crewmates, dependent: :destroy
  has_many :missions, dependent: :destroy

  SHIP_CLASSES = %w[cruiser frigate destroyer scout].freeze

  validates :name, :registry, presence: true
  validates :registry, uniqueness: true
  validates :ship_class_value, inclusion: { in: SHIP_CLASSES }

  def ship_class_value
    self[:class]
  end

  def ship_class_value=(value)
    self[:class] = value
  end

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
end
