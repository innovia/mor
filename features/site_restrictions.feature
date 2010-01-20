Feature: Site restrictions
  In order to ensure the correct access
  As a logged in user with a role
  I want to see only what my access allows me to

	Background: 
		Given the default settings
	  And 	the default Roles
		And		the following user records
			  		| login			 | password	| role	 		  |
						| admin			 | secret		| admin				|
					  | manager 	 | secret  	| manager		  |
						| staff      | secret  	| staff_member|
					  | instructor | secret  	| instructor  |
						| member	 	 | secret		| member			|
# -------------
# MonQi Classes
# -------------
	@mq_classes_new
	Scenario Outline: create a new class only as a manager or an admin
		Given I am logged in as "<login>" with password "secret"
	  When I go to new class page
		Then access <action>
	  
	Examples:
	 				 | login      |	action	|
					 | admin      | granted	|
					 | manager    | granted	|
					 | staff      |	denied	|
					 | instructor | denied	|
					 | member     | denied	|
	@mq_classes_edit
	Scenario Outline: edit an existing class only as a manager or an admin
		Given I am logged in as "<login>" with password "secret"
		And an existing class
	  When I am on the classes page
		
		Then I should see the existing class
		When I try to edit the class
		Then access <action>

		Examples:
		 				 | login      |	action	|
						 | admin      | granted	|
						 | manager    | granted	|
						 | staff      |	denied	|
						 | instructor | denied	|
						 | member     | denied	|
				
	# ---------------------------------
	# Package Maker - Package Template
	# ---------------------------------	
	@pkg_maker_list
	Scenario Outline: list (index) package templates only as a manager or an admin
		Given I am logged in as "<login>" with password "secret"
	  When I go to the package maker page
		Then access <action>
	  
	Examples:
	 				 | login      |	action	|
					 | admin      | granted	|
					 | manager    | granted	|
					 | staff      |	denied	|
					 | instructor | denied	|
					 | member     | denied	|
	
	@pkg_maker_new
	Scenario Outline: create a new package only as a manager or an admin
		Given I am logged in as "<login>" with password "secret"
	  When I go to new package template page
		Then access <action>
	  
	Examples:
	 				 | login      |	action	|
					 | admin      | granted	|
					 | manager    | granted	|
					 | staff      |	denied	|
					 | instructor | denied	|
					 | member     | denied	|
	
	@pkg_maker_edit
	Scenario Outline: edit an existing class only as a manager or an admin
		Given I am logged in as "<login>" with password "secret"
		And an existing package template
	 
		When I try to edit the package template
		Then access <action>

		Examples:
		 				 | login      |	action	|
						 | admin      | granted	|
						 | manager    | granted	|
						 | staff      |	denied	|
						 | instructor | denied	|
						 | member     | denied	|
	
		@pkg_maker_delete
		Scenario: allow delete an existing class only as an admin
			Given I am logged in as "admin" with password "secret"
			And an existing package template
			
			When I go to the package maker page
			And I click on "Destroy"
			Then access granted
			And I should see "Successfully removed!"
		
		@pkg_maker_hide_delete
		Scenario: hide delete an existing class if manager
			Given I am logged in as "manager" with password "secret"
			And an existing package template

			When I go to the package maker page
			Then I should not see "Destroy"
	
		@pkg_maker_deny_listing
		Scenario Outline: create a new package only as a manager or an admin
			Given I am logged in as "<login>" with password "secret"
		  When I go to new package template page
			Then access denied

		Examples:
		 				 | login      |
						 | staff      |
						 | instructor | 
						 | member     | 

# ---------------------------------
# 
# ---------------------------------
