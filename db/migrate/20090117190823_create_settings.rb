class CreateSettings < ActiveRecord::Migration
  def self.up
    create_table :settings do |t|
      t.integer :default_calendar_id
      t.integer :group_calendar_disable_attendant_removal_window
      t.integer :personal_training_calendar_disable_attendant_removal_window
      t.integer :default_package_expiration_date
      t.integer :per_page
      t.integer :products_pages
      t.time    :day_start_time
      t.time    :day_end_time
    end
  
  # Default Settings:
  Settings.create  :default_calendar_id => 1,
                  :group_calendar_disable_attendant_removal_window => 24,
                  :personal_training_calendar_disable_attendant_removal_window => 3,
                  :default_package_expiration_date => 6,
                  :per_page => 7,
                  :products_pages => 5,
                  :day_start_time => "06:30:00",
                  :day_end_time => "21:00:00"
                  
  end
  
  def self.down
    drop_table :settings
  end
end
