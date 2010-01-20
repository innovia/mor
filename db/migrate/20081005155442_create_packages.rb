class CreatePackages < ActiveRecord::Migration
  def self.up
    create_table :packages, :force => true do |t|
      t.references :person
      t.integer :sessions
      t.references :package_template
      t.references :package_type
      t.boolean :active
      t.datetime :expiration_date
      t.decimal :cost, :precision => 8, :scale => 2
      t.string :paid_by
      t.integer :last_4_digits
      t.integer :created_by
      
      t.timestamps
    end
  end

  def self.down
    drop_table :packages
  end
end
