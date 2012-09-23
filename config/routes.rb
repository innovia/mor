Mor::Application.routes.draw do 
  root :to => "pages#index", :as => :home

  resources :pictures, :user_session, :stats, :password_resets,  :users, :orders, :products, :packages, :calendars, :monqi_classes, :phone_numbers, :people
  resources :pages do
    get :remove_attachment, :on => :member
  end

  scope '/pages' do
    %w{ about_us classes personal_training schedule rates specials staff news contact_us thank_you news_flash schedule_feed schedule_beta}.each do | page |
      match "/#{page}" => "pages##{page}", :as =>  page.to_sym
    end
  end
  
  match "/stats" => "stats#show", :as => :stats
  match "/home" => "events#index", :as => :events
  match "/captcha"=> "users#captcha", :as => :captcha
  match "/login"=> "user_sessions#new", :as => :login
  match "/logout"=> "user_sessions#destroy", :as => :logout
  match "/register/:activation_code"=> "activations#new", :as => :activate_new
  match "/activate/:id"=> "activations#create", :as => :activate
  match "/forgot_password"=> "password_resets#new", :as => :password_reset
  match "/account"=> "users#index", :as => :account
  
  resources :people do
    member do
      get :remove_profile_pic
      put :enable
    end
    resources :roles
  end
  
  resources :roles do
    put :enable, :on => :member 
    resources :people
  end
  
  match "/manage_calendars"=> "calendars#manage", :as => :manage_calendars  
  match "/auto_complete" => "calendars#auto_complete", :as => :auto_complete
  match "/date_navigation/calendars/date_navigation/:id" => "calendars#date_navigation", :as => :date_navigation
  match "/settings" => "settings#edit", :as => :settings
  match "/monqi_member_signup" => "users#existing_member_signup", :as => :monqi_member_signup
  
  # Store Routes
  match '/store' => "store#index", :as => :store
  
  resources :events do
    resources :members
    collection do 
      post :sub
      get :sub_form
      get :check_for_existing_events
      get :fetch_classes
    end
  end
  
  # Nested Routes
  resources :package_templates do
    collection do
      post :sort 
      get :fetch_packages
    end
  end

  resources :pages do
    resources :pictures
  end
  
  resources :people do
    resources :phone_numbers, :packages, :events 
    resource :address 
  end
  
  resources :calendars do
    resources :package_templates
  end

  resources :package_templates do
    resources :packeges
    collection do
      post :by_calendar
    end
  end
  
  # Default Routes
  match ":controller/:action/:id"
  match ":controller/:action/:id.:format"  
  match "/:controller/:id/address/:action" => "people_address", :as => :people_address
end
