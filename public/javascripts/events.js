$(document).ready(function() {
	$('#event_monqi_class_id').combobox();
	//$('.instructor').combobox();
		
	// set the static doc
	$('#range').hide();
	$('#info_box').hide();
	date_and_time_pickers();
	all_day_listner();	
	set_first_schedule_set();
		
	function set_first_schedule_set() {
		var options = add_days_select();
		$('.scheduled_day').html('<select name="next_days[]" class="schedule_date">' + options + '</select>');
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
	
	function date_and_time_pickers(){
		$('#start_date').datepicker({
																	firstDay: 1,
																	onSelect: function(){
																		$('#start_clone').val($(this).val());					
																		$('input:checkbox').attr('checked', false);
																		$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
																		update_info_box();
																		set_first_schedule_set();
																	}
		});	
			
		$('.timepicker').timePicker({ 
																	startTime: "06:00", 
			  													endTime: new Date(0, 0, 0, 22, 00, 0), // Using Date object here.
			  													show24Hours: false,
			  													separator: ':',
			  													step: 5
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
		$('select.schedule_date').bind('click', function() {
			//remove_selected_options_from_cloned_select($('div.schedule').first().find('select.schedule_date').children().clone())
		});
		
	};
	
	function bind_mutli_sched_add_button(){
		$('.add_sched').bind('click', function() {
			var master_select_options = clone_master_select_options();
		  var new_select_options = remove_selected_options_from_cloned_select(master_select_options);
				if ($('div.schedule').size() < $('.schedule_date').first().children().size()) {
					set_schedule_set(new_select_options);
					bind_multi_sched_remove_button();
				} else {
					jAlert("the maximum schedule sets for the week, based on the starting day is: " + 			$('.schedule_date').first().children().size());
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
	//	Binds
	
	$('#start_date').bind('blur', function() {
		$('#end_at').val($(this).val());
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
    }
	
	$('#freq').bind('change', function() {
		switch($(this).val()){
			case "Daily":
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			case "Weekly":
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
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			case "Yearly": 
				on_change_of_repeats();
				$('#select_week_days').html('');
				update_info_box();
			break;

			default: // Does not repeat
				$('#select_week_days').html('');
				$('#info_box').html('').hide();
				$('#range').hide();
				$('#count').val('');
				$('#interval option:selected').val('');
			break;
		} // end of switch
	}); // end of change bind

	function on_change_of_repeats(){
		$('#range').show();
		set_repeat_every_x();
		pluralize($('#interval').val(), freq);
	};
	
	// Radio Group Binds
	$('input:radio').attr('checked', false);
	
	$('#end_repeat_radio_on_date').bind('click', function() {
		$('#after').html('');
		$('#on_date').html('<input type="text" size="10" name="until" id="until" class="date_picker">');
		
		$('#until').datepicker({
				firstDay: 1,
		    beforeShow: function(input, inst)
		    {
		        inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
		    }, 
			onSelect: function() {
				update_info_box();
			}
		});
		// Add 30 days to until field automatically
		$('#until').focus();
	  $('#until').val(Date.parse($('#start_date').val()).add(1).month().toString('MM/dd/yyyy'));
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
});