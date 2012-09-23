class AddressesController <  ActionController::Base
  protect_from_forgery

  before_filter :require_user, :find_person, :require_staff
  
  def show
    @address = @person.address
  end

  def create
    if current_user
      find_person
    end
    @address = @person.build_address(params[:address])
      if @address.save
        flash[:notice] = 'Address was successfully created.'
        redirect_to :action => "show"
      else
        render :action => "new"
      end
  end
  
  def edit
    find_person
    @address = @person.address
  end

  def update
    edit
    if @address.update_attributes(params[:address])
      flash[:notice] = "Successfully updated..."
      redirect_to :action => "show"
    else
      flash[:error] = "could not update the address"
      render  :action => "edit"
    end 
  end

protected
  def find_person
    get_parent_id
    if @person_type
      @person = Person.find(@person_type)
    end
  end
  
  def get_parent_id
    @person_type = params[:person_id] || params[:admin_id] || params[:manager_id] || params[:staff_member_id] || params[:instructor_id] || params[:member_id]
  end
end
