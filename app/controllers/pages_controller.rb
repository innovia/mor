class PagesController < ApplicationController
  before_filter :preload_page
  
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
    @group =  Calendar.name_contains('group').first.package_templates
    @gym =  PackageType.name_contains('gym').first.package_templates 
    @unlimited = PackageType.name_contains('unlimit').first.package_templates 
    @chiropractic = Calendar.name_contains('chiro').first.package_templates
    @nutritional = Calendar.name_contains('nutrition').first.package_templates
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
