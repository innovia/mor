class AddMaxAttendeesToEvent < ActiveRecord::Migration
  def self.up
    add_column :events, :max_attendees, :integer
  end

  def self.down
    remove_column :events, :max_attendees
  end
end
