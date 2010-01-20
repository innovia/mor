class CreateAddresses < ActiveRecord::Migration
  def self.up
    create_table :addresses do |t|
      t.references :person
      t.string :street
      t.string :apt
      t.references :zip_code

      t.timestamps
    end
  end

  def self.down
    drop_table :addresses
  end
end
