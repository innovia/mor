class Event < ActiveRecord::Base
  belongs_to :monqi_class, :class_name => "MonqiClass", :foreign_key => "monqi_class_id"
  belongs_to :instructor, :class_name => "Person" # this is for the instructor in each event
  belongs_to :sub_instructor, :class_name => "Person", :foreign_key => "sub_instructor_id"
  belongs_to :calendar
  
  has_and_belongs_to_many :packages
  has_and_belongs_to_many :attendees, :class_name => "Person"
     
  # Getter Setter for start and end time
  def start_time
    start_time.strftime("%I:%M %p")
  end 
  
  def start_time=(start_time_field_input)
    self.start_time = Time.parse(start_time_field_input)
  end 
 
  def end_time
    end_time.strftime("%I:%M %p")
  end 
  
  def end_time=(end_time_field_input)
    self.end_time = Time.parse(end_time_field_input)
  end 
  

# iCal Validations
  def date_cannot_be_in_the_past
    errors.add(:start_date, "can't be in the past") if  !start_date.blank? and start_date < Date.today 
    errors.add(:end_date, "can't be in the past") if !end_date.blank? and end_date < Date.today
  end
  
  def valid_class_time?
    errors.add_to_base( "Class has no duration, Start time can not be the same as the end time") if start_time == end_time  
  end
  
end