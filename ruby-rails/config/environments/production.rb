require_relative "environment"

Rails.application.configure do
  config.cache_classes = true
  config.eager_load = true
  config.consider_all_requests_local = false
  config.public_file_server.enabled = false
  config.log_level = :info
  config.active_record.dump_schema_after_migration = false
end
