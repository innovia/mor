class PackageType < ActiveRecord::Base
  has_many :package_templates
  has_many :packages
end
