# The Settings model acts as the interface to the settings table. 
# The settings table should consist of only one row with one column for each configuration field in your system. 
#
# Callbacks prevent rows from being added to or removed from the table.
#
class Settings < ActiveRecord::Base
  
    before_create :check_for_existing
    before_destroy :check_for_existing
    validate :all_day_settings

  def formatted_day_start
    day_start_time.strftime("%I:%M %p")
  end

  def formatted_day_start=(day_start_str)
    self.day_start_time = Time.parse(day_start_str)
  end
  
  def formatted_day_end
     day_end_time.strftime("%I:%M %p")
  end

  def formatted_day_end=(end_day_str)
    self.day_end_time = Time.parse(end_day_str)
  end
  
  def all_day_settings
   errors.add_to_base("the end of the day can not be earlier then the begining of the day") if self.day_end_time < self.day_start_time
  end
  
   # class methods
   
   # Returns the system configuration record. You should use this instead of doing an explicit #find on this object, as this
   # method will retrieve only the first row from the table.
   #
   # If no configuration record exists, one will be created with blank fields.
   def self.load
      settings = Settings.find :first
       if settings.nil?
         settings = Settings.create() 
       end
      settings
   end
    

   protected
   
   # Prevents the destruction or creation of more than one record.
   def check_for_existing
        return false if Settings.find(:all).size >= 1 
    end
end