Feature: Signup
  In order to login
  As a Member
  I want to Signup

Background: 
	Given the default settings
  And the default Roles
					
	Scenario: Signup for new account
	  Given I am on the signup form
		When I fill up the required fields
	  And  I press "signupButton"
	  Then I should see "Thank you Ami for signing up! Please check your email to activate your account before logging in."
	  Then I should receive an email
		When I open the email
		Then I should see "Activation Instructions" in the email subject
		When I click the first link in the email		
	  Then I should see "Activate your account"
	  When I fill in "user_password" with "sekret"
		And  I fill in "user_password_confirmation" with "sekret"
		And I press "activate"
		Then I should see "Your account has been activated."
		And I should see "logout"
