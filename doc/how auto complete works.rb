flow:

fill auto complete triggers >

/working_calendar/auto_complete

def auto_complete
 
    @people = Person.find_people(@query)
    #
    # what the query returns? > an array of people including their packages and package_templates
    #
    #
     self.first_name_begins_with(value.downcase).ascend_by_last_name.all(:limit => 5) 
     
     def auto_complete
         @query = params[:q]
         @calendar_id = params[:calendar].to_i 
         @members = Person.find_people(@query)
         @with_pkgs = []
         @without_pkgs = []
         @members.each do |member| 
            #if member DOES NOT have a package for the current class (calednar), or at all =>  add to members_without_packages
            if member.packages.empty? || member.packages.any? {|pkg| pkg.calendar_id != @calendar_id || pkg.sessions == 0}
               @without_pkgs << member
            else
               @with_pkgs << member
            end
         end       
         render :file => "/working_calendar/auto_complete.json.erb"
     end
     

rendering the json >

