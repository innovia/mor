class PeopleController < ResourceController::Base
  before_filter :require_user, :require_staff, :except => 'show'
  
  def index
        @role = Role.find(params[:role_id])
        @people = @role.people.ascend_by_last_name 
        @people = Person.order("last_name ASC")      
  end
  
  def show
    @instructor_role = Role.find_by_title('instructor')
    @person = Person.find(params[:id])  
    respond_to do |wants|
      wants.html {}
      wants.js { render  :layout => false }
    end
  end
  
  def edit
    @person = Person.find(params[:id]) 
    @person.dob.nil? ? "" : @person.dob.strftime("%m/%d/%Y")  
    get_roles_and_bday_options
  end
  
  def new
    @person = Person.new
    @member_role = Role.find_by_title("member")
    get_roles_and_bday_options
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

  def remove_profile_pic
    @person = Person.find(params[:id])
    @person.update_attribute(:photo, nil)
    render :nothing => true
  end

private

  def get_roles_and_bday_options
    @roles = @person.roles
    @bday_options = ["Show my full birthday in my profile.", "Show only month & day in my profile.", "Don't show my birthday in my profile."]
  end
end