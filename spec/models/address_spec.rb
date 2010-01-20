require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

module AddressSpecHelper
  def valid_address_attributes 
    {
    :person_id  => 1,
    :street => "abc123",
    :zip_code_id => "11209"
    }
  end
end


describe Address do
  include AddressSpecHelper
  fixtures  :zip_codes, :people
  
  before(:each) do
    @address = Address.new  
  end
 
  it "should save with valid attributes" do
    @address.attributes = valid_address_attributes
    @address.zip_code should_not be_nil
    @address.should be_valid
  end
  
  it "should not save with empty attributes" do
    @address.should_not be_valid
    @address.zip_code.should be_nil
  end
  
  it "should not save without a valid zip code" do
    @address.attributes = valid_address_attributes
    @address.zip_code_id = "123"
    @address.should_not be_valid
    @address.should have(1).error_on(:zip_code_id)
  end
  
  it "should not save without a person" do
    @address.attributes = valid_address_attributes
    @address.person_id = nil || @address.person_id = 12635
    @address.should_not be_valid
    @address.should have(1).error_on(:person_id)
  end
  
  
end
