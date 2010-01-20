class UsedPackage < ActiveRecord::Base
  belongs_to :event
  belongs_to :package
end
