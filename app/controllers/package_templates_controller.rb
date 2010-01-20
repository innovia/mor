class PackageTemplatesController < ResourceController::Base
   before_filter :require_user
   before_filter :require_manager
   
   
      
    def index
      @package_templates = PackageTemplate.paginate(:per_page => @settings.per_page , :page => params[:page], :order => 'calendar_id')
    end
    
    def new
      @calendars  = Calendar.all
      @package_types = PackageType.all
      @package_template = PackageTemplate.new
    end
    
    
    def create
     @package_template = PackageTemplate.new(params[:package_template])
     @package_template.build_product({  :title => @package_template.calendar.name,
                                        :description => @package_template.description,
                                        :price => @package_template.cost
                                      })
       if @package_template.save
        flash[:notice] = @package_template.package_type.name.capitalize + " Package template successfully created..."
        redirect_to package_templates_path
       else
         flash[:error] = "Could not create the package template"
         get_calendars
         @package_types = PackageType.all
         render :action => "new"
      end
   end
    
    def edit
      @calendars  = Calendar.all
      @package_types = PackageType.all
      @package_template = PackageTemplate.find(params[:id])
    end
    
    def by_calendar
      @package_templates = PackageTemplate.find_all_by_calendar_id(params[:calendar_id])
      render :layout => false 
    end
         
end 