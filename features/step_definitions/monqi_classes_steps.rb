Given /^I have a role of an admin$/ do
  current_user.person.roles.name_contains("admin")
end

When /^I click the "([^\"]*)" button$/ do |arg1|
  pending
end
