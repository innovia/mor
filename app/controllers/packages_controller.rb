class PackagesController < ResourceController::Base
  belongs_to :person
  before_filter :require_user, :require_staff, :except => :index
  
    
  def index
    @person = Person.find(params[:person_id])
    @packages = @person.packages
  end
    
    
   def new
     @calendars = Calendar.find(:all, :order => "name ASC")
     @created_by = current_user.person.id
   end
   
   def create
     @person = Person.find(params[:person_id])
     if params[:package_type_id] == "2"
        # if package type is unlimited 
        # create 2 packages with a package type of unlimited
     
        @classes = @person.packages.new(params[:package])
        @classes.attributes = {:package_type_id => 1, :active => 1}
      
        @gym_use = @person.packages.new(params[:package])
        @gym_use.attributes = {:package_type_id => 3, :active => 1}
     
        if @classes.save and @gym_use.save
          wants.html { redirect_to person_packages_path(@person) }
        else
          flash[:error] = "did not save"
          render  "new"
        end       
     else
        @package = @person.packages.new(params[:package])
        @package.attributes = {:package_type_id => 1, :active => 1}
        # save a regular package
        respond_to  do |format|
          format.html {
            if @package.save
              flash[:notice] = "Successfully created..."
              redirect_to person_packages_path(@person)
            else
              flash[:error] = "did not save"
              render  "new"
            end
          }
          format.js {
             if @package.save
                flash[:notice] = "Successfully created..."
                render :layout => false
              else
                flash[:error] = "did not save"
                render  "new"
              end
          }
        end
        
     end   
     
    
   end
   
   def edit
      @package = Package.find(params[:id])
      @calendars = Calendar.find(:all, :order => "name ASC")
   end
   
   def show 
     @package = Package.find(params[:id])
     @created_by = @package.created_by
     @sold_by = Person.find(@created_by)
   end
   
   def extend_package_exp_date
     @pkg = Package.find(params[:id])
     @default_extension =  Date.today + 1.month
     render :layout => false
   end

   def pkg
     @selected_package_template = PackageTemplate.find(params[:package_template_id])
     @package_template_exp_date = @selected_package_template.expires_in
     @exp_date =  Time.now + @package_template_exp_date.months
     @cost = @selected_package_template.product.price
     render :layout => false
   end

   def on_the_fly
    @created_by = current_user.person.id
    @person_id = params[:id]
    @calendars = Calendar.find(:all, :order => "name ASC")
    render :layout => false
   end 
   
   def extend_with_penalty
    @package = Package.find(params[:id])
    current_sessions = @package.sessions
    @package.sessions = current_sessions -1
    @package.expiration_date = Date.new(params[:package]['expiration_date(1i)'].to_i, params[:package]['expiration_date(2i)'].to_i, params[:package]['expiration_date(3i)'].to_i )
    if @package.save
      flash[:notice] = "successfully reinstate package"
      redirect_to(person_packages_path(@package.person_id))
    else
      flash[:error] = "there was a problem saving the changes"
      redirect_to(person_packages_path(@package.person_id))
    end
   end
  
end

