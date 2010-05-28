class RemoveEventTemplatesAndRecreateEventsTable < ActiveRecord::Migration
  def self.up
        drop_table :events
        drop_table :event_templates
        
        create_table :events, :force => true do |t|
         t.timestamp :start_date
         t.timestamp :end_date
         t.references :monqi_class
         t.string :level
         t.references :instructor
         t.integer :sub_instructor_id
         t.boolean :cancelled
         t.integer :sequence
         t.references :calendar
         t.boolean :allday
         t.string :rrule
        end
      end

  def self.down
    drop_table :events
  end
end