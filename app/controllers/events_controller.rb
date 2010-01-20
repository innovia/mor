class EventsController < ResourceController::Base
  belongs_to :event_template
  before_filter :require_user, :require_staff
  
   
  def index
      if params[:event_template_id]
        @event_template = EventTemplate.find(params[:event_template_id])
        @events = @event_template.events.paginate(:per_page => @settings.per_page , :page => params[:page])
      else
        @events = Event.paginate(:per_page => @settings.per_page , :page => params[:page])
      end
  end

  def new
     @instructors = Instructor.find(:all)
  end
   
  def show
    @event = Event.find(params[:id])
  end
  
  def edit
     @instructors = Instructor.find(:all)
     @event = Event.find(params[:id])
  end
  
  def update
    @instructors = Instructor.find(:all)
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
  
  def delete_form
    modalbox_prep
  end
  
  def delete_personal_training_session
    modalbox_prep
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
