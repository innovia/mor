Feature: Login
  In order to use monqi 2.0
  As an user
  I want to login

	Background: 
		Given the default settings
	  And the default Roles
		And the following user records
		  		| login			 | password	| role	 		  |
					| admin			 | secret		| admin				|
				  | manager 	 | secret  	| manager		  |
					| staff      | secret  	| staff_member|
				  | instructor | secret  	| instructor  |
					| member	 	 | secret		| member			|
	
		Scenario Outline: restrict guest access
		  Given I am on the home page
		  And no user is logged in
			When I go to <page>
		  Then I should <action>

		Examples:
			|	page					|	action						|
			| home page			| show login form		|
			| account page	| see restricted msg|
		
	Scenario: Member login
		Given I am on the home page
		And no user is logged in
		And I am a "member"
	  Then I should not see "log out"
	  
		When I fill in "Username" with "bobby"
	  And  I fill in "Password" with "secret"
		And  I press "login"
		Then I should see "Login successful!"

  	Scenario Outline: Restrict Access
		 	And I am logged in as "<login>" with password "secret"
		 	When I go to <page> 
		  Then I should <action>

		 Examples:
		 			| login	  	 |  page 				| action      		   		 |
		      | admin 		 |  home page   | see admin nav bar	 		 |										  
				 	| manager		 |	home page		| see manager nav bar 	 |
					| staff			 |	home page		| see staff nav bar 		 |
					| instructor |	home page		| see instructor nav bar |
					| member	   |	home page		| see member nav bar 		 |
					
