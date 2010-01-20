class OrderTransaction < ActiveRecord::Base
  belongs_to :order
  serialize :params
  cattr_accessor  :gateway # Setting a Class Accessor named gatway will enable to change the gateway at any time
  
  class << self
    #OrderTransaction.authorize
    # pass a block with the amount,credit_card and options to the private method process
    def authorize(amount, credit_card, options = {})
      process('authorization', amount) do |gw|
        gw.authorize(amount, credit_card, options)
      end
    end
    
    #OrderTransaction.capture
    def capture(amount, authorization, options = {})
      process('capture', amount) do |gw|
        gw.capture(amount, authorization, options) 
      end
    end
    
    #OrderTransaction.purchase
    def purchase(amount, credit_card, options = {})
      process('purchase', amount) do |gw|
        gw.purchase(amount, credit_card, options) 
      end
    end
    
private 
    # the process method:
    # takes an action (authorize, capture, etc...), and the amount 
    def process(action, amount = nil)
      # set the var result to a new  OrderTransaction Object
      result = OrderTransaction.new
      result.amount = amount
      result.action = action
      
      #OrderTransaction
      # (id, order_id, action, amount, success, authorization, message, params, test)
      # success - Simply a boolean attribute that stores whether or not the transaction was successful.
      # authorization - The identification number or code returned by the payment gateway that allows for reference transactions.
      # message - The message returned by the payment gateway for the transaction
      # action - Which type of transaction this represents: authorization, purchase, capture, void, or credit.
      # params - The response returned by the payment gateway contains a hash of all data pertaining to the transaction. Keeping a record of data is very useful for record keeping and troubleshooting purposes. In this application we're going to use a serialized hash to store this data.
      # test - A boolean attribute that stores whether or not actual money changed hands during the transaction.
      
      
      begin
        # set the response for the gateway
        # The process() method expects a block and yields the class's ActiveMerchant gateway instance to the block
        response = yield gateway
        result.success = response.success?
        result.authorization = response.authorization
        result.message = response.message
        result.params = response.params
        result.test = response.test?
        
      rescue ActiveMerchant::ActiveMerchantError => e
        result.success = false
        result.authorization = nil
        result.message = e.message
        result.params = {}
        result.test = gateway.test?
      end
      result
    end
  end
end
