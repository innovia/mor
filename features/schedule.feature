Feature: Schedule
  In order to view the schedule
  As a guest
  I want navigate through the schedule

@javascript
Scenario: today schedule
  Given I am on the schedule_beta page
	And today's date is the header
	And there's at least one class scheduled for today
	When I click the "Today" link
	Then I should see the class name
	#Then show me the page
	#Then I should see that class on the page
#the default settings
	#And the default Roles
	#And 
	
 	#Then I should see today's date
	#When I click on "next_day"
	#Then I should see tommorow's date