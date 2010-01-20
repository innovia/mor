Feature: Stats
  In order to view website statistics
  As an admin
  I want to see a list of stats options


Background:	
	Given	the default Roles
	And the default settings
	And I am on the stats page

Scenario: Show stats links
  Then	I should see "Packages sales by date"
	And 	I should see "Number of classes by date"
	And 	I should see "Instructors activity"
	And 	I should see "member status"
	And 	I should see "Income by client"
	And 	I should see "Income by class type"
	And 	I should see "Expiring Packages"
	And 	I should see "Receipt Summary"
	And		I should see "Package Popularity"
	And 	I should see "Payments by method"
	And 	I should see "Income by month"
	
Scenario: Packages sales by date
  When I follow the "Packages sales by date" link
  Then I should see "Packages sales by date"


