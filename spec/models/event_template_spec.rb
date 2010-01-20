require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

module EventTemplateSpecHelper
  def basic_event_attributes 
    {
      :level => "basic",
      :monqi_class_id => 1,
      :instructor_id => 1,
      :calendar_id => 1,
      :start_date => Date.tomorrow,
      :end_date  => Date.tomorrow + 1.hour,
      :allday => 0  
    }
  end
end



describe EventTemplate do
  include EventTemplateSpecHelper
  fixtures  :monqi_classes, :people, :calendars
  
  before(:each) do
    @et = EventTemplate.new
  end
  
  it "should create a single event with an event template" do
   @et.attributes = basic_event_attributes  
   @et.should be_valid
   @et.repeat = "none"
   @et.save
   @et.events.should have(1).record
  end
  
  it "should not create without selecting the basics" do
    @et.should_not be_valid
    @et.errors.full_messages.count.should == 6
    @et.errors.full_messages.should == ["Start date can't be blank",
                                        "Monqi class can't be blank", 
                                        "Level must be selected for a class", 
                                        "Calendar can't be blank", 
                                        "End date can't be blank", 
                                        "Instructor can't be blank"]

  end
  
  it "should have a duration for a class" do
   # @et.attributes = basic_event_attributes
   # @et.start_date = Date.today + 1.hour
  #  @et.end_date = Date.today + 1.hour
  #  @et.should_not be_valid
   # @et.errors.full_messages.should == "Class has no duration, Start time can not be the same as the end time"
  end
  
  it "should not be valid if start date (without the time) is not the same end date (without the time)" do
    @et.attributes = basic_event_attributes
    @et.start_date = Date.tomorrow + 1.hour
    @et.end_date = Date.today  + 1.hour
    @et.should_not be_valid
    @et.errors.on(:start_date).should == "doesn't match the End date"
  end
  
  it "should not be valid if start date is earlier then end date" do
    @et.attributes = basic_event_attributes
    @et.start_date = Date.today + 1.hour
    @et.end_date = Date.yesterday  + 1.hour
    @et.should_not be_valid
    @et.errors.on(:start_date).should == "doesn't match the End date"
  end
  
describe "creating events" do
  it "should repeat daily and end after 5 times" do
      @et.attributes = basic_event_attributes
      @et.repeat = "daily"
      @et.count  = 5
      @et.save!
      @et.events.should have(5).records
  end
    
  it "should repeat weekly for 1 month from today" do
    @et.attributes = basic_event_attributes
    @et.repeat = "weekly"
    @et.until  = Date.today + 1.month
    @et.save!
    @et.events.should have_at_least(4).records
    @et.events.should have_at_most(5).records
  end
  
  it "should repeat monthly (once a month)from the beginning to the end of the year " do
    @et.attributes = basic_event_attributes
    @et.repeat = "monthly"
    @et.start_date = Date.today.beginning_of_year.next_year + 30.minutes
    @et.end_date =  Date.today.beginning_of_year.next_year + 1.hour
    @et.until = Date.today.end_of_year.next_year
    @et.save!
    @et.events.should have_at_least(11).records
    @et.events.should have_at_most(12).records
  end
  
  it "should repeat every mon wed and fri for 6 times(events, not weeks!)" do
    @et.attributes = basic_event_attributes
    @et.repeat = "custom"
    @et.start_date = Date.parse('this_monday') 
    @et.end_date = @et.start_date + 1.hour
    @et.freq = "weekly"
    @et.interval = 1
    @et.count = 6
    @et.save! 
    @et.events.should have(6).records
  end

  it "should repeat yearly (i.e new year we are closed), for 5 yrs" do
    @et.attributes = basic_event_attributes
    @et.repeat = "yearly"
    @et.count  = 5
    @et.save!
    @et.events.count.should == 5
  end

  it "should repeat every other day for 1 month" do
    @et.attributes = basic_event_attributes
    @et.repeat = "custom"
    @et.interval = 2
    @et.freq = "daily"
    @et.until = Date.tomorrow + 1.month
    @et.save!
    @et.events.should have_at_least(15).records
    @et.events.should have_at_most(17).records
  end

end  
  
end