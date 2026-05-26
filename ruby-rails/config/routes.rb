Rails.application.routes.draw do
  get "/healthz", to: "health#show"

  resources :ships, only: %i[index show create update destroy] do
    member do
      get :crewmates, to: "ships#crewmates"
      get :missions, to: "ships#missions"
    end
  end

  resources :crewmates, only: %i[index show create update destroy]
  resources :missions, only: %i[index show create update destroy]
end
