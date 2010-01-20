class Picture < ActiveRecord::Base
  belongs_to :page
  has_attached_file :photo, :styles => { :box => "250X193>",:thumb => "100x100>", :content_type => ['image/jpeg', 'image/pjpeg', 
                                     'image/jpg', 'image/png', 'image/gif' ]
  } 

  def photo_attributes=(photo_attributes)
    photo_attributes.each do |attributes|
      photos.build(attributes)
    end
  end
  
  def self.destroy_pics(picture, photos)
    Picture.find(photos, :conditions => {:picture_id => picture}).each(&:destroy)
  end


end
