# Sets up the Rails environment for Cucumber
ENV["RAILS_ENV"] ||= "cucumber"
root = File.expand_path('../../..', __FILE__)
ENV['CLASSPATH'] = Dir["#{root}/vendor/htmlunit-2.6/*.jar"].join(':')

require "#{root}/config/environment"
require 'steam'
require 'test/unit'

require File.join(RAILS_ROOT, 'spec', 'blueprints')
#require 'email_spec/cucumber'

Steam.config[:html_unit][:java_path] = "#{root}/vendor/htmlunit-2.6"


browser = Steam::Browser.create
World do
  Steam::Session::Rails.new(browser)
end

at_exit { browser.close }

Before do
  ActiveRecord::Base.send(:subclasses).each do |model|
    model.connection.execute("DELETE FROM #{model.table_name}")
  end
end

# Comment out the next line if you don't want transactions to
# open/roll back around each scenario
#Cucumber::Rails.use_transactional_fixtures

# Comment out the next line if you want Rails' own error handling
# (e.g. rescue_action_in_public / rescue_responses / rescue_from)
#Cucumber::Rails.bypass_rescue


#Webrat.configure do |config|
#  config.mode = :rails
#end

