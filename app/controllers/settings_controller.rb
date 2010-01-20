class SettingsController < ApplicationController
 before_filter  :find_settings
 #before_filter  :login_required
 #require_role ["Admin", "Manager"]
 
  def edit
    @calendars = Calendar.all
  end

  # Saves the posted data to the settings table via the standard
  # Rails mass-assignment update approach.
  def update
    if @settings.update_attributes(params[:settings])
      flash[:notice] = 'Your system configuration was successfully updated.'
      redirect_to :action => 'edit'
    else
      render :action=>"edit"
    end
  end

  protected
  
  # Before filter to load the configuration data.
  def find_settings
     @settings =  Settings.load
  end
  
end
