Feature: Manage calendars
  In order to manage main calendars
  As a manager or an admin
  I want see the list of available calendars


Scenario: list calendars
  Given I am on the calendars page
  And there's at least 1 calendar
	Then I should see calendar name and color


