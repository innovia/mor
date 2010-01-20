class User < ActiveRecord::Base
  belongs_to :person
  acts_as_authentic do |c|
    c.validates_length_of_password_field_options = {:on => :update, :minimum => 4, :if => :has_no_credentials?}
    c.validates_length_of_password_confirmation_field_options = {:on => :update, :minimum => 4, :if => :has_no_credentials?}
  end
  validates_associated :person, :on => :create, :message => "First or Last name was not provided or was too short"
  
  attr_accessible :login, :email, :password, :password_confirmation

  def has_no_credentials?
      self.crypted_password.blank? && self.openid_identifier.blank?
  end

  def signup!(params)
      self.login = params[:user][:login]
      self.email = params[:user][:email]
      save_without_session_maintenance
  end
  

  def active?
    active
  end
  
  def activate!(params)
    self.active = true
    self.password = params[:user][:password]
    self.password_confirmation = params[:user][:password_confirmation]
    save
  end
  
  def deliver_activation_instructions!
    reset_perishable_token!
    Notifier.deliver_activation_instructions(self)
  end

  def deliver_activation_confirmation!
    reset_perishable_token!
    Notifier.deliver_activation_confirmation(self)
  end 
  
  def deliver_password_reset_instructions!  
    reset_perishable_token!  
    Notifier.deliver_password_reset_instructions(self)  
  end
   
end
