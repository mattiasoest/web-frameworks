class ShipsController < ApplicationController
  before_action :set_ship, only: %i[show update destroy crewmates missions]

  def index
    render json: Ship.order(:created_at)
  end

  def show
    render json: @ship
  end

  def create
    body = parse_json_body
    return unless body

    ship = Ship.new(ship_attributes(body))
    ship.save!
    render json: ship, status: :created
  end

  def update
    body = parse_json_body
    return unless body
    return validation_error!("body", "At least one field is required") if body.empty?

    @ship.update!(ship_attributes(body))
    render json: @ship
  end

  def destroy
    @ship.destroy!
    head :no_content
  end

  def crewmates
    render json: @ship.crewmates.order(:rank)
  end

  def missions
    render json: @ship.missions.order(:created_at)
  end

  private

  def set_ship
    @ship = Ship.find(params[:id])
  end

  def ship_attributes(body)
    attrs = {}
    attrs[:name] = body["name"] if body.key?("name")
    attrs[:ship_class_value] = body["class"] if body.key?("class")
    attrs[:registry] = body["registry"] if body.key?("registry")
    attrs[:warp_capable] = body["warp_capable"] if body.key?("warp_capable")
    attrs
  end
end
