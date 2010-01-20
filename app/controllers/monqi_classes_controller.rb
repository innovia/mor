class MonqiClassesController < ResourceController::Base
  before_filter :require_manager, :except => [:index, :show]
  
  def index
    @monqi_classes = MonqiClass.paginate(:per_page => @settings.per_page , :page => params[:page])
  end
  
  
  def redirect_properly
    redirect_to :action => "index"
  end
end