class Person < ActiveRecord::Base
  has_one :user, :dependent => :destroy
  has_and_belongs_to_many :roles
  has_and_belongs_to_many :events
  has_many :phone_numbers,  :dependent => :destroy
  has_one :address, :dependent => :destroy
  has_many :carts
  has_many :packages
  
 
  
  has_attached_file :photo, :styles => {:small => "150x150>", :thumb => "100x100>", :original => "400x400>"} 
  
  validates_presence_of :first_name, :last_name
  
  def full_name
    [first_name, middle_name, last_name].join(' ') 
  end
  
  def last_initial
    self.last_name = [first_name.capitalize, last_name[0].chr.capitalize].join(' ') 
  end
  
  # has_role? simply needs to return true or false whether a user has a role or not.  
  # It may be a good idea to have "admin" roles return true always
  def has_role?(role_in_question)
    @_list ||= self.roles.collect(&:title)
    return true if @_list.include?(role_in_question)
    (@_list.include?(role_in_question.to_s) )
  end



  
# passing a user query to find names begins with that
# search should only find people
  def self.find_people(value)
    self.first_name_begins_with(value.downcase).ascend_by_last_name.all(:limit => 5) 
  end
  
end