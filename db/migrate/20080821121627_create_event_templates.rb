class CreateEventTemplates < ActiveRecord::Migration
  def self.up
    create_table :event_templates, :force => true do |t|
      t.string :level
      t.references :monqi_class
      t.references :instructor
      t.references :calendar
      t.boolean :allday
      t.timestamp :start_date
      t.timestamp :end_date
      t.string :url
      t.text :notes
      t.string :repeat
      t.string :freq, :default => ""  
      t.integer :interval
      t.integer :count
      t.date :until
      t.string :byday, :default => ""
      t.string :bymonthday, :default => ""
      t.string :bymonth, :default => ""
      
    end
  end

  def self.down
    drop_table :event_templates
  end
end
