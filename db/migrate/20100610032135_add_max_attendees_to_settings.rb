class AddMaxAttendeesToSettings < ActiveRecord::Migration
  def self.up
    add_column :settings, :max_attendees, :integer
  end

  def self.down
    remove_column :settings, :max_attendees
  end
end
