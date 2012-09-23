class Product < ActiveRecord::Base
  has_many :cart_items
  belongs_to :package_template, :dependent  => :destroy
  
  has_attached_file :photo, :styles => { :small => "150x150>", :thumb => "100x100>"}, :default_url => "/assets/images/package.png"
    
  validates_presence_of :title, :description
  validates_numericality_of :price
  validate :price_must_be_at_least_a_cent
 
  
  def self.find_products_for_sale
     find(:all, :order => "title")
  end
   
protected
  def price_must_be_at_least_a_cent
    errors.add(:price, 'should be at least 0.01' ) if price.nil? || price < 0.01
  end

end
