def create_user(hash)
  #p :role => hash[:role], :member? => "member" == hash[:role], :roles => Role.all
  @user = User.make(:login => hash[:login], :password => hash[:password], :password_confirmation => hash[:password])
  @role = Role.find_by_title(hash[:role])
  @user.person.roles << @role
  @user.save!
end

Given /^the following user records$/ do |table|
  table.hashes.each do |hash|
    create_user(hash)
  end
end

Given /^I am logged in as "([^\"]*)" with password "([^\"]*)"$/ do |username, password|
     visit login_url  
     fill_in "Username", :with => username  
     fill_in "Password", :with => password  
     click_button "login"
end

Given /^I am a "([^\"]*)"$/ do |role|
  hash = {:login => "bobby", :password => "secret", :password_confirmation => "secret", :role => role}
  create_user(hash)
end

Then /^I should see member nav bar$/ do
  response.should_not have_selector("#manage_people")
  response.should_not have_selector("a", :content => "Package Maker")
  response.should_not have_selector("a", :content => "Package Types")
  response.should_not have_selector("a", :content => "Class Scheduler")
  response.should_not have_selector("a", :content => "Products")
end

Then /^I should see admin nav bar$/ do
  response.should have_selector("#manage_people")
  response.should have_selector("a", :content => "Stats")
end


Then /^I should see manager nav bar$/ do
  response.should have_selector("#manage_people")
  response.should_not have_selector("a", :content => "Stats")
end

Then /^I should see staff nav bar$/ do
  response.should have_selector("#manage_people")
  response.should_not have_selector("a", :content => "Stats")
  response.should_not have_selector("a", :content => "Class Scheduler")
  response.should_not have_selector("a", :content => "Package Types")
  response.should_not have_selector("a", :content => "Package Maker")
  response.should_not have_selector("a", :content => "Get Packages")
end

Then /^I should see instructor nav bar$/ do
  response.should_not have_selector("#manage_people")
  response.should_not have_selector("a", :content => "Package Maker")
  response.should_not have_selector("a", :content => "Package Types")
  response.should_not have_selector("a", :content => "Class Scheduler")
  response.should_not have_selector("a", :content => "Products")
end

