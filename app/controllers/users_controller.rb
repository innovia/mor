class UsersController < ApplicationController
  before_filter :require_admin, :only => [:destroy]
  before_filter :require_no_user, :only => [:new, :create]
  before_filter :require_user,  :only => [:show, :edit, :update]
  
    
  def index 
     @role = Role.find(params[:role_id])
     @users = @role.users
   rescue ActiveRecord::RecordNotFound
     @users = User.all
  end
  
  def new
    @user = User.new
  end
  
  def create
     @user = User.new(params[:user])
      if params[:existing_member]
        @user.person_id = params[:existing_member]
      else
        @user.person = Person.new(params[:person])
        role = Role.find_by_title('member')
        @user.person.roles << role
        @user.person.email = params[:user][:email]  
        @user.password = rand(10)
        @user.password_confirmation = @user.password      
      end

      if @user.signup!(params)
            @user.deliver_activation_instructions!
            flash[:notice] = "Thank you #{@user.person.first_name.capitalize} for signing up! Please check your email to activate your account before logging in."
            redirect_to root_url
          else
            flash[:error] = "There was a problem creating your account."
            render :action => :new
          end
  end
  
  def show
    @user = @current_user
    @person = @user.person
    @packages = @person.packages
  end

  def edit
    @user = User.find(params[:id])
  end
  
  def update
      @user = @current_user # makes our views "cleaner" and more consistent
    if @user.update_attributes(params[:user])
      flash[:notice] = "Account updated!"
      redirect_to account_url
    else
      render :action => :edit
    end
  end
  
  def upload_photo
    @person = Person.find(params[:id])
    render :layout => false
  end
  
  def captcha
    # in case that form isn't submitted this file will create a random number and save it in session
    @rnd = rand(5)
    render :layout => false
  end
end
