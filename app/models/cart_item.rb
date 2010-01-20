class CartItem < ActiveRecord::Base
  belongs_to :cart
  belongs_to :product
    
  def increment_quantity(price)
    self.quantity += 1
    self.total += price 
    self.save!
  end
  
  def self.total(product, quantity)
    @total = product * quantity
  end
end
