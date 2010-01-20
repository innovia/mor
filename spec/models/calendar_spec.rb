require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

module CalendarSpecHelper
  def valid_attributes
    {:name => "Nutrition", :color => "972133" }
  end
end

describe Calendar, "Packages Types" do
  include CalendarSpecHelper
  
  before(:each) do
    @calendar = Calendar.new  
  end
  
  fixtures  :calendars
  
  it "should save with valid attributes" do
    @calendar.attributes = valid_attributes
    @calendar.should  be_valid
    @calendar.should have(:no).errors
  end
  
  it "should not save if the same color is taken" do
    @calendar.color = 333333
    @calendar.should_not be_valid
    @calendar.should have(1).error_on(:color)
  end
  
  it "should not save with the same name" do
    @calendar.name = "Group"
    @calendar.should_not be_valid
    @calendar.should have(1).error_on(:name)
  end
  
  it "should have a color" do
    @calendar.color = nil
    @calendar.should_not be_valid
    @calendar.should have(1).error_on(:color)
  end
  
  
end

