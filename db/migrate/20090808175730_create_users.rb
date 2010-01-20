class CreateUsers < ActiveRecord::Migration
  def self.up
    create_table :users do |t|
      t.string    :login,               :null => false                # optional, you can use email instead, or both
      t.references :person
      t.string    :email,               :null => false                # optional, you can use login instead, or both
      t.string    :crypted_password,    :null => false                # optional, see below
      t.string    :password_salt,       :null => false                # optional, but highly recommended
      t.string    :persistence_token,   :null => false                # required
      t.string    :single_access_token, :null => false                # optional, see Authlogic::Session::Params
      t.string    :perishable_token,    :null => false                # optional, see Authlogic::Session::Perishability
      t.boolean   :active
      
      # Magic columns, just like ActiveRecord's created_at and updated_at. These are automatically maintained by Authlogic if they are present.
      t.datetime  :last_request_at                                    # optional, see Authlogic::Session::MagicColumns
      t.datetime  :current_login_at                                   # optional, see Authlogic::Session::MagicColumns
      t.datetime  :last_login_at                                      # optional, see Authlogic::Session::MagicColumns
      t.string    :current_login_ip                                   # optional, see Authlogic::Session::MagicColumns
      t.string    :last_login_ip                                      # optional, see Authlogic::Session::MagicColumns
  
      t.timestamps
    end
    
    # Create a super user account
    user = User.new()
    user.person = Person.new(:first_name => "ami", :last_name => "mahloof")
    role = Role.find_by_title('admin')
    user.person.roles << role
    role = Role.find_by_title('developer')
    user.person.roles << role
    user.active = true
    user.login = "admin"
    user.password = "112211"
    user.password_confirmation = user.password
    user.email = "admin@monqifitness.com"
    user.save!
    
  end

  def self.down
    drop_table :users
  end
end
