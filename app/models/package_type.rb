class PackageType < ActiveRecord::Base
  has_many :package_template
  has_many :packages
end
