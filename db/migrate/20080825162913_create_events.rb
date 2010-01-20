class CreateEvents < ActiveRecord::Migration
  def self.up
    create_table :events, :force => true do |t|
      t.references :instructor
      t.references :event_template
      t.integer :sequence
      t.timestamp :start_date
      t.timestamp :end_date
      t.timestamps
    end
  end

  def self.down
    drop_table :events
  end
end
