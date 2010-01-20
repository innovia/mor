class OrdersController < ApplicationController
  before_filter :require_user
  
  def new
    @order = Order.new
    @cart = find_cart
  end
  
  def create   
    cart = find_cart
    # @cart.build_order will automatically setup the association between the cart and this order
    @order = cart.build_order(params[:order])
    @order.ip_address = request.remote_ip
    if @order.save
       @order.purchase_products
      if @order.transactions.last.success
          cart.update_attribute :state, 'closed'
          cart.products.each do |item|
            if item.product_type == 'package'
              pkg_tmp = item.package_template
              pkg = current_user.person.packages.create!({:sessions => pkg_tmp.sessions, 
                                                          :active => true,
                                                          :cost => item.price,
                                                          :package_template_id => pkg_tmp.id,
                                                          :paid_by  => @order.card_type,
                                                          :expiration_date => Time.now + pkg_tmp.expires_in.months })
            end          
        end
        @pkg = current_user.person.packages.last
        render  :action => "success"
      else
        render  :action => "failure"        
      end
    else
      render :action => 'new'
    end
  end
end

