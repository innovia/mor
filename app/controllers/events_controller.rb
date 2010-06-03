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
    # next_days is an array of dates to schedule
    # scheduled instructor is an array of instructors
    params[:next_days].each_with_index do |schedule_date, i|            
      @start_date =  schedule_date + " " + params[:start_time]   
      @end_date = schedule_date + " " + params[:end_time]

      unless params[:byday].nil? or params[:byday].empty?
        params[:byday] = params[:byday].join(",")
      else
        params[:byday] = ''
      end
      
      @rule  = generate_rule(params[:repeat], params[:count], params[:r_until], params[:r_until], params[:byday], params[:bymonthday], params[:bymonth])
      unless @rule.nil?
        # start_date and end_date must be the same date but with a end_date has a differnt time
        @rrule_start = Vpim::Rrule.new(@start_date, @rule) #Create a repeting events for the start date/time
     	  @rrule_end = Vpim::Rrule.new(@end_date, @rule)     #Create a repeting events for the end date/time
     	  
     	  rrule_start.each_with_index do |start_date_r, sequence| 
     	    @event = Event.new
       	  @rrule_end.each_with_index do |end_date_r, counter|
       		  if counter == sequence #if the counter for rrule_end is the same as the counter(sequence) for rrule_start
       		    @event.end_date = end_date_r
       		  end   
       		end #end of rrule_end loop
       		@event.instructor_id = params[:scheduled_instructor][i]              
          @event.sequence = sequence
        	@event.start_date = start_date_r
        	@event.save
        end #end of rrule_start loop
      end #end of unless wrapper
    end #end of schedhule_date loop
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
 
 
protected
  def generate_rule(selected_frequency, end_after, end_on_date, repeat_every, selected_days, day_of_the_month, by_month)
    debugger
     if selected_frequency == 'none'
      # RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
      selected_freq = 'YEARLY'
     end
          
     repeat_every = "" if repeat_every.nil?

     count = 'COUNT=' + end_after.to_s   + ';'  
     
     unless end_on_date.nil?
       runtil = 'UNTIL=' + end_on_date.strftime("%Y%m%d;") 
     end
     
     @rule ='FREQ='  + selected_frequency + ';' +
             count unless count.nil? 
             
             runtil unless runtil.nil? +
            'INTERVAL=' + repeat_every.to_s + ';' +
            'BYDAY=' + selected_days  + ';' +
            'BYMONTHDAY=' + day_of_the_month + ';' +
            'BYMONTH=' +  by_month + ';'
   end
end



