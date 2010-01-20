class Address < ActiveRecord::Base
  belongs_to :person
  belongs_to :zip_code

  validates_presence_of :street, :zip_code_id, :person_id
  validates_uniqueness_of :person_id, :on => :create, :message => "has already an address" 
  validate :valid_zip_code?, :unless => Proc.new{ |z| z.zip_code_id.blank? }
  validate :person_exists?
  
  protected
  
  def valid_zip_code? 
    unless ZipCode.exists?(zip_code_id)
      self.errors.add(:zip_code_id, "not a valid zip code")
    end
  end
  
  def person_exists?
    unless Person.exists?(person_id)
      self.errors.add(:person_id, "does not exist")
    end
  end
  
end
