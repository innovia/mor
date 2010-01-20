Then /^I should show login form$/ do
  response.should have_selector("#login_window")
end

Then /^I should see restricted msg$/ do
  response.should contain("You must be logged in to access this page")
  response.should have_selector("#login_window")
end


Then /^access granted$/ do
  response.should_not contain("You don't have privleges to use this feature")
end

Then /^access denied$/ do
  response.should contain("You don't have privleges to use this feature")
end

Given /^an existing class$/ do
  @monqi_class = MonqiClass.make
end

When /^I try to edit the class$/ do
  visit edit_monqi_class_path(@monqi_class)
end

Then /^I should see the existing class$/ do
  response.should contain @monqi_class.title
  response.should contain @monqi_class.description
end

Given /^an existing package template$/ do
  @package_template = PackageTemplate.make
end

When /^I try to edit the package template$/ do
  visit edit_package_template_path(@package_template)
end



