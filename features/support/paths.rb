module NavigationHelpers
  # Maps a name to a path. Used by the
  #
  #   When /^I go to (.+)$/ do |page_name|
  #
  # step definition in web_steps.rb
  #
  def path_to(page_name)
    case page_name

    when /home page/ then '/'
    when /account page/ then account_path
    when /the login page/ then login_path
    when /the signup form/ then new_account_path
    when /the stats page/ then stats_path
    when /classes page/ then monqi_classes_path
    when /new class page/ then new_monqi_class_path
    when /new package template page/ then  new_package_template_path
    when /the package maker page/ then package_templates_path
    when /the calendars page/ then calendars_path
    when /the schedule page/ then schedule_beta_path
    
    else
      raise "Can't find mapping from \"#{page_name}\" to a path.\n" +
        "Now, go and add a mapping in #{__FILE__}"
    end
  end
end

World(NavigationHelpers)
