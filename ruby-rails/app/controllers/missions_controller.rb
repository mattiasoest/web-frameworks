class MissionsController < ApplicationController
  before_action :set_mission, only: %i[show update destroy]

  def index
    render json: Mission.order(:created_at)
  end

  def show
    render json: @mission
  end

  def create
    body = parse_json_body
    return unless body

    mission = Mission.new(mission_attributes(body))
    mission.status ||= "planned"
    mission.save!
    render json: mission, status: :created
  end

  def update
    body = parse_json_body
    return unless body
    return validation_error!("body", "At least one field is required") if body.empty?

    @mission.update!(mission_attributes(body))
    render json: @mission
  end

  def destroy
    @mission.destroy!
    head :no_content
  end

  private

  def set_mission
    @mission = Mission.find(params[:id])
  end

  def mission_attributes(body)
    attrs = {}
    attrs[:ship_id] = body["ship_id"] if body.key?("ship_id")
    attrs[:codename] = body["codename"] if body.key?("codename")
    attrs[:objective] = body["objective"] if body.key?("objective")
    attrs[:status] = body["status"] if body.key?("status")
    attrs[:started_at] = body["started_at"] if body.key?("started_at")
    attrs[:ended_at] = body["ended_at"] if body.key?("ended_at")
    attrs
  end
end
