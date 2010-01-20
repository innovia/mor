When /^I fill up the required fields$/ do
 fill_in("person_first_name", :with =>  "ami")
 fill_in("person_last_name", :with => "mahloof")
 fill_in("user_email", :with => "ami.mahloof@gmail.com")
 fill_in("user_login", :with => "ami123")
end