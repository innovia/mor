# Settings specified here will take precedence over those in config/environment.rb

# In the development environment your application's code is reloaded on
# every request.  This slows down response time but is perfect for development
# since you don't have to restart the webserver when you make code changes.
config.cache_classes = false

# Log error messages when you accidentally call methods on nil.
config.whiny_nils = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_view.debug_rjs                         = true
config.action_controller.perform_caching             = false
## ActiveMerchant Config
config.after_initialize do
   #ActiveMerchant::Billing::Base.mode = :test
end

config.to_prepare do
  #OrderTransaction.gateway = 
   # ActiveMerchant::Billing::BraintreeGateway.new(
  #    :login  => 'demo',
  #    :password => 'password'
  #  )
  
  # Email settings
  ActionMailer::Base.delivery_method = :smtp
  ActionMailer::Base.smtp_settings = {
    :address => "smtp.med.nyu.edu",
    :port => 25,
    :domain => "monqifitness.com"
  }
end