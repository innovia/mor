class PicturesController < ApplicationController
  def index
    @page = Page.find(params[:page_id])
    @pictures = @page.pictures
  end
  
  def show
    @picture = Picture.find(params[:id])
  end
  
  def new
    @picture = Picture.new
  end
  
  def create
    @picture = Picture.new(params[:picture])
    if @picture.save
      flash[:notice] = "Successfully added picture to page."
      if params[:commit][:add_picture]
        redirect_to pages_path(params[:picture][:page_id])
      else
        redirect_to @picture
      end
    else
      render :action => 'new'
    end
  end
  
  def edit
    @picture = Picture.find(params[:id])
  end
  
  def update
    @picture = Picture.find(params[:id])
    if @picture.update_attributes(params[:picture])
      flash[:notice] = 'Album was successfully updated.'
      redirect_to(@picture)
    else
      render :action => "edit" 
    end
  end
  
  def destroy
    @picture = Picture.find(params[:id])
    @picture.destroy
    respond_to do |wants|
      wants.html { 
                  flash[:notice] = "Successfully destroyed picture."
                  redirect_to pictures_url }
      wants.js { render :nothing => true }
    end
    
  end
end
