class CreatePackageTypes < ActiveRecord::Migration
  def self.up
    create_table :package_types do |t|
      t.string :name    
      t.timestamps
    end
    PackageType.create(:name => "Classes")
    PackageType.create(:name => "Unlimited")
    PackageType.create(:name => "Gym use")
  end

  def self.down
    drop_table :package_types
  end
end
