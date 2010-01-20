class CreateZipCodes < ActiveRecord::Migration
  def self.up
    create_table :zip_codes do |t|
      t.string :id, :limit => 5
      t.string :city
      t.string :state, :limit => 2

    end
  end

  def self.down
    drop_table :zip_codes
  end
end
