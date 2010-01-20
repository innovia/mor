class MonqiClass < ActiveRecord::Base
  has_many :event_templates
  
  validates_presence_of :title, :description
  validates_uniqueness_of :title
end