class EventsPeopleJoinTable < ActiveRecord::Migration
  def self.up
     create_table :events_people, :id => false do |t|
        t.integer :person_id
        t.integer :event_id
        end
  end

  def self.down
    drop_table  :events_members
  end
end