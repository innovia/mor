$(document).ready(function() {
		
		$("#person_dob").mask("99/99/9999",{placeholder:" "});
			
		style_buttons(); // Style buttons
				
		// Working Calendar scripts
		date_navigation(); sub_instructor(); cancel_class_listner(); 
		reinstate_class_listner(); members_auto_complete(); style_top_class('Gym Use'); 
		
		// event templates
		repeat_options(); end_repeat_options(); frequency_options(); set_start_end_date_pickers();
		
		// store scripts
		add_to_cart();
		new_package_selector();
		$('.pkg_type_selector').bind('click', function() {
		 												 	pkg_type = $(this).attr("data-pkg_type");
															$.ajax({
															  url: '/package_templates',
															  type: 'GET',
															  dataType: 'script',
															  data: 'pkg_type=' + pkg_type
															});
		});
		
});

jQuery.ajaxSetup({ 'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} })

// Package templates
function clear_sessions(){
	$('#package_template_sessions').val('');
	$('#package_template_expires_in').val(default_pkg_exp);
}


function new_package_selector(){
$('#package_template_package_type_id').bind('change', function(event) {
	var pkg_type = $('#package_template_package_type_id :selected').text();
	switch(pkg_type) {
		case "Group Classes": 
			$('#package_template_calendar_id').val(1);
			clear_sessions();
		break;
		
		case "Gym Use":
			$('#package_template_calendar_id').val(1);		
			clear_sessions();			
		break;
		
		case  "Unlimited Classes and Gym Use":
			$('#package_template_calendar_id').val(1);
			$('#package_template_sessions').val('30');
			$('#package_template_expires_in').val('1');
		break;
			
		case "Personal Training":
			$('#package_template_calendar_id').val(2);		
			clear_sessions();
		break;
		
		default:
			$('#package_template_calendar_id').val('');		
			clear_sessions();
		break;
	
	}
});

}


// Packages
function populate_packages(){
		$('#package_calendar_id').change(function() {
				$('#package_template_form').effect("slide", "slow");
				$('#package_package_template_id').load( "/package_templates/by_calendar", {calendar_id: $('#package_calendar_id').val() });
		});
}

function show_default_package_and_override(){
	$('#package_package_template_id').bind('change',function() {
		$('#auto_complete_package').load( "/packages/pkg", {package_template_id: $('#package_package_template_id').val() })
		$('#auto_complete_package').show();
	});
}

function style_buttons(){
		$("input:submit").addClass("mq-button ui-state-default ui-corner-all");
		$("input:submit").hover(function(){ $(this).addClass("ui-state-hover");},
														function(){ $(this).removeClass("ui-state-hover");});
														
		$("button, .a2button").addClass("mq-button ui-state-default ui-corner-all");
		$("button, .a2button").hover(function(){ $(this).addClass("ui-state-hover");},
														function(){ $(this).removeClass("ui-state-hover");});
														
}



// Working Calendar Scripts

function style_top_class(classTitle){
	if ($('#class_time').is(":contains('Gym')")) {
	
	}
}

// Date Selection - home page
function date_navigation(){	
		$('#prev_day').live('click', function() {
			set_date_controls('previous');
		}); //end of prev day
		
		$('#next_day').live('click', function() {
			set_date_controls('next');
		}); //end of next day
		
		$('#nav_date_field').datepicker({ 
																			showOn: 'button',
																			buttonImage: '/images/calendar.gif', 
																			buttonImageOnly: true, 
																			onSelect: function(){set_date_controls('popup_calendar')}
																		}); // end of date picker
		
} // date navigation

function set_date_controls(day){
  var selected_date;
	var current_date = Date.parse($('#selected_date').text());
	
	switch(day){
	case 'previous':
		selected_date = current_date.previous().day();
		break;
	case	'next':
		selected_date = current_date.next().day();
		break;
	case 'popup_calendar':
		selected_date = Date.parse($('#nav_date_field').val());	  
	  break;
	default:
		break;
	}	
	$('#nav_date_field').val(selected_date.toString("yyyy-MM-dd"));
	$('#selected_date').text(selected_date.toString("dddd MMM d yyyy"));
	load_calendar_events();
}

function load_calendar_events(){
	$('#calendar_collection').load('/calendars/' + $('#calendar_id').val() + '?selected_day=' + $('#nav_date_field').val());	
}



function show_dialog(title){
	$('#modal').dialog({
												show: 'drop', 
												hide: 'drop',
												title: title,
												position: "top", 
											 	modal: true, 
											 	width: 700,
												buttons: { "get me out of here": function(){ $(this).dialog('close') } } 
										 });
}

function cancel_class_listner(){
	$('#cancel_link').live('click', function() {
		show_dialog('Class Cancellation');
	});
}

function reinstate_class_listner(){
	$('#reinstate_link').live('click', function() {
		show_dialog('Reinstate Class');
	});
}

function confirm_removal_of_member_from_class(msg, member, for_event){
	jConfirm(msg, 'Please Confirm Removal Of Class Attendee', function(r) {
	    if(r){
				$.post('/calendars/remove_member_from_class',{member_id: member,event_id: for_event},function(){},'script');
			};
	});
	
}

function enable_features(){												 	
		$('#enable_features').submit(function() {
																							$.post($(this).attr("action"), $(this).serialize(), null, "script");
																							return false;
																						 });	
}

function cancel_or_reinstate_class(){
												 $('#unlock_form > form').submit(function() {
																															$.post($(this).attr("action"), $(this).serialize(), null, "script");
																															return false;
																					});
}

function pkg_on_the_fly(){
	$('.new_package_onthefly').live('click', function() {
		show_dialog('Get a package'); 
	});
}

function ajax_form_submission(){
			$('form').submit(function() {
																		$.post($(this).attr("action"), $(this).serialize(), null, "script");
																		return false;
																	 });	
}

function members_auto_complete(){
	var template = "<div class='right'>{name}</div> \n"+ 
								 "<div class='auto_suggest'><img src='{pic}'/></div> \n"+ 
					 			 "<div id='pkg_link' class='right self'>{pkg}</div>";
				
	
	  $('.auto_complete_field').flexbox('auto_complete?calendar=' + $('#calendar_id').val(),{
			resultTemplate: template,
			showArrow: false,
			watermark: 'Enter member\'s name',
			maxCacheBytes: 0,
			onSelect: function() { 
				member_id = this.getAttribute('hiddenValue');	  
			}
	});
}

function sub_instructor(){
	$('#sub_instructor_button').live('click', function() {
		// Act on the event
	});
}




// Event template Form

function	set_start_end_date_pickers(){
	 $('.date_picker').datepicker();
	
		$('#start_date').datepicker({
			onSelect: function(){
				$('#end_date').val($(this).val());
			}
		});	
		
		$('.timepicker').timePicker({ 
			startTime: "02.00", // Using string. Can take string or Date object.
		  endTime: new Date(0, 0, 0, 15, 30, 0), // Using Date object here.
		  show24Hours: false,
		  separator: '.',
		  step: 15
		 });
		
		$('#allday').bind('click', function() {
																						if ($('#allday').attr("checked") == true) {
																								$('#time_pickers').hide("slow");
																						}else{
																								$('#time_pickers').show("slow");
																						}
		});
}
	
function repeat_options(){
	$('#event_template_repeat').bind('change', function() {
				var val = $('#event_template_repeat').val();
				switch(val){
					case "none": // None selected
					$('#custom_repeat').hide();
					$('#end_repeat_block').hide();
					break;

					case "custom": //Custom selected
					$('#custom_repeat').show();
					$('#end_repeat_block').hide();
					break;

					default: // Every X selected
					$('#custom_repeat').hide();
					$('#end_repeat_block').show();
					break;
				} // end of switch
	 }); // end of change function
} // end of repeat_options

function end_repeat_options(){
	$('#end_repeat').bind('change', function() {
		var val = $('#end_repeat').val();
			switch(val){
				case "after": //After selected
				 $('#after').show("slow");
				 $('#on_date').hide("slow");
				 $('#on_date > select').attr("disabled","disabled");
				break;	

				case "on date": //on date selected
				 $('#after').hide("slow");
				 $('#on_date').show("slow");
				 $('#on_date > select').removeAttr("disabled");
				break;
			} // end of switch
	}); // end of change function
}

function frequency_options(){
	$('#event_template_freq').bind('change', function() {
		var val = $('#event_template_freq').val();
			switch(val){
				case "weekly": //Weekly selected
				 $('#custom_weekly').show();
			 	 $('#end_repeat_block').show();
				break;	

				default:
				$('#custom_weekly').hide();
				$('#end_repeat_block').show();
				break;
			} // end of sswicth
	}); // end of change function
} 


// Store Scripts
function add_to_cart(){
	$('#add2cart').bind('click', function() {
		var el = $(this);
		$.post('/store/add_to_cart',{
		 product_id: el.attr('data-product')},
		 function(){},
		'script'
		);
	});
}