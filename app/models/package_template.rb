class PackageTemplate < ActiveRecord::Base
  belongs_to :calendar
  has_one  :product
  belongs_to :package_type
  has_many :people, :through => :packages 
  
  
  validates_presence_of :description, :cost, :expires_in, :sessions
  validates_numericality_of :cost, :sessions
  #validates_associated :product
end
