Rails.application.config.secret_key_base = ENV.fetch("SECRET_KEY_BASE") {
  "spaceship_api_secret_key_base_for_local_comparison_only_not_for_production_use_1234567890"
}
