Feature: Fetch monqi_classes
  In order to view the schedule
  As a member
  I want navigate through the schedule

Background: 
	Given the default settings
	And the default Roles
	
Scenario: today_classes
  Given I am on the schedule page
 	#And there is at least one monqiclass scheduled
