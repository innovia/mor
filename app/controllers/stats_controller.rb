class StatsController < ApplicationController
  
  def index
    @search  = Package.search(:expiration_date_greater_than => params[:start_date], :expiration_date_less_than => params[:end_date])
    @data = @search.all
  end
  
  def show
    render :file => "stats/data.xml"
  end
end
