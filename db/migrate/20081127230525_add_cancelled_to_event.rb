class AddCancelledToEvent < ActiveRecord::Migration
  def self.up
    add_column :events, :cancelled, :boolean
  end

  def self.down
    remove_column :events, :cancelled
  end
end
