Given /^there is at least one monqiclass scheduled$/ do
  @event = Event.make 
end


Then /^I should see today's date$/ do
 page.should have_content(Date.today.strftime('%A, %B %d %Y'))
end

Then /^I should see tommorow's date$/ do
  pending # express the regexp above with the code you wish you had
end
