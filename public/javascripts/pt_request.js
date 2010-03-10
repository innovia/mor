$('#error_box').hide();

$('.closebox').bind('click', function(event) {
	$('#error_box').fadeOut('fast');
	return false;
});

	$('.phone').mask("(999) 999-9999");
	$.metadata.setType("attr", "validate");

	jQuery.validator.addMethod("require_from_group", function(value, element, options) {
	   //From the options array, find out what selector matches
	   //our group of inputs and how many of them should be filled.
	   numberRequired = options[0];
	   selector = options[1];
	   var commonParent = $(element).parents('form');
	   var numberFilled = 0;       
	   commonParent.find(selector).each(function(){
	   //Look through fields matching our selector and total up
	   //how many of them have been filled
	     if ($(this).val()) {
	       numberFilled++;
	     }
	});
	   if (numberFilled >= numberRequired) {
	     //For imputs matching our selector, remove error class
	     //from their text
	     commonParent.find(selector).removeClass('error');
	     //Also look for inserted error messages and mark them
	     //with class 'checked'
	     var remainingErrors = commonParent.find(selector)
	     .next('label.error').not('.checked');
	     remainingErrors.text("").addClass('checked');
	     //Tell the Validate plugin that this test passed
	     return true;
	   }
	 //The {0} in the next line is the 0th item in the options array
	 }, jQuery.format("Please provide at least one phone number we can reach you at."));
	
	jQuery.validator.addClassRules("fillone", {
	    require_from_group: [1,".fillone"]
	});

$(function(){
	$("#pt_form").formwizard({ 
  	 //form wizard settings
      historyEnabled : true, 
      validationEnabled: true,
			focusFirstInput: true,
			textSubmit: 'Send request'
		},{
       //validation settings
			onkeyup: false,
			errorLabelContainer: "#error_box",
			wrapper: "li",
			rules: {
							first_name: { required: true, minlength: 2 },
							last_name: { required: true, minlength: 2 },
							email: { required: true, email: true },
							gender: "required",					
							age: "number",
							feet: {number: true},
							inch:{number: true},
							weight: {number: true},
							conditions: "required",
							goals: "required",
							times_a_week: {required: true, number: true}
			 // End Rules
			},
			groups: { phone_numbers: "home_phone work_phone cell_phone"},
			messages: {
				     		first_name:{
														required: "First name required",
				        						minlength: jQuery.format("First name has to be at least {0} characters!")
				     		},
								last_name:{
				       							required: "Last name required",
				       							minlength: jQuery.format("Last name has to be at least {0} characters!")
				     		},
								email: {
						   					required: "e-mail required",
							 					email: "email address is invalid"
								},
								gender:{ required: "Gender required"},
								age: {number: "age must be a number"},
								feet: {number: "feet must be a number"},
								inch: {number: "inch must be a number"},
								weight: {number: "weight must be a number"},
								goals:{ required: "We need to know what are your goals so we can pair you with the right trainer."},
								conditions: {required: "<p>It is very important for us to know if you're having any medical issues </p><p align='center'> if you don't have any just type none.</p>"},
								times_a_week: {required: "how many times a week would you like to come in?", number: "how many times a week must be a number"}	
			} // End Messages
  });
});