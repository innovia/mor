class CalendarsController < ResourceController::Base
  before_filter :require_user, :require_staff
  
   def index
   @nav_date.nil? ? @nav_date = Date.today : @nav_date = params[:selected_day]
   get_calendars
   
   # show all events from all calendars on the index page
    respond_to do |wants|
      wants.html { show_today_events_for_calendar(:all, @nav_date) }
      wants.js   { show_today_events_for_calendar(:all, params[:selected_day])
                  render  :partial => "calendar_collection" }
    end
  end
   
   def show
     @nav_date.nil? ? @nav_date = Date.today : @nav_date = params[:selected_day]
     get_calendars
   
    # Show will load like index but for a selected calendar     
    respond_to do |wants|
      wants.html {
                  @current_calendar = Calendar.find(params[:id])
                  show_today_events_for_calendar(params[:id], Date.today) }
      wants.js {
                 show_today_events_for_calendar(params[:id], params[:selected_day])
                 render  :partial => "calendar_collection"
                }
    end
   end
   
   def manage
    @calendars = Calendar.all
   end
   
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
       render :file => "/calendars/auto_complete.json.erb"
   end
   
   def add_member_to_class
    @event = Event.find(params[:event_id])
    @member = Person.find(params[:member_id])
    #charge_session() will check and will not charge the session, if there are no more sessions => display error
    charge_session(@event, @member)
     respond_to do |format|
      format.html {render :index}
      format.js{
        render :layout => false
        }
     end
   end

   def remove_member_from_class
     @event = Event.find(params[:event_id])
     @member = Person.find(params[:member_id])

     # check remove status
      get_cancellation_window(@event)
      if @event.start_date <= Time.now - @cancellation_window.hours
        credit_session(@event, @member)  #actual removal and credit for session
        @ok_to_remove = true
      end

     respond_to do |format|
      format.html {render :index}
      format.js{render :layout => false}
    end
   end
   
   def sub_instructor
     @event = Event.find(params[:id])
     @instructor = Instructor.find(params[:instructor_id])
     @event.instructor = @instructor
     @event.save
     get_instructors
   end

   def self_sign_up
      get_cancellation_window
      @cancellation_deadline = @event.start_date - @cancellation_window.hours
      render :layout => "modalbox"
   end

   protected

   def get_cancellation_window(event)
     @event = event
      cal_id = @event.event_template.calendar_id
      if cal_id == 2
        @cancellation_window = @settings.personal_training_calendar_disable_attendant_removal_window
      else
        @cancellation_window = @settings.group_calendar_disable_attendant_removal_window
      end
   end

   private     
   
   def charge_session(event, person)
     unless person.packages.empty? # first check if member has any packages
       @selected_pkg = expires_first(person.packages)
         if @selected_pkg.sessions == 0
            @selected_pkg.active = false
            # person does not have any sessions left
            @no_sessions_left = true
            return
         else
            @selected_pkg.sessions -= 1
         end
         
         if @selected_pkg.save! 
           event.people << person
           event.packages << @selected_pkg
         end
     else
       @person_without_packages = person
     end
   end
   
   def credit_session(event, person)
     @pkgs = person.packages
       @selected_pkg = expires_first(@pkgs)
       if @selected_pkg.sessions == 0
         @selected_pkg.active = true
       end
       @selected_pkg.sessions += 1
       if @selected_pkg.save!
         event.people.delete(person) 
         event.packages.delete(@selected_pkg) 
       end
   end
   
   protected
   
   def show_today_events_for_calendar(selected_calendar, date)
     # find all events for the selected calendar with the requested date 
     # cal.events.start_date_greater_than('2009-12-01').start_date_less_than('2009-12-02')
     # e.start_date_less_than(d).start_date_greater_than(d -1.day)  
     get_instructors
     get_calendars
     if selected_calendar == :all
        @calendar = []
        @calendars.each do |c|
          if c.events.empty?
            return
          else
            @calendar << c.events.start_date_less_than(date).start_date_greater_than(date - 1.day)
            @calendar = @calendar.flatten
          end
        end
     else
       c = Calendar.find(selected_calendar)
       @calendar = c.events.start_date_less_than(date.to_date).start_date_greater_than(date.to_date - 1.day)
     end
   end

end