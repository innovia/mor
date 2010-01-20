require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe WorkingCalendarController do

  
  def mock_calendar(stubs={})
    @mock_calendar ||= mock_model(Calendar, stubs)
  end

  describe "GET index" do
     it "set the default calendar on load" do
       Calendar.stub!(:find_events_for).with({:cal_id => 1, :nav_date => Date.today}).and_return(mock_calendar)
       get  :index
       #assigns[:calendar].should equal(mock_calendar)
     end
   end
   
  describe "Set Calendar" do
    it "should set the default calendar" do
      Calendar.stub!(:find_events_for).with({:cal_id => 1, :nav_date => Date.today}).and_return(mock_calendar)
       get  :index
       
    end
  end
end