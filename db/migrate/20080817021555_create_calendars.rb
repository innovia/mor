class CreateCalendars < ActiveRecord::Migration
  def self.up
    create_table :calendars, :force => true do |t|
      t.string :name
      t.string :color, :limit => 7
     
      t.timestamps
    end
    
    # Create a default calendar
    Calendar.create :name => "Group",
                    :color => "0000ff"
                     
  end

  def self.down
    drop_table :calendars
  end
end
