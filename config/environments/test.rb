# Settings specified here will take precedence over those in config/environment.rb

# The test environment is used exclusively to run your application's
# test suite.  You never need to work with it otherwise.  Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs.  Don't rely on the data there!
config.cache_classes = false

# Log error messages when you accidentally call methods on nil.
config.whiny_nils = true

# Show full error reports and disable caching
config.action_controller.consider_all_requests_local = true
config.action_controller.perform_caching             = false

# Disable request forgery protection in test environment
config.action_controller.allow_forgery_protection    = false

# Tell Action Mailer not to deliver emails to the real world.
# The :test delivery method accumulates sent emails in the
# ActionMailer::Base.deliveries array.
config.action_mailer.delivery_method = :test

config.gem "rspec",       :lib => false, :version => ">= 1.2.7" 
config.gem "rspec-rails", :lib => false, :version => ">= 1.2.7.1" 
config.gem "webrat",      :lib => false, :version => ">=0.4.3"
config.gem "cucumber",    :lib => false, :veriosn => ">=0.3.0"
config.gem "chronic"
#require File.join(RAILS_ROOT, 'spec', 'blueprints')

#config.after_initialize do
  #ActiveMerchant::Billing::Base.mode = :test
  
  #OrderTransaction.gateway =
  #  ActiveMerchant::Billing::BogusGateway.new
#end
