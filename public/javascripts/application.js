$(document).ready(function() {
	//Binds on load 
	$('.delete_button').bind('click', function() {
		$('#modal').load($(this).attr("data-dialog_action_path"));
		show_dialog($(this).attr("data-dialog_title"));
	});
			
	$('#delete_profile_pic').bind('click', function() {
		jConfirm('Are you sure you want to remove this profile picture?', 'Remove Profile Picture', function(r) {  
			if (r) {
				$.get('/people/' + $('.delete_icon').attr("data-person") + '/remove_profile_pic');
				$('#profile_picture').fadeOut(3000).delay(4000).fadeIn(3000).html('<img src="/images/no_avatar.gif" alt="No_avatar">');
			}
		});
	});
			
	$("form").bind("keypress", function(e) {
 		if (e.keyCode == 34) return false;
	});

	$('table').tablesorter({ sortList: [[2,0]] }); 	
	$("table.stripes tr:even").addClass('alt');	
	$('table.stripes tr').mouseover(function() { $(this).addClass('over');}).mouseout(function() { $(this).removeClass('over');});
		
	$("#filter").keyup(function() {
		$.uiTableFilter( $('table.stripes'), this.value, "Last" );
	})
	
	// Functions	
	birthday_visbility_bind();
	style_buttons(); // Style buttons
	new_package_selector();			
	package_type_bind();
	//date_navigation(); sub_instructor(); cancel_class_listner(); reinstate_class_listner(); members_auto_complete();	add_to_cart();

}); // end of Document Ready

// Application Js File
jQuery.ajaxSetup({ 'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} })

	// Generic functions

function show_dialog(title){
	$('#modal').dialog({
		show: 'drop', 
		hide: 'drop',
		title: title,
		position: "top", 
	 	modal: true, 
	 	width: 700,
		buttons: { "Cancel": function(){ $(this).dialog('close') } } 
	});
}

function ajax_form_submission(){
	$('form').submit(function() {
		$.post($(this).attr("action"), $(this).serialize(), null, "script");
		return false;
	});	
}
 
 // End of generic functions 

function birthday_visbility_bind(){
	$("#person_birthday_visibility").bind('change', function(event) {
		switch($(this).val()){
			case "Show only month & day in my profile.":
				$('#person_dob_1i').hide();
		 	break;
			case "Don't show my birthday in my profile.":
				$('#person_dob_1i').hide();
				$('#person_dob_2i').hide();
				$('#person_dob_3i').hide();
			break;
			default:
				$('#person_dob_1i').show();
				$('#person_dob_2i').show();
				$('#person_dob_3i').show();
			}
	});
}

function package_type_bind(){
	$('.pkg_type_selector').bind('click', function() {
		fetch_packages($(this).attr("data-pkg_type"));
	});
}

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
function fetch_packages(pkg_type){
	$.ajax({
		url: '/package_templates/fetch_packages',
	  type: 'GET',
	  dataType: 'script',
	  data: 'pkg_type=' + pkg_type
	});
}

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
	$("input:submit").hover(function(){ $(this).addClass("ui-state-hover");},function(){ $(this).removeClass("ui-state-hover");});													
	$("button, .a2button").addClass("mq-button ui-state-default ui-corner-all");
	$("button, .a2button").hover(function(){ $(this).addClass("ui-state-hover");},function(){ $(this).removeClass("ui-state-hover");});
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