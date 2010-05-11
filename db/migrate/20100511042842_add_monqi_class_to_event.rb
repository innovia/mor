class AddMonqiClassToEvent < ActiveRecord::Migration
  def self.up
    add_column :events, :monqi_class_id, :integer
  end

  def self.down
   remove_column :events, :monqi_class_id, :integer 
  end
end
