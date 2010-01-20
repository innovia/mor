class CreateProducts < ActiveRecord::Migration
  def self.up
    create_table :products, :force => true do |t|
      t.integer :cart_item_id
      t.decimal :price, :precision => 8, :scale => 2
      t.string :title
      t.text :description
      t.string :product_type
      t.references :package_template
    
      t.timestamps
    end
  end

  def self.down
    drop_table :products
  end
end
