class AddDobPreferenceToPerson < ActiveRecord::Migration
  def self.up
    add_column :people, :birthday_visibility, :string
  end

  def self.down
    remove_column :people, :birthday_visibility
  end
end
