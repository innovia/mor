class CreateUsedPackages < ActiveRecord::Migration
  def self.up
    create_table :used_packages do |t|
      t.references :event
      t.references :package
      t.timestamps
    end
  end

  def self.down
    drop_table :used_packages
  end
end
