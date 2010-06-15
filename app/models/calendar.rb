class Calendar < ActiveRecord::Base
  # Calendar holds all events, each event is based on an event template (to keep it DRY)
	has_many :events
  has_many :package_templates
  
  validates_presence_of :name
  validates_presence_of :color, :message => "must be chosen for this calendar" 
  validates_uniqueness_of :color, :message => "is already assigned to another calendar"
  validates_uniqueness_of :name
end