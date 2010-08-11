require 'machinist/active_record'
require 'sham'
require 'forgery'

# Sham - Generating Attribute Values
Sham.define do
  login                          { Forgery::Internet.user_name }
  email                          { Forgery::Internet.email_address }
  pwd = Forgery::Basic.password
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

Event.blueprint do
  start_date      {"2010-08-02 07:30:00"}
  end_date        {"2010-08-02 08:15:00"}
  monqi_class_id  {1}
  level           {"open"}
  instructor_id   {1}
  calendar_id     {1}
  max_attendees   {3}
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
  first_name  { Forgery::Name.first_name }
  last_name   { Forgery::Name.last_name }
end

Calendar.blueprint do
  name  { "group" }
  color {  Forgery::Basic.hex_color }
end

MonqiClass.blueprint do
  title { Forgery::MonqiClass.title }
  description {Forgery::LoremIpsum.paragraph }
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
