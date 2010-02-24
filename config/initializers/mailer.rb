# Email settings
  ActionMailer::Base.delivery_method = :smtp

  ActionMailer::Base.smtp_settings = {
    :address => "smtp.med.nyu.edu",
    :port => 25
  }

  raise_delivery_errors = true
