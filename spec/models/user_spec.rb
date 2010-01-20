require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

module UserSpecHelper
  def valid_user_attributes 
    {
      :login => "ami",
      :password => "123456",
      :password_confirmation => "123456",
      :email => "ami@gmail.com"
    }
end
  
  describe User do
    include UserSpecHelper
    fixtures :people

    before(:each) do
      @user = User.new  
    end
    
    it "should create a new user with valid attributes" do
      @user.attributes = valid_user_attributes
      @user.should be_valid
    end
  
    it "should not save with missing fields" do
       @user.should_not  be_valid
       @user.errors.full_messages.should == [
                                              "Password confirmation is too short (minimum is 4 characters)", 
                                              "Password is too short (minimum is 4 characters)", 
                                              "Login is too short (minimum is 3 characters)", 
                                              "Login should use only letters, numbers, spaces, and .-_@ please.", 
                                              "Email is too short (minimum is 6 characters)", 
                                              "Email should look like an email address."
                                            ]
    end
    
  
  end
end