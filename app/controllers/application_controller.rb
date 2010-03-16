class ApplicationController < ActionController::Base
  #include SslRequirement
    
  before_filter :find_cart, :load_settings
  
  filter_parameter_logging :credit_card, :password, :password_confirmation, :old_password, :email
  
  helper_method :admin?, :manager?, :staff?, :member?, :today, :current_user_session, :current_user, :all_roles
  
  def modalbox_prep
    @event = Event.find(params[:id])
    render :layout => false
  end
  
  def enable_features
     if simple_captcha_valid?
       @show_unlock_form = true
     else
       @show_unlock_form = false
     end
    render :layout => false
  end
    
protected
    def all_roles
      @roles = Role.all
    end
    
    def admin?
      unless current_user.nil?
        current_user.person.roles.find_by_title("admin")
      end
    end
    
    def manager?
      unless current_user.nil?
        !current_user.person.roles.title_like_any("admin", "manager").empty?
      end
    end
    
    def member?
      unless current_user.nil?
        current_user.person.roles.find_by_title("member")  
      end 
    end
    
    def staff?
      unless current_user.nil?
        !current_user.person.roles.title_like_any("admin", "manager", "staff_member").empty?
      end
    end
    
    def get_calendars
      @calendars = Calendar.all
    end

    def get_instructors
      @instructors = Role.find_by_title("instructor").people
    end
    
    def find_cart
      if ! current_user.nil? and !current_user.person.nil?
          # if person has no cart create it, else fetch it
          if ! current_user.person.carts.find_by_state('open')
            @cart = current_user.person.carts.new
            @cart.save!
          else
            @cart = current_user.person.carts.find_by_state('open')
          end
        @cart
      end
    end
    
    def load_settings
      @settings = Settings.load
    end
    
    def today
      @date = Date.today
    end
    
private

 def current_user
    return @current_user if defined?(@current_user)
    @current_user = current_user_session && current_user_session.record
 end

 def current_user_session
    return @current_user_session if defined?(@current_user_session)
    @current_user_session = UserSession.find
 end

 def permission_denied
     store_location
     flash[:error] = "You don't have privleges to use this feature"
     redirect_back_or(account_path)
 end  
  
 def require_admin
   if current_user
     #if someone is logged in, unless he is an admin denied permission
     unless current_user.person.roles.find_by_title("admin")
       permission_denied
     end
   end
end

  def require_manager
      if current_user.person.roles.title_like_any("manager", "admin").empty?
          permission_denied
      end
  end
  
  def require_staff
    if current_user
      if current_user.person.roles.title_like_any("staff", "manager", "admin").empty?
        permission_denied
      end
    end
  end
  
  def require_member  
    if current_user
      unless current_user.person.roles.title_like_any("member", "staff", "manager", "admin")
        permission_denied
      end
    end
  end
  
  def require_user
    unless current_user
      store_location
      flash[:notice] = "You must be logged in to access this page"
      redirect_to new_user_session_url
      return false
    end
  end
 
  def require_no_user
    if current_user
      store_location
      flash[:notice] = "You must be logged out to access this page"
      redirect_to login_url
      return false
    end
  end

  def store_location
    session[:return_to] = request.request_uri
  end

  def redirect_back_or(path)
  redirect_to :back
  rescue ActionController::RedirectBackError
  redirect_to path
  end

  def redirect_back_or_default(default)
    redirect_to(session[:return_to] || default)
    session[:return_to] = nil
  end
end
