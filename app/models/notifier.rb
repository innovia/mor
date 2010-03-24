class Notifier < ActionMailer::Base  
  default_url_options[:host] = "monqifitness.com"  

  def activation_instructions(user)
     subject       "Activation Instructions"
     from          "monqifitness.com"
     reply_to      "no-reply@monqiftness.com"
     recipients    user.email
     sent_on       Time.now
     body          :account_activation_url => register_url(user.perishable_token)
   end

   def activation_confirmation(user)
     subject       "Activation Complete"
     from          "monqifitness.com"
     reply_to      "no-reply@monqiftness.com"
     
     recipients    user.email
     sent_on       Time.now
     body          :root_url => root_url
   end
   
  def password_reset_instructions(user)  
    subject       "Password Reset Instructions"  
    from          "monqifitness.com"
    reply_to      "no-reply@monqiftness.com"
    recipients    user.email  
    sent_on       Time.now  
    body          :edit_password_reset_url => edit_password_reset_url(user.perishable_token)  
 end


 def personal_training_online_request(params)
    @pt_req = params
     from        "#{params[:email]}"
     subject     "Personal Training Online Request from #{params[:first_name]} #{params[:last_name]}"
     recipients  "info@monqifitness.com, ami.mahloof@gmail.com"
     sent_on     Time.now
 end
   
 def contact_us_form(params)
   @mailer = params
   from "#{params[:email]}"
   recipients  "ami.mahloof@med.nyu.edu"
   subject     "Web contact us form ::: #{params[:subject]}"
   reply_to    "#{params[:email]}"
   sent_on     Time.now
 end
 
end