class EventsController < ResourceController::Base
  require 'vpim/rrule'
  before_filter :require_user, :require_staff,  :except => :fetch_classes
  
  def index
    @events = Event.paginate(:per_page => @settings.per_page , :page => params[:page])
  end

  def new
    get_calendars
    get_instructors
    get_monqi_classes_names
    @event = Event.new
  end

  def check_for_existing_events
     @error_count = 0
     @event_exist = ""
     params[:next_days].each_with_index do |schedule_date, i|            
       start_date =  Time.parse(schedule_date + " " + params[:start_time][i])          
         if Event.exists?(:start_date => start_date)
           @event_exist += "<p>#{schedule_date} #{params[:start_time][i]}</p>" 
           @error_count += 1
         end
     end
          
     case @error_count 
      when 1
         @msg  = "There's already a class which starts on: #{@event_exist} <p>Please change the time slots for this class</p>"
      when 1..30
        @msg  = "The following classes time slots has already been taken for: <br /> #{@event_exist} <p>Please change the time slots for these classes</p>"
      else
       @submit = true
     end 
  end
  
  def fetch_classes
    @date = Date.today#Date.parse(params[:current_date])
    @days =  Event.start_date_greater_than(@date.beginning_of_week).start_date_less_than(@date.end_of_week + 1).ascend_by_start_date
    @day_classes = @days.group_by { |t| t.start_date.beginning_of_day }
  end
  
  def create 
      msg = "<p>The class #{MonqiClass.find(params[:event][:monqi_class_id]).title}) has been scheduled for: </p><br />"
    params[:next_days].each_with_index do |schedule_date, i|            
      start_date =  Time.parse(schedule_date + " " + params[:start_time][i])  
      end_date = Time.parse(schedule_date + " " + params[:end_time][i])
           
      if params[:until].nil? 
        end_on_date = ''
      else 
        end_on_date = Time.parse(params[:until]).strftime("%Y%m%d")
      end
      
      if params[:freq] == 'Does not repeat'
        params[:freq] = 'daily'
        params[:count] = '1'
      end
   
      # BYMONTHDAY, BYMONTH      
      rule = "freq=#{params[:freq]};count=#{params[:count]};until=#{end_on_date};interval=#{params[:interval]};byday=#{params[:byday]};"

      # start_date and end_date must be the same date but with a end_date has a differnt time
      rrule_start = Vpim::Rrule.new(start_date, rule) #Create a repeting events for the start date/time
      rrule_end = Vpim::Rrule.new(end_date, rule)     #Create a repeting events for the end date/time
      
      msg += "<p>#{Person.find(params[:scheduled_instructor][i]).full_name} - #{start_date.strftime('%A').pluralize} #{params[:start_time][i]} - #{params[:end_time][i]} on: "
      
      rrule_start.each_with_index do |start_date_r, sequence| 
        @event = Event.new(params[:event])
        rrule_end.each_with_index do |end_date_r, counter|
      	  if counter == sequence #if the counter for rrule_end is the same as the counter(sequence) for rrule_start
      	    @event.end_date = end_date_r
      	  end   
      	end #end of rrule_end loop
      	@event.rrule = rule
      	@event.cancelled = 0
      	@event.allday = 0
      	@event.instructor_id = params[:scheduled_instructor][i]              
        @event.sequence = sequence
      	@event.start_date = start_date_r
      	
      	if @event.save
      	  msg += "#{@event.start_date.strftime("%m/%d")}"
      	  rrule_start.count == sequence + 1 ? msg +='</p>' :  msg +=', '
      	end
      end #end of rrule_start loop
    end #end of schedhule_date loop
    
    flash[:notice] = msg
    redirect_to :action => "index" 
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
    @event = Event.find(params[:id])   
    if params[:change_all_future]
     @current_event = @event
     @all_events = @current_event
     
     @all_events.each do |update_event|
       if update_event.sequence >= @event.sequence 
         update_event.update_attributes(params[:event])
       end
     end
      flash[:notice] = "updated all future classes ..."
    else
        if @event.update_attributes(params[:event])
        flash[:notice] = 'the class was successfully updated.'
       redirect_to session[:last_ref_page]
      end
    end
  end
    
  def cancel
    @event = Event.find(params[:id])
    @event.update_attribute('cancelled', 't')
    render :layout => false 
  end
   
  def reinstate
    @event = Event.find(params[:id])
    @event.update_attribute('cancelled', 'f')
    render :layout => false 
  end
  
  def sub_form
      @instructors = Role.find_by_title('instructor').people.ascend_by_last_name
      render :layout => false
  end

  def sub
    @event = Event.find(params[:event_id])
    @event.sub_instructor_id = params[:sub_instructor]
    @event.save
    
    #TODO sub for this event or for all
  end
 
end



