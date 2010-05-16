class Page < ActiveRecord::Base
  attr_accessible :title, :body, :page_attachment
  has_many :pictures
  has_attached_file :page_attachment,
   :url => "/:attachment/:id/:style/:basename.:extension",  
   :path => ":rails_root/public/:attachment/:id/:style/:basename.:extension"
end
