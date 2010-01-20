class Package < ActiveRecord::Base
  belongs_to :package_template
  belongs_to :person
  belongs_to :package_type
  has_and_belongs_to_many :events
  
  validates_presence_of :person_id, :package_template_id, :expiration_date
  
end
