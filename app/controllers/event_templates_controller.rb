require'vpim/rrule'
class EventTemplatesController < ResourceController::Base
  before_filter :require_user, :require_staff
  
    def index
      @event_templates = EventTemplate.paginate(:per_page => @settings.per_page , :page => params[:page])
    end
    
    def new
        get_calendars
        get_instructors
        get_monqi_classes_names
        @event_template = EventTemplate.new
    end
    
    def create   
      @event_template = EventTemplate.new(params[:event_template])

      # date and time fields are spilted on the form, so rejoin for proper sql storage      
      unless params[:start_at].blank? and params[:end_at].blank?
        @event_template.start_date =  params[:start_at] + " " + params[:start_time]
        @event_template.end_date = params[:end_at] + " " + params[:end_time]
      end

      if @event_template.save!
        flash[:notice] = 'the class was successfully scheduled.'
        redirect_to event_template_events_path(@event_template)
      else
        get_calendars
        get_instructors
        get_monqi_classes_names
        render :action => "new" 
      end
    end
        
    def edit
    get_calendars
    get_instructors
    get_monqi_classes_names
    get_event
  end
  
    def cal_view
      
    end
  
    def delete_form
      get_event
      render :layout => false
    end
  
  def quick_add
    @personal = EventTemplate.new(params[:event_template])
    @personal.save
    default_calendar
    @nav_date = Date.today
    @calendar =  Calendar.find_events_for(@cal_id, @nav_date)
    get_instructors
    get_calendars
    #render :template => '/working_calendar/set_calendar.js.rjs'
  end
  
  protected
  
  def get_event
    @event_template = EventTemplate.find(params[:id])
  end
  
  def get_monqi_classes_names
    @classes = MonqiClass.all(:select => "id, title")
  end
    
  def delete_personal_training_session
    @personal = EventTemplate.find(params[:id])
    @personal.destroy
    default_calendar 
    @nav_date = Date.today
    @calendar =  Calendar.find_events_for(@cal_id, @nav_date)
    get_instructors
    get_calendars
    #render :template => '/working_calendar/set_calendar.js.rjs'
  end
  
end