class ProductsController < ResourceController::Base
  ###before_filter :login_required
  ##require_role ["Admin", "StaffMember" ,"Member" ,"Instructor" ,"Manager"], :except => [:index, :show]
  
  def index
   @products = Product.paginate(:per_page => @settings.per_page , :page => params[:page] || 1, :order => 'title')
  end
 
 
end