# This file is auto-generated from the current state of the database. Instead of editing this file, 
# please use the migrations feature of Active Record to incrementally modify your database, and
# then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your database schema. If you need
# to create the application database on another system, you should be using db:schema:load, not running
# all the migrations from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20100610032135) do

  create_table "addresses", :force => true do |t|
    t.integer  "person_id"
    t.string   "street"
    t.string   "apt"
    t.integer  "zip_code_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "calendars", :force => true do |t|
    t.string   "name"
    t.string   "color",      :limit => 7
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "cart_items", :force => true do |t|
    t.integer  "cart_id"
    t.integer  "product_id"
    t.integer  "quantity"
    t.decimal  "total",      :precision => 8, :scale => 2, :default => 0.0
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "carts", :force => true do |t|
    t.integer  "person_id"
    t.string   "state",      :default => "open"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "events", :force => true do |t|
    t.datetime "start_date"
    t.datetime "end_date"
    t.integer  "monqi_class_id"
    t.string   "level"
    t.integer  "instructor_id"
    t.integer  "sub_instructor_id"
    t.boolean  "cancelled"
    t.integer  "sequence"
    t.integer  "calendar_id"
    t.boolean  "allday"
    t.string   "rrule"
    t.integer  "max_attendees"
  end

  create_table "events_packages", :id => false, :force => true do |t|
    t.integer "package_id"
    t.integer "event_id"
  end

  create_table "events_people", :id => false, :force => true do |t|
    t.integer "person_id"
    t.integer "event_id"
  end

  create_table "logged_exceptions", :force => true do |t|
    t.string   "exception_class"
    t.string   "controller_name"
    t.string   "action_name"
    t.text     "message"
    t.text     "backtrace"
    t.text     "environment"
    t.text     "request"
    t.datetime "created_at"
  end

  create_table "monqi_classes", :force => true do |t|
    t.string   "title"
    t.text     "description"
    t.string   "web_category"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "order_transactions", :force => true do |t|
    t.integer  "order_id"
    t.string   "action"
    t.integer  "amount"
    t.boolean  "success"
    t.string   "authorization"
    t.string   "message"
    t.text     "params"
    t.boolean  "test"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "orders", :force => true do |t|
    t.integer  "cart_id"
    t.string   "ip_address"
    t.string   "first_name"
    t.string   "last_name"
    t.string   "card_type"
    t.date     "card_expires_on"
    t.string   "state",           :default => "pending"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "package_templates", :force => true do |t|
    t.boolean  "inactive"
    t.integer  "package_type_id"
    t.integer  "calendar_id"
    t.string   "description"
    t.integer  "sessions"
    t.integer  "expires_in"
    t.decimal  "cost",            :precision => 8, :scale => 2
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "sort_index"
  end

  create_table "package_types", :force => true do |t|
    t.string   "name"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "packages", :force => true do |t|
    t.integer  "person_id"
    t.integer  "sessions"
    t.integer  "package_template_id"
    t.integer  "package_type_id"
    t.boolean  "active"
    t.datetime "expiration_date"
    t.decimal  "cost",                :precision => 8, :scale => 2
    t.string   "paid_by"
    t.integer  "last_4_digits"
    t.integer  "created_by"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.integer  "calendar_id"
  end

  create_table "pages", :force => true do |t|
    t.string   "title"
    t.text     "body"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "page_attachment_file_name"
    t.string   "page_attachment_content_type"
    t.integer  "page_attachment_file_size"
    t.datetime "page_attachment_updated_at"
  end

  create_table "people", :force => true do |t|
    t.string   "first_name"
    t.string   "middle_name"
    t.string   "last_name"
    t.date     "dob"
    t.string   "email"
    t.text     "notes"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
    t.string   "birthday_visibility"
  end

  create_table "people_roles", :id => false, :force => true do |t|
    t.integer "role_id"
    t.integer "person_id"
  end

  add_index "people_roles", ["person_id"], :name => "index_people_roles_on_person_id"
  add_index "people_roles", ["role_id"], :name => "index_people_roles_on_role_id"

  create_table "phone_numbers", :force => true do |t|
    t.integer  "person_id"
    t.string   "location"
    t.string   "phone_number"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "pictures", :force => true do |t|
    t.integer  "page_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  create_table "products", :force => true do |t|
    t.integer  "cart_item_id"
    t.decimal  "price",               :precision => 8, :scale => 2
    t.string   "title"
    t.text     "description"
    t.string   "product_type"
    t.integer  "package_template_id"
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string   "photo_file_name"
    t.string   "photo_content_type"
    t.integer  "photo_file_size"
    t.datetime "photo_updated_at"
  end

  create_table "roles", :force => true do |t|
    t.string "title"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "settings", :force => true do |t|
    t.integer "default_calendar_id"
    t.integer "group_calendar_disable_attendant_removal_window"
    t.integer "personal_training_calendar_disable_attendant_removal_window"
    t.integer "default_package_expiration_date"
    t.integer "per_page"
    t.integer "products_pages"
    t.time    "day_start_time"
    t.time    "day_end_time"
    t.integer "max_attendees"
  end

  create_table "used_packages", :force => true do |t|
    t.integer  "event_id"
    t.integer  "package_id"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "login",               :null => false
    t.integer  "person_id"
    t.string   "email",               :null => false
    t.string   "crypted_password",    :null => false
    t.string   "password_salt",       :null => false
    t.string   "persistence_token",   :null => false
    t.string   "single_access_token", :null => false
    t.string   "perishable_token",    :null => false
    t.boolean  "active"
    t.datetime "last_request_at"
    t.datetime "current_login_at"
    t.datetime "last_login_at"
    t.string   "current_login_ip"
    t.string   "last_login_ip"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "zip_codes", :force => true do |t|
    t.string "city"
    t.string "state", :limit => 2
  end

end
