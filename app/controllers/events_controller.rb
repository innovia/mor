class EventsController < ResourceController::Base
  before_filter :require_user, :require_staff
  
  def index
    @events = Event.paginate(:per_page => @settings.per_page , :page => params[:page])
  end

  def new
    get_calendars
    get_instructors
    get_monqi_classes_names
    @event = Event.new
  end

   def create   
    @event = Event.new(params[:event])
    # date and time fields are spilted on the form, so rejoin for proper sql storage      
    
    
    
    
    params[:next_days].each_with_index do |schedule_date, i|
         @event.start_date =  schedule_date + " " + params[:start_time]
         @event.end_date = schedule_date + " " + params[:end_time]
         @event.instructor_id = params[:scheduled_instructor][i]
          
        @event.save
    end
   end
   
   
   #iCal Post Operations
     def manually_serialize_byday
      unless params[:byday].nil? or params[:byday].empty?
        params[:byday] = params[:byday].join(",")
      else
        params[:byday] = ''
      end
     end


     def add_events
       rule  = generate_rule(params[:repeat], params[:count], params[:r_until], params[:r_until], params[:byday], params[:bymonthday], params[:bymonth])

       unless rule.nil?
         # start_date and end_date must be the same date but with a end_date has a differnt time
         # so we need to create to rrules objects for each set of days.

     	  rrule_start = Vpim::Rrule.new(start_date, rule) #Create a repeting events for the start date/time
     	  rrule_end = Vpim::Rrule.new(end_date, rule)     #Create a repeting events for the end date/time

     	  rrule_start.each_with_index do |start_date_r, sequence| 
       	  @event = Event.new

       		rrule_end.each_with_index do |end_date_r, counter|
       		  if counter == sequence #if the counter for rrule_end is the same as the counter(sequence) for rrule_start
       		    @event.end_date = end_date_r
       		  end   
       		end #end of rrule_end loop

       		@event.instructor_id = instructor_id
       		@event.sequence = sequence
     	    @event.event_template_id = id
     	    @event.start_date = start_date_r
     	    @event.save
       	end #end of rrule_start loop
       end #end of unless wrapper
     end

     def generate_rule(selected_frequency, end_after, end_on_date, repeat_every, selected_days, day_of_the_month, by_month)
       # set the frequency based on the repeat option
       # there's no need to check if repeat is none since its set by the after_create to jump to the add_single_event method

       if selected_frequency == "custom" 
          frequency = freq 
       else  
          frequency = selected_frequency
       end

       end_after = "" if end_after.nil? 
       repeat_every = "" if repeat_every.nil?
       end_on_date = "" if end_on_date.nil?

       rule = 'FREQ='  + frequency   + ';' +
              'COUNT=' + end_after.to_s   + ';' +
              'UNTIL=' + end_on_date.strftime("%Y%m%d;") +
              'INTERVAL=' + repeat_every.to_s + ';' +
              'BYDAY=' + selected_days  + ';' +
              'BYMONTHDAY=' + day_of_the_month + ';' +
              'BYMONTH=' +  by_month + ';'
     end
   
   
   
   
   
   
   
   
    
  def show
    @event = Event.find(params[:id])
  end
  
  def edit
     get_monqi_classes_names
     get_instructors
     @event = Event.find(params[:id])
  end
  
  def update
    get_instructors
    @event = Event.find(params[:id])
    
    if params[:change_all_future]
     @current_event_template = @event.event_template
     @all_events = @current_event_template.events
     
     @all_events.each do |update_event|
       if update_event.sequence >= @event.sequence 
         update_event.update_attributes(params[:event])
       end
     end
      flash[:notice] = "updated all future classes ..."
      #render :action => 'edit'
      #redirect_to :back
    else
        if @event.update_attributes(params[:event])
        flash[:notice] = 'the class was successfully updated.'
       # render :action => 'show'
       redirect_to session[:last_ref_page]
      end
    end
  end
  
  
  def cancel
    @event = Event.find(params[:id])
    @event.update_attribute('cancelled', '1')
    get_calendars
    get_instructors
    
    respond_to  do |format|
      format.html { redirect_to home_path }
      format.js { render :layout => false }
    end 
  end
  
  def cancel_class  
    modalbox_prep
  end
  
  def reinstate
    @event = Event.find(params[:id])
    @calendar = @event.event_template.calendar
    @event.update_attribute('cancelled', '0')
    get_calendars
    get_instructors

    respond_to  do |format|
        format.html { redirect_to home_path }
        format.js { render :layout => false }
    end
  end
  
  def reinstate_class
    modalbox_prep
  end

  def substitue_form
    @event = Event.find(params[:id])
  end
 
end










require'vpim/rrule'
class EventTemplatesController < ResourceController::Base
  
    
   
    
    def create   
      @event_template = EventTemplate.new(params[:event_template])
      #debugger
      # date and time fields are spilted on the form, so rejoin for proper sql storage      
      params[:next_days].each_with_index do |schedule_date, i|
         @event_template.start_date =  schedule_date + " " + params[:start_time]
         @event_template.end_date = schedule_date + " " + params[:end_time]
         @event_template.instructor_id = params[:scheduled_instructor][i]
         debugger
          #flash[:notice] = ""
          @event_template.save
          #flash[:notice] += schedule_date + ' was schedule ' 
         #   if params[:next_days].last == i 
        #      flash[:notice] += 'the last class was successfully scheduled.'
        #      redirect_to event_template_events_path()
        #    end  
        # else
        #   get_calendars
        #   get_instructors
        #   get_monqi_classes_names
         #  render :action => "new" 
         #end
      end
    end
    

  
end