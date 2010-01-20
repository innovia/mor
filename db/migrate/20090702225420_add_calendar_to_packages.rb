class AddCalendarToPackages < ActiveRecord::Migration
  def self.up
    add_column :packages, :calendar_id, :integer
  end

  def self.down
    remove_column :packages, :calendar_id, :integer
  end
end
