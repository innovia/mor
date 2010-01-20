require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

module PackageTemplateSpecHelper
  def basic_attributes 
    {
      :description => "Test", 
      :cost => 200, 
      :expires_in =>  6.months.from_now, 
      :sessions => 10
    }
  end
end

describe PackageTemplate do
  include PackageTemplateSpecHelper
  fixtures  :calendars
  
  before(:each) do
    @pt = PackageTemplate.new
  end

  it "should create a new valid package template" do
    @pt.attributes = basic_attributes
    @pt.should  be_valid
  end
  
  it "should not save with invalid fields" do
    @pt.should_not  be_valid
    @pt.errors.full_messages.count.should == 6
    @pt.errors.full_messages.should == ["Cost can't be blank", 
                                        "Cost is not a number", 
                                        "Description can't be blank", 
                                        "Sessions can't be blank", 
                                        "Sessions is not a number", 
                                        "Expires in can't be blank"]  
  end
  
  it "should create a product and a package template" do
    @pt.attributes = basic_attributes
    @pt.build_product({:title => "not set",
                                :description => @pt.description,
                                :price => @pt.cost,
                                :product_type => 'package'})
                 
     @pt.save
     @pt.should be_valid
     @pt.product.should be_valid
  end
end