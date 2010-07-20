class PagesController < ApplicationController
  before_filter :preload_page
  before_filter :require_admin, :only => [:new, :edit, :create, :update, :destroy]
    
  def index
    @news_flash = Page.find_or_create_by_title('news_flash').body
  end
  
  def remove_attachment
    @page = Page.find(params[:id])
    @page.update_attribute(:page_attachment, nil)
    render :nothing => true
  end
  
  def schedule_feed
    @events = Event.all(:include => [:monqi_class, :instructor])
    render :file => "/pages/schedule_feed.json.erb"
  end

  
  def pt_request
    @pt_req = params
    Notifier.deliver_personal_training_online_request(@pt_req)
    redirect_to :thank_you
  end
  
  def classes
    @yoga = MonqiClass.category('Yoga')
    @cardio = MonqiClass.category('Cardio & Dance')
    @flex = MonqiClass.category('Flexibility & Strength')
  end
  
  def rates  
    @group = rates_for_pkg('Group Classes')
    @gym =  rates_for_pkg('Gym Use')
    @personal = rates_for_pkg('Personal Training')
    @unlimited = rates_for_pkg('Unlimited and Gym Use')
  end
  
  def staff
    @personal_trainers = Role.title_contains('personal').first.people.ascend_by_last_name
    @group_trainers = Role.title_contains('instructor').first.people.ascend_by_last_name - @personal_trainers
    @instructor_role = Role.title_contains('instructor')
    @pt_role = Role.title_contains('personal')
  end
    
  def show
    @page = Page.find(params[:id])
  end
   
  def create
      if  params[:page][:title] == "contact_us"
      @contact = params
      Notifier.deliver_contact_us_form(@contact)
      flash[:notice] = "Sent"
      redirect_to :thank_you
    else
      @page = Page.new(params[:page])
      if @page.save
        flash[:notice] = "Successfully created page."
        redirect_to @page.title.to_sym
      else
        render :action => 'new'
      end
    end    
  end
  
  def edit
    @page = Page.find(params[:id])
  end
  
  def update
    @page = Page.find(params[:id])
    if @page.update_attributes(params[:page])
      if  @page.title == "index"
        page_origin = pages_path
      else
        page_origin = @page.title.to_sym
      end
      flash[:notice] = "Successfully updated page."
     
      redirect_to page_origin
    else
      render :action => 'edit'
    end
  end
   
private 
  def preload_page
    @page = Page.find_or_create_by_title(action_name)
    @picture = Picture.new 
  end
  
  def get_all_packages
    PackageTemplate.all
  end
  
  def rates_for_pkg(pkg_type)
    PackageType.find_by_name(pkg_type).package_templates
  end
end
