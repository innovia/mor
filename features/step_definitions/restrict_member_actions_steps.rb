Given /^I am logged in as a (.*)$/ do |role|
  @user = User.make
  @role = Role.find_by_title(role)
  @user.person.roles << @role
  @user.save!
end