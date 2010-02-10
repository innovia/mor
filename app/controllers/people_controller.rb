class PeopleController < ResourceController::Base
  before_filter :require_user, :require_staff
  
  def index 
     @role = Role.find(params[:role_id])
     @people = @role.people
   rescue ActiveRecord::RecordNotFound
     @people = Person.all
  end
  
  def show
    respond_to do |wants|
      wants.js {
        @person = Person.find(params[:id])
         render  :layout => false
      }
      
    end
  end
  
  def edit
    @person = Person.find(params[:id])
    @roles = @person.roles
  end
  
  def new
    @person = Person.new
    @roles = @person.roles
    @member_role = Role.find_by_title("member")
  end
    
  def create
    @person = Person.new(params[:person])
 
    unless params[:person][:dob].blank?
      @person.dob  =  Date.parse(params[:person][:dob])
    end

      if @person.save
        flash[:notice] = 'Successfully created.'
        redirect_to(@person)
      else
        render :action => "new" 
      end
  end
  
  def update
    #if the next line return nil? set the role_ids to an empty array
    params[:person][:role_ids] ||= []
    @person =  Person.find(params[:id])
    unless params[:person][:dob].empty?
      params[:person][:dob] = Date.parse(params[:person][:dob])
    end
    
    if @person.update_attributes(params[:person])
        flash[:notice] = "Successfully updated..."
        redirect_to :action => "show", :id => @person
      else
        flash[:error] = "could not update"
        render  :action => "edit"
      end
  end

  def vcard
    @person = Person.find(params[:id])
    render  :layout => false   
  end
  
end