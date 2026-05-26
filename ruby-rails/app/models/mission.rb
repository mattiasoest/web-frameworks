class Mission < ApplicationRecord
  self.table_name = "missions"

  belongs_to :ship

  STATUSES = %w[planned active completed failed].freeze

  validates :codename, :objective, presence: true
  validates :status, inclusion: { in: STATUSES }

  def as_json(_options = {})
    {
      "id" => id,
      "ship_id" => ship_id,
      "codename" => codename,
      "objective" => objective,
      "status" => status,
      "started_at" => started_at&.utc&.iso8601,
      "ended_at" => ended_at&.utc&.iso8601,
      "created_at" => created_at&.utc&.iso8601,
      "updated_at" => updated_at&.utc&.iso8601
    }
  end
end
