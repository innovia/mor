class PhoneNumbersController < ResourceController::Base 
  before_filter :require_user, :require_staff
  belongs_to [:person, :admin, :staff_member, :manager, :instructor, :member] 

end