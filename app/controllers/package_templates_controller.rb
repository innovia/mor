class PackageTemplatesController < ResourceController::Base
   before_filter :require_user
   before_filter :require_manager
       
    def index
      @package_types = PackageType.all
    end
    
    def fetch_packages
      @pkg_type = params[:pkg_type]
      @package_templates =  PackageType.name_is(@pkg_type).first.package_templates
    end
    
    def sort
       params[:package_template].each_with_index do |id, index|
         PackageTemplate.update_all(['sort_index=?', index+1], ['id=?', id])
       end
       render :nothing => true
    end
    
    def new
      @pkg_types = PackageType.all
      @package_template = PackageTemplate.new
    end
       
    def create
     @package_template = PackageTemplate.new(params[:package_template])
     @pkg_type = PackageType.find(params[:package_template][:package_type_id]).name
     ptype = @pkg_type.include? "Personal" 
     ptype ? cal = Calendar.name_contains("Personal").first : cal = Calendar.name_contains("group").first
     @package_template.calendar = cal
     @package_template.build_product({  :title => @package_template.calendar.name,
                                        :description => @package_template.description,
                                        :price => @package_template.cost
                                      })
       if @package_template.save
        flash[:notice] = @package_template.package_type.name.capitalize + " Package template successfully created..."
        redirect_to package_templates_path
       else
         flash[:error] = "Could not create the package template"
         @pkg_types = PackageType.all
         render :action => "new"
      end
   end
    
    def edit
      @pkg_types = PackageType.all
      @package_template = PackageTemplate.find(params[:id])
    end
    
    def by_calendar
      @package_templates = PackageTemplate.find_all_by_calendar_id(params[:calendar_id])
      render :layout => false 
    end
         
end 