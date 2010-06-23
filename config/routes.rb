ActionController::Routing::Routes.draw do |map|
  map.resources :pictures
  map.resources :pages, :member => { :remove_attachment => :get }
    
  map.with_options :controller => 'pages' do |page|
    page.about_us  'about_us',  :action => "about_us"
    page.classes 'classes', :action => "classes"
    page.personal_training 'personal_training', :action => "personal_training"
    page.schedule 'schedule', :action => "schedule"
    page.rates 'rates', :action => "rates"
    page.specials 'specials', :action => "specials"
    page.staff 'staff', :action => "staff"
    page.news 'news', :action => "news"
    page.contact_us 'contact_us', :action => "contact_us"   
    page.thank_you 'thank_you', :action => "thank_you"
    page.news_flash 'news_flash', :action => "news_flash" 
    page.schedule_feed 'schedule_feed', :action => "schedule_feed"
  end
  

  map.root :controller => "pages", :action => "index" 
  map.resource :user_session
  
  map.resources :stats
  map.statc 'statc', :controller => 'stats', :action => "show"
  
  map.home '/home', :controller => "events" 
  map.cal '/cal', :controller => "event_templates", :action  => "cal_view"
  map.captcha "captcha", :controller => "users", :action => "captcha"
  map.login "login", :controller => "user_sessions", :action => "new"
  map.logout "logout", :controller => "user_sessions", :action => "destroy"
  map.register '/register/:activation_code', :controller => 'activations', :action => 'new'
  map.activate '/activate/:id', :controller => 'activations', :action => 'create'
  map.forgot_password  '/forgot_password', :controller => 'password_resets', :action => 'new'
  map.resources :password_resets
  map.resource :account, :controller => "users"
  map.resources :users
  
  map.resources :people, :member => { :enable => :put, :remove_profile_pic => :get } do |people|
       people.resources :roles
  end
  
  map.resources :roles, :member => { :enable => :put } do |role|
      role.resources :people
  end
  
  map.manage_calendars "manage_calendars", :controller => "calendars", :action => "manage"   
  map.auto_complete "auto_complete", :controller => "calendars", :action => "auto_complete"
  map.date_navigation "/calendars/date_navigation/:id", :controller => "calendars", :action => "date_navigation"  
  map.resources :calendars
  
                           
  
  map.settings '/settings' ,  :controller => "settings" , :action => "edit"   
  map.exceptions '/logged_exceptions/:action/:id', :controller => 'logged_exceptions', :action => 'index', :id => nil 
  
  map.monqi_member_signup '/monqi_member_signup', :controller => 'users', :action => 'existing_member_signup'
  
  # Store Routes
  map.store '/store', :controller => "store"
  map.resources :orders, :products, :packages, :calendars, :monqi_classes, :phone_numbers, :people
  map.resources :event_templates, :has_many  => :events, :collection => {:quick_add => :post}
  map.resources :events,  :has_many =>  :members, :collection => {:check_for_existing_events => :get}
 
  # Nested Routes
  map.resources :package_templates, :collection => { :sort => :post, :fetch_packages => :get }

  map.resources :pages,  :has_many  => :pictures
  map.resources :people, :has_many  => :phone_numbers
  map.resources :people, :has_one  => :address
  map.resources :people, :has_many => :packages
  map.resources :people, :has_many  => :events  
  
  map.resources :calendars, :has_many  =>  :package_templates
 
  map.resources :package_templates, :has_many =>  :packages, :collection => { :by_calendar => :post } 
  
  # Default Routes
  map.connect ':controller/:action/:id'
  map.connect ':controller/:action/:id.:format'  
  map.people_address '/:controller/:id/address/:action'
end
