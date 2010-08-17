Then /^today's date is the header$/  do
 within(:css, "#current_date") do
   page.should have_content(Date.today.strftime('%A, %B %d %Y'))
 end
end

Then /^there's at least one class scheduled for today$/ do
  @monqi_class = MonqiClass.make
  @event = Event.make({:start_date => Chronic.parse('today at 7:30'), :start_date => Chronic.parse('today at 8:15')})
end

Then /^I should see the class name/ do
 within_table('classSchedule') do
   page.find('#foo').find('.bar')
 end
  #save_and_open_page
end