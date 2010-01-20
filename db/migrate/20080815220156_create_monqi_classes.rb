class CreateMonqiClasses < ActiveRecord::Migration
  def self.up
    create_table :monqi_classes, :force => true do |t|
      t.string :title
      t.text :description
      t.string :web_category
      t.timestamps
    end
  end

  def self.down
    drop_table :monqi_classes
  end
end
