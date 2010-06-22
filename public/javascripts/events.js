$(document).ready(function() {
	
	validate_now();

	$('#event_monqi_class_id').combobox();
	//$('.instructor').combobox();
		
	// set the static doc
	$('#range').hide();
	$('#info_box').hide();
	date_pickers();
	time_pickers();
	all_day_listner();	
	set_first_schedule_set();
		
	function set_first_schedule_set() {
		var options = add_days_select();
		$('.scheduled_day').html('<select name="next_days[]" class="schedule_date">' + options + '</select>');
		$('.schedule_date').first().hide();
	};
	
	function add_days_select() {
		var selected_date = Date.parse($('#start_date').val());
		var selected_date_value = selected_date.toString('MM/dd/yyyy');

		var number_of_next_days = 7 - Date.getDayNumberFromName(selected_date.toString('ddd'));
		
		var options = '<option selected="selected" value=' + selected_date_value + '>' + selected_date.toString('ddd') + ' ' + selected_date_value + '</option>';
			
		for (var i=0; i < number_of_next_days; i++) {
			var next_day_option = selected_date;
			next_day_option.add(1).day();
			var next_day_value = next_day_option.toString('MM/dd/yyyy');
			options += '<option value=' + next_day_value + '>' + next_day_option.toString('ddd') + ' ' + next_day_value + '</option>';
		};	
		return options;
	};
	
	function time_pickers(){
		$('.timepicker').timePicker({ 
																	startTime: "06:00", 
			  													endTime: new Date(0, 0, 0, 22, 00, 0), // Using Date object here.
			  													show24Hours: false,
			  													separator: ':',
			  													step: 5
		});
	}
	
	function date_pickers(){
		$('#start_date').datepicker({
																	firstDay: 1,
																	dateFormat: 'D mm/dd/yy',
																	onSelect: function(){
																		$('#start_clone').val($(this).val());					
																		$('input:checkbox').attr('checked', false);
																		$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr({checked: true, disabled: true});
																		update_info_box();
																		set_first_schedule_set();
																	}
		});		
		$('#start_clone').val($('#start_date').val());		
	}

	function all_day_listner() {
		$('#allday').bind('click', function() {
																					 	if ($('#allday').attr("checked") == true) {
																							$('#time_pickers').hide();
																						}else{
																							$('#time_pickers').show();
																						}
			});
	}
	
	function clone_master_select_options(){
	 	var master_options = $('div.schedule').first().find('select.schedule_date').children().clone();
		return master_options;
	}													
		
	function remove_selected_options_from_cloned_select(master_select_options){
		var selected_options =  $('.schedule_date option:selected');
		var new_options =  $.grep(master_select_options, function(elem){
		    return !selected_options.filter('[value="'+elem.value+'"]').length;
		});
		return new_options;
	}
		
	function set_schedule_set(new_select_options) {
		$('<div class="schedule">\
			   <span class="scheduled_day">\
			 	   <select name="next_days[]" class="schedule_date"></select>\
			   </span>\
			   <span class="added_instructor"> Instructor: </span>\
			   <span class="remove_button"><img src="/images/icons/delete.png" alt="Remove" class="remove_set"</span>\
			 </div>').appendTo('div#added_day_instructor');
		$('div.schedule').last().find('select.schedule_date').append(new_select_options);
		$('span.added_instructor').last().html($('.scheduled_instructor').first().clone());
		add_start_end_time_to_schedule_set();
		//$('select.schedule_date').bind('click', function() {
			//remove_selected_options_from_cloned_select($('div.schedule').first().find('select.schedule_date').children().clone())
	//	});
		
	};
	
	function add_start_end_time_to_schedule_set(){
		if ($('span.scheduled_instructor').size() > 1 ) {
			$('span.scheduled_instructor').last().prepend($('.time_pickers_set').first().clone());
			time_pickers();
		}
	}
	
	function bind_mutli_sched_add_button(){
		$('.add_sched').bind('click', function() {
			var master_select_options = clone_master_select_options();
		  var new_select_options = remove_selected_options_from_cloned_select(master_select_options);
				if ($('div.schedule').size() < $('.schedule_date').first().children().size()) {
					set_schedule_set(new_select_options);
					bind_multi_sched_remove_button();
				} else {
					jAlert("<h3 class='max_days'>No more days left to schedule, you have scheduled " + $('.schedule_date').first().children().size() + " days</h3>");
				}
		});
	}	
													
	function bind_multi_sched_remove_button(){
		$('.remove_set').bind('click', function() {
			$(this).closest('div.schedule').last().slideUp('fast', function() {
				$(this).last().remove();
			});
		});
	}	
	
	
	$('#start_date').bind('blur', function() {
		set_first_schedule_set();
	});
	
	function show_week_days(){
			$('#multi_schedule').html('');
			$('#select_week_days').html('<br /> Repeat on: <br/>\
																		<input id="byday" name="byday[]" type="checkbox" value="Mon" />Mon\
																		<input id="byday" name="byday[]" type="checkbox" value="Tue" />Tue\
																		<input id="byday" name="byday[]" type="checkbox" value="Wed" />Wed\
																		<input id="byday" name="byday[]" type="checkbox" value="Thu" />Thu\
																		<input id="byday" name="byday[]" type="checkbox" value="Fri" />Fri\
																		<input id="byday" name="byday[]" type="checkbox" value="Sat" />Sat\
																		<input id="byday" name="byday[]" type="checkbox" value="Sun" />Sun\
																		<br/><br/>'
			);
			$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
			$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("disabled", true);
  }
	
	$('#freq').bind('change', function() {
		switch($(this).val()){
			case "Daily":
				$('.end_repeat').attr("disabled", false);
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			case "Weekly":
				$('.end_repeat').attr("disabled", false);
				on_change_of_repeats();
				$('#repeat_select').append('<select id="num_of_instructors">\
																				<option value="1">for one instructor</option>\
																				<option value="2">for multiple instructors</option>\
																		</select>');
				
				$('#num_of_instructors').bind('change', function() {
					if ( $(this).val() == "1" ) {
						show_week_days();
					} else {					
					$('#select_week_days').html('');
					$('#multi_schedule').html('<div id="sched_title"><br />\
																		   <span class="add_sched">\
																			   <img src="/images/icons/add.png" class="add_day"/>\
																				 Schedule more instructors, same class different days\
																			 </span>\
																		 </div><br /><div id="added_day_instructor"></div>'
					);
					
					bind_mutli_sched_add_button();
					$('.add_sched').click();
					}
					
				});
				
				show_week_days();				
				$('input:checkbox').bind('click', function() { update_info_box(); });
				update_info_box();
		  break;

			case "Monthly":
				$('.end_repeat').attr("disabled", false);
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			case "Yearly": 
				$('.end_repeat').attr("disabled", false);
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			default: // Does not repeat
				$('#select_week_days').html('');
				$('#info_box').html('').hide();
				$('.end_repeat').attr("disabled", true);
				$('#range').hide();
				$('#count').val('');
				$('#interval option:selected').val('');
			break;
		} // end of switch
	}); // end of change bind

	function on_change_of_repeats(){
		$('#range').show();
		validate_now();
		set_repeat_every_x();
		pluralize($('#interval').val(), freq);
	};
	
	// Radio Group Binds
	$('input:radio').attr('checked', false);
	
	$('#end_repeat_radio_on_date').bind('click', function() {
		$('#after').html('');
		$('#on_date').html('<input type="text" size="12" name="until" id="until" class="date_picker">');
		
		$('#until').datepicker({
				firstDay: 1,
				dateFormat: 'D mm/dd/yy',
		    beforeShow: function(input, inst)
		    {
		        inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
		    }, 
			onSelect: function() {
				update_info_box();
			}
		});
		// Add days till the end of the month  to until field automatically
	  $('#until').val(Date.parse($('#start_date').val()).moveToLastDayOfMonth().toString('ddd MM/dd/yyyy'));
		update_info_box();
	});
	
	$('#end_repeat_radio_after').bind('click', function() {
		$('#on_date').html('');
		$('#after').html('<input type="text" size="2" name="count" id="count" value="1"> Occurrences');
		$('#count').bind('keyup', function() {
			update_info_box();							
		});
		update_info_box();
	});
		
		
	//dynamic updates
	//interval
	$('#interval').bind('change', function() {
			set_repeat_every_x();
			pluralize($(this).val(), freq);
			update_info_box();
	});
	
	// pluralize days, weeks, months, years
	function pluralize(counter, item) {
		if (counter > 1) { 
			item = item + 's';
		} 
		$('#repeat_every_x').html(item);
	}
	
	function set_repeat_every_x(){
		if ($('#freq').val() == 'Daily') {
			freq = 'day';
		} else {
			freq = $('#freq').val().replace('ly', '').trim();
		}
	}
	
	function update_info_box() {
			var repeat_freq = $('#freq').val();
			var r_interval = $('#interval').val();
			var until = $('#until').val();
			var after = $('#count').val();
			var str = '';
			var days_arr = $("input:checkbox[name='byday[]']:checked");
			var selected_days = ' on ';

			$.each(days_arr, function(index, value) { 
					   																	  selected_days += $(this).val();
						 																		if ( index !== days_arr.length-1 ) {
																										selected_days += ', ';
																								}
			});
			
			if ( r_interval > 1) {
				str = 'Every ' + r_interval + ' ' + $('#repeat_every_x').text();
			} else {
				str = $('#freq').val();
			}
			
			if (repeat_freq == 'Weekly') {str += selected_days;}
			if (repeat_freq == 'Monthly') {str += ', on the ' +  Date.parse($('#start_date').val()).toString('d') + ' of each month';};
			if (repeat_freq == 'Yearly') {str += ' on ' +  Date.parse($('#start_date').val()).toString('MMMM d');};
			if (repeat_freq == 'Yearly' && r_interval == 1) {str = 'Annually on ' +  Date.parse($('#start_date').val()).toString('MMMM d');};
			if ( until != null ) {str += ', until ' + Date.parse(until).toString('dddd, MMMM d - yyyy'); }
			if ( after != null ) {str += ', end after ' + after + ' classes / occurances';}
			
			$('#info_box').html(str).show();
	}

	function validate_now(){
		$('form').validate({
			rules: {
				ignore: ":disabled",
				"event[monqi_class_id]": "required",
				"event[level]": "required",
				"event[max_attendees]": {required: true, number: true, min: 2},
				 end_repeat_radio: "required"
			}	,
				 messages: {
					"event[monqi_class_id]": "Type or choose a class",
					"event[level]": "Choose a class level",
					"end_repeat_radio": "Please set the end of the series",
					"event[max_attendees]": {
						required: "Please specify the maximum number of attendees",
						number: "This has to be a number",
						min: jQuery.format("The minimum number of attendees has to be equal or greater then {0}")
					} 
				}
			,
				 errorPlacement: function(error, element) { 
				      error.appendTo(element.parent());
			  }
		});
	}

	function review_submit(){
		$('#msg').html('<h3>Is this schedule correct?</h3><br />' +
			'The ' + $('#event_monqi_class_id option:selected').text() + ' class repeats ' + $('#freq option:selected').val() + '<br />' 
			+ '<strong> Every </strong>'
		);
		$('#msg').dialog({
		    title: "Multi Schedule Summary",
		    width: 450
		})
	}

});