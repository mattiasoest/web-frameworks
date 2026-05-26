class CrewmatesController < ApplicationController
  before_action :set_crewmate, only: %i[show update destroy]

  def index
    render json: Crewmate.order(:created_at)
  end

  def show
    render json: @crewmate
  end

  def create
    body = parse_json_body
    return unless body

    crewmate = Crewmate.new(crewmate_attributes(body))
    crewmate.save!
    render json: crewmate, status: :created
  end

  def update
    body = parse_json_body
    return unless body
    return validation_error!("body", "At least one field is required") if body.empty?

    @crewmate.update!(crewmate_attributes(body))
    render json: @crewmate
  end

  def destroy
    @crewmate.destroy!
    head :no_content
  end

  private

  def set_crewmate
    @crewmate = Crewmate.find(params[:id])
  end

  def crewmate_attributes(body)
    attrs = {}
    attrs[:ship_id] = body["ship_id"] if body.key?("ship_id")
    attrs[:name] = body["name"] if body.key?("name")
    attrs[:role] = body["role"] if body.key?("role")
    attrs[:species] = body["species"] if body.key?("species")
    attrs[:rank] = body["rank"] if body.key?("rank")
    attrs
  end
end
