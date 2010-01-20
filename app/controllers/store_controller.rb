class StoreController < ApplicationController
  ##before_filter :login_required

  def index
    find_cart
    @products = Product.paginate(:per_page => @settings.products_pages, :page => params[:page], :order => 'title')
    get_calendars
  end
  
  def add_to_cart
    # get the product id to add to the cart
    # check that the product is valid, if not rescue
    # if product is valid => find the cart
    begin
      product = Product.find(params[:product_id]) 
    rescue
      logger.error("Attempt to access invalid product #{params[:id]}")
      redirect_to_index("Invalid Product", :error)
    else
      find_cart # find or create a new cart
      @current_item = Cart.add_product(@cart, product) # add the product to the current cart

      respond_to do |format|
        format.html { 
        redirect_to_index
        }
        format.js{
          render :layout => false
        }
      end
     
    end
  end
  
  def empty_cart
    @cart.cart_items.destroy_all
    redirect_to_index("Your cart is empty now", :notice)
  end
  
  def checkout
    @cart = find_cart
    if @cart.items.empty?
      redirect_to_index("Your cart is empty")
    else
      @order = Order.new
    end
  end

  def packages
    @title = params[:id]
    @products = Product.paginate_by_title @title, :per_page => @settings.products_pages, :page => params[:page]
    get_calendars
    render  :action => "index"
  end

private 
  def redirect_to_index(msg, type)
    flash[type] = msg
    redirect_to :action => "index"
  end
  
end
