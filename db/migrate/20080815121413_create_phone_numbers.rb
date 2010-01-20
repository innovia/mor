class CreatePhoneNumbers < ActiveRecord::Migration
  def self.up
    create_table :phone_numbers, :force => true do |t|
      t.references :person
      t.string :location
      t.string :phone_number

      t.timestamps
    end
  end

  def self.down
    drop_table :phone_numbers
  end
end
