class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "not_found" }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |error|
    render json: {
      error: "validation_failed",
      details: error.record.errors.map { |e| { field: e.attribute.to_s, message: e.message } }
    }, status: :bad_request
  end

  rescue_from ActiveRecord::InvalidForeignKey do
    render json: {
      error: "validation_failed",
      details: [{ field: "ship_id", message: "Ship does not exist" }]
    }, status: :bad_request
  end

  rescue_from ActiveRecord::RecordNotUnique do |error|
    field = error.message.include?("registry") ? "registry" : "body"
    message = field == "registry" ? "Registry must be unique" : "Must be unique"
    render json: {
      error: "validation_failed",
      details: [{ field: field, message: message }]
    }, status: :bad_request
  end

  private

  def validation_error!(field, message)
    render json: {
      error: "validation_failed",
      details: [{ field: field, message: message }]
    }, status: :bad_request
  end

  def parse_json_body
    return @parsed_body if defined?(@parsed_body)

    @parsed_body = request.request_parameters
  rescue ActionDispatch::Http::Parameters::ParseError
    validation_error!("body", "Invalid JSON")
    nil
  end
end
