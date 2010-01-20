class Page < ActiveRecord::Base
  attr_accessible :title, :body
  has_many :pictures
end
