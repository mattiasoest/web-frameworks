require_relative "boot"
require "rails/all"

Bundler.require(*Rails.groups)

module SpaceshipApi
  class Application < Rails::Application
    config.load_defaults 7.2
    config.api_only = true
    config.active_record.schema_format = :sql
    config.active_record.migration_error = false
    config.time_zone = "UTC"
  end
end
