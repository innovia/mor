require 'vpim/rrule'

class EventTemplate < ActiveRecord::Base
  belongs_to  :calendar
  has_many :events, :dependent => :destroy
  
  belongs_to  :monqi_class
  belongs_to  :instructor, :class_name => "Person" # this is for the instructor in each event
    
 
  
  validates_presence_of :level, :message => "must be selected for a class"
  validates_presence_of :instructor_id, :calendar_id, :monqi_class_id
  validates_date :start_date, :end_date
  #validate :date_cannot_be_in_the_past 
  #validate  :valid_class_time?
  
  before_save :manually_serialize_byday
  after_save :create_one_or_recurring_events
   
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
  
#iCal Post Operations
  def manually_serialize_byday
   unless self.byday.nil? or self.byday.empty?
     self.byday = self.byday.join(",")
   else
     self.byday = ''
   end
  end

  def create_one_or_recurring_events
    if repeat == "none"
      add_single_event
    else
      add_events
    end
  end

  def add_single_event
    event_template = EventTemplate.last
    @event = Event.create({
                          :instructor_id => event_template.instructor_id,
                          :sequence => 0,
                          :start_date => event_template.start_date,
                          :end_date =>  event_template.end_date,
                          :event_template_id => event_template.id
                        })
  end

  def add_events
    # pull the last event template
  	@et = EventTemplate.last
    rule  = generate_rule(@et.repeat, @et.count, @et.until, @et.interval, @et.byday, @et.bymonthday, @et.bymonth)
  
    unless rule.nil?
      # start_date and end_date must be the same date but with a end_date has a differnt time
      # so we need to create to rrules objects for each set of days.
    
  	  rrule_start = Vpim::Rrule.new(@et.start_date, rule) #Create a repeting events for the start date/time
  	  rrule_end = Vpim::Rrule.new(@et.end_date, rule)     #Create a repeting events for the end date/time

  	  rrule_start.each_with_index do |start_date_r, sequence| 
    	  @event = Event.new
  		
    		rrule_end.each_with_index do |end_date_r, counter|
    		  if counter == sequence #if the counter for rrule_end is the same as the counter(sequence) for rrule_start
    		    @event.end_date = end_date_r
    		  end   
    		end #end of rrule_end loop
  		
    		@event.instructor_id = @et.instructor_id
    		@event.sequence = sequence
  	    @event.event_template_id = @et.id
  	    @event.start_date = start_date_r
  	    @event.save
    	end #end of rrule_start loop
    end #end of unless wrapper
  end
  
  def generate_rule(selected_frequency, end_after, end_on_date, repeat_every, selected_days, day_of_the_month, by_month)
    # set the frequency based on the repeat option
    # there's no need to check if repeat is none since its set by the after_create to jump to the add_single_event method
    
    if selected_frequency == "custom" 
       frequency = @et.freq 
    else  
       frequency = selected_frequency
    end
    
    end_after = "" if end_after.nil? 
    repeat_every = "" if repeat_every.nil?
    end_on_date = "" if end_on_date.nil?
    
    rule = 'FREQ='  + frequency   + ';' +
           'COUNT=' + end_after.to_s   + ';' +
           'UNTIL=' + end_on_date.strftime("%Y%m%d;") +
           'INTERVAL=' + repeat_every.to_s + ';' +
           'BYDAY=' + selected_days  + ';' +
           'BYMONTHDAY=' + day_of_the_month + ';' +
           'BYMONTH=' +  by_month + ';'
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