class LegacyInstructors < ActiveRecord::Base
  set_table_name "instructors"
  set_primary_key "id"
  
  #belongs_to :person, :class_name => "LegacyPersons", :foreign_key => "person_id"
end
