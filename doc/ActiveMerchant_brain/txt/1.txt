class CreateOrders < ActiveRecord::Migration
  def self.up
    create_table :orders, :force => true do |t|
      t.references :cart
      t.string :ip_address
      t.references :person
      t.string :payment_type
      t.date :card_expires_on

      t.timestamps
    end
  end

  def self.down
    drop_table :orders
  end
end
