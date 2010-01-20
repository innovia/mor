class PeopleController < ResourceController::Base
  before_filter :require_user, :require_staff
  
  def index 
     @role = Role.find(params[:role_id])
     @people = @role.people
   rescue ActiveRecord::RecordNotFound
     @people = Person.all
  end
  
  
  def new
    @roles = Role.all
    @member = Role.find_by_title("member").id
  end
  
  
  def create
    @person = Person.new(params[:person])
    @person.roles << Role.find(params[:roles])
 
    unless params[:person][:dob].blank?
      @person.dob  =  Date.parse(params[:person][:dob])
    end
    respond_to do |wants|
      if @person.save
        flash[:notice] = 'Successfully created.'
        wants.html { redirect_to(@person) }
      else
        wants.html { render :action => "new" }
      end
    end
  end
  
  def update
    @person =  Person.find(params[:id])
    unless params[:person][:dob].empty?
      params[:person][:dob] = Date.parse(params[:person][:dob])
    end
    if @person.update_attributes(params[:person])
        flash[:notice] = "Successfully updated..."
        redirect_to :action => "show"
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