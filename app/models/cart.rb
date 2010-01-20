class Cart < ActiveRecord::Base
  has_many :cart_items, :dependent => :destroy
  has_many :products, :through => :cart_items 
  has_one :order
  belongs_to :person
  
  def self.add_product(cart, product)  
    # check if the product is already in the cart, yes?  =>  increase qty
    current_item  = cart.cart_items.find_by_product_id(product)
    if current_item
      current_item.increment_quantity(product.price)
    else
      current_item = cart.cart_items.new
      current_item.cart_id = cart.id
      current_item.product_id = product.id
      current_item.quantity = 1
      current_item.total += product.price 
      current_item.save
    end
    current_item
  end
  
  def self.subtotal(cart)
    #subtotal for all cart items
    cart.cart_items.to_a.sum(&:total)
  end
    
end
