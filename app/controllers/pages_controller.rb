class PagesController < ApplicationController
  before_filter :preload_page
  before_filter :require_admin, :only => [:new, :edit, :create, :update, :destroy]
  
  #caches_page :index, :classes, :rates, :about_us, :schedule, :personal_training, :specials, :staff, :news, :contact_us
  
  def index
    @page = Page.find_or_create_by_title(action_name)
    @picture = Picture.new 
  end
  
  def classes
    @yoga = MonqiClass.category('Yoga')
    @cardio = MonqiClass.category('Cardio & Dance')
    @flex = MonqiClass.category('Flexibility & Strength')
  end
  
  def rates  
    @personal = Calendar.name_contains('personal').first.package_templates
    @group =  PackageType.name_contains('classes').first.package_templates
    @gym =  PackageType.name_contains('gym').first.package_templates 
    @unlimited = PackageType.name_contains('unlimit').first.package_templates 
  end
  
  def staff
    @staging = false
    @personal_trainers = Role.title_contains('personal').first.people
    @group_trainers = Role.title_contains('instructor').first.people - @personal_trainers
  end
  
  def preload_page
    @page = Page.find_or_create_by_title(action_name)
    @picture = Picture.new 
  end
    
  def show
    @page = Page.find(params[:id])
  end
  
  def new
    @page = Page.new
    @picture = Picture.new 
  end
  
  def create
    @page = Page.new(params[:page])
    if @page.save
      flash[:notice] = "Successfully created page."
      redirect_to @page.title.to_sym
    else
      render :action => 'new'
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
  
  def destroy
    @page = Page.find(params[:id])
    @page.destroy
    flash[:notice] = "Successfully destroyed page."
    redirect_to pages_url
  end
  
  private
  
  def get_all_packages
    PackageTemplate.all
  end
end
