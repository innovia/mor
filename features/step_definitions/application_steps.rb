Given /^no user is logged in$/ do
    UserSession.find.nil?
end

Given /^the default settings$/ do
  Settings.make
end

Given /^the default Roles$/ do
   Role.create({:id => 1, :title => "admin"})
   Role.create({:id => 2, :title => "manager"})
   Role.create({:id => 3, :title => "staff_member"})
   Role.create({:id => 4, :title => "instructor"})
   Role.create({:id => 5, :title => "member"})
   Role.create({:id => 6, :title => "developer"})
end