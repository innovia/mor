class CreateRoles < ActiveRecord::Migration
  def self.up
    create_table "roles" do |t|
      t.string :title
    end
    
    # generate the join table
    create_table "people_roles", :id => false do |t|
      t.integer "role_id", "person_id"
    end
    add_index "people_roles", "role_id"
    add_index "people_roles", "person_id"
    
     Role.create({:id => 1, :title => "admin"})
     Role.create({:id => 2, :title => "manager"})
     Role.create({:id => 3, :title => "staff_member"})
     Role.create({:id => 4, :title => "instructor"})
     Role.create({:id => 5, :title => "member"})
     Role.create({:id => 6, :title => "developer"})
  end

  def self.down
    drop_table "roles"
    drop_table "people_roles"
  end
end