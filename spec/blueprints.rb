require 'machinist/active_record'
require 'sham'
require 'forgery'

# Sham - Generating Attribute Values
Sham.define do
  login                          { InternetForgery.user_name }
  email                          { InternetForgery.email_address }
  pwd = BasicForgery.password
  password                       { pwd }
  password_confirmation          { pwd }
end

# Blueprints - Generating Objects

Settings.blueprint do
  default_calendar_id                                               { 1  }
  group_calendar_disable_attendant_removal_window                   { 24 }
  personal_training_calendar_disable_attendant_removal_window       { 3  }
  default_package_expiration_date                                   { 6  }
  per_page                                                          { 7  }
  products_pages                                                    { 5  }
  day_start_time                                                 { "09:00" }
  day_end_time                                                   { "21:00" }
end

Role.blueprint  do
  title
end

User.blueprint do
  person
  login         
  email    
  password
  password_confirmation
  active { 1 }
end


User.blueprint(:bobby) do
  person
  login      { "bobby" }
  email      { "bobby@gmail.com" }
  password   { "secret" }
  password_confirmation { "secret" }
  active  { 1 }
end

Person.blueprint do
  first_name  { NameForgery.first_name }
  last_name   { NameForgery.last_name }
end

Calendar.blueprint do
  name  { "group" }
  color {  BasicForgery.hex_color }
end

MonqiClass.blueprint do
  title { MonqiClassForgery.title }
  description {LoremIpsumForgery.paragraph }
end

PackageType.blueprint do
  name { "Group classes"}
end

PackageTemplate.blueprint do
  package_type
  calendar
  description {" 10 pack"}
  sessions    { "10" }
  expires_in  { "6"  }
  cost        { "299"}
  product
end

Product.blueprint do
  price { "299" }
  title { "10 pack" }
  description { "10 pack" }
  product_type { "package" }
end
