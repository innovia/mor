class Order < ActiveRecord::Base
  belongs_to :cart
  has_many :transactions, :class_name => "OrderTransaction"
  
  attr_accessor :card_number, :card_verification
  validate_on_create  :validate_card
  
   acts_as_state_machine :initial => :pending
    state :pending
    state :authorized
    state :paid
    state :payment_declined

    event :payment_authorized do
      transitions :from =>  :pending,
                  :to =>    :authorized

      transitions :from =>  :payment_declined,
                  :to =>    :authorized
    end

    event :payment_captured do
      transitions :from =>  :pending,
                  :to =>    :paid
    end

    event :transaction_declined do
      transitions :from =>  :pending,
                  :to =>    :payment_declined

      transitions :from =>  :payment_declined,
                  :to =>    :payment_declined

      transitions :from =>  :authorized,
                  :to =>    :authorized
    end

  def number
      CGI::Session.generate_unique_id
  end

  def authorize_payment(credit_card, options = {})
    options[:order_id] = number

    transaction do
      authorization = OrderTransaction.authorize(amount, credit_card, options)
      transactions.push(authorization)

      if authorization.success?
        payment_authorized!
      else
        transaction_declined!
      end

      #return
      authorization
    end
  end

  def authorization_reference
    if authorization = transactions.find_by_action_and_success('authorization', true, :order => "id ASC" )
      authorization.reference
    end
  end

  def capture_payment(options = {})
      transaction do
        capture = OrderTransaction.capture(amount, authorization_reference, options)
        transactions.push(capture)
        if capture.success?
          payment_captured!
        else
          transaction_declined!
        end
        #return
        capture
      end
  end
  
  def purchase_products
      transaction do
        purchase = OrderTransaction.purchase(amount, credit_card, options = {})
        transactions.push(purchase)
        if purchase.success?
          payment_captured!
        else
          transaction_declined!
        end
        #return
        purchase
      end
  end
  
  def amount
    total = Cart.subtotal(cart)
    (total*100).round
  end
  
  
private
  def validate_card
    unless credit_card.valid?
      credit_card.errors.full_messages.each do |messsage|
        errors.add_to_base messsage
      end
    end
  end
  
  def credit_card
    @credit_card ||= ActiveMerchant::Billing::CreditCard.new(
    :type               =>  card_type,
    :number             =>  card_number,
    :verification_value =>  card_verification,
    :month              =>  card_expires_on.month,
    :year               =>  card_expires_on.year,
    :first_name         =>  first_name,
    :last_name          =>  last_name      
    )
  end
end
