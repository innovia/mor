class MonqiClass < ActiveRecord::Base
  has_many :events
  validates_presence_of :title, :description
  validates_uniqueness_of :title
  
  
  def self.category(web_category)
    all(:conditions => {:web_category => web_category})
  end
end