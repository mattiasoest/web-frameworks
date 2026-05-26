class Crewmate < ApplicationRecord
  self.table_name = "crewmates"

  belongs_to :ship

  ROLES = %w[captain engineer medic pilot gunner].freeze

  validates :name, :species, presence: true
  validates :role, inclusion: { in: ROLES }
  validates :rank, presence: true, numericality: { only_integer: true }

  def as_json(_options = {})
    {
      "id" => id,
      "ship_id" => ship_id,
      "name" => name,
      "role" => role,
      "species" => species,
      "rank" => self[:rank],
      "created_at" => created_at&.utc&.iso8601,
      "updated_at" => updated_at&.utc&.iso8601
    }
  end
end
