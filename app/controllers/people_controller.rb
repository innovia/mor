class PeopleController < ResourceController::Base
  before_filter :require_user, :require_staff, :except => 'show'
  
  def index 
     @role = Role.find(params[:role_id])
     @people = @role.people.ascend_by_last_name 
   rescue ActiveRecord::RecordNotFound
     @people = Person.order("last_name ASC")
  end
  
  def show
    @person = Person.find(params[:id])  
    respond_to do |wants|
      wants.html {
        
         bv = case @person.birthday_visibility
          	when /full/ then bv =	"%B %d, %Y"
          	when /only/ then bv = "%B %d"
          	else ""
          end 
          
          unless @person.dob.nil?
            @birthday = @person.dob.strftime(bv)
          end
      }
      wants.js {
         render  :layout => false
      }
      
    end
  end
  
  def edit
    @person = Person.find(params[:id]) 
    @person.dob.nil? ? "" : @person.dob.strftime("%m/%d/%Y")  
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