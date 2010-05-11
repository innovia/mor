class Event < ActiveRecord::Base
  belongs_to :event_template
  belongs_to :monqi_class, :class_name => "MonqiClass", :foreign_key => "monqi_class_id"
  belongs_to :instructor, :class_name => "Person" # this is for the instructor in each event
  has_and_belongs_to_many :packages
  has_and_belongs_to_many :attendees, :class_name => "Person"
end