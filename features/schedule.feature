Feature: Schedule
  In order to view the schedule
  As a guest
  I want navigate through the schedule

Scenario: today schedule
  Given the default settings
	And the default Roles
	And I am on the schedule page
	
 	Then I should see today's date
	#When I click on "next_day"
	#Then I should see tommorow's date