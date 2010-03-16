# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def set_birthday_visibility(person)
     bv = case person.birthday_visibility
      	when /full/ then bv =	"%B %d, %Y"
      	when /only/ then bv = "%B %d"
      	else ""
      end 
      
      unless person.dob.nil?
        @birthday = person.dob.strftime(bv)
      end
  end
end
