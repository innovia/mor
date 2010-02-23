class CreatePackageTypes < ActiveRecord::Migration
  def self.up
    create_table :package_types do |t|
      t.string :name    
      t.timestamps
    end
    PackageType.create(:name => "Group Classes")
    PackageType.create(:name => "Gym Use")
    PackageType.create(:name => "Unlimited and Gym Use")
    PackageType.create(:name => "Personal Training")
  end

  def self.down
    drop_table :package_types
  end
end
