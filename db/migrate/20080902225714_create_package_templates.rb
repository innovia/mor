class CreatePackageTemplates < ActiveRecord::Migration
  def self.up
    create_table :package_templates, :force => true do |t|
      t.boolean :inactive
      t.references :package_type
      t.references :calendar
      t.string :description
      t.integer :sessions
      t.integer :expires_in
      t.decimal :cost, :precision => 8, :scale => 2

      t.timestamps
    end
  end

  def self.down
    drop_table :package_templates
  end
end
