class EventsPackagesJoinTable < ActiveRecord::Migration
  def self.up
     create_table :events_packages, :id => false do |t|
        t.integer :package_id
        t.integer :event_id
        end
  end

  def self.down
    drop_table  :events_packages
  end
end
