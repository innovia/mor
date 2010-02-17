class AddSortIndexToPackageTemplates < ActiveRecord::Migration
  def self.up
    add_column :package_templates, :sort_index, :integer
  end

  def self.down
    remove_column :package_templates, :sort_index
  end
end