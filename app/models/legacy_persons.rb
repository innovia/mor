class LegacyPersons < ActiveRecord::Base
  set_table_name "persons"
  set_primary_key "id"
  
  #has_one :object, :class_name => "Object", :foreign_key => "object_id"
end
