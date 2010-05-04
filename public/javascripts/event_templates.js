$(document).ready(function() {
	$('#event_template_monqi_class_id').combobox();
	$('#event_template_instructor_id').combobox();
	
	// set the static doc
	date_and_time_pickers();
	all_day_listner();
	$('#range').hide();
	$('#info_box').hide();
	
	function date_and_time_pickers(){
			$('#start_date').datepicker({
				firstDay: 1,
				onSelect: function(){
					$('#start_clone').val($(this).val());
					// clear all checkboxes
					$('input:checkbox').attr('checked', false);
					$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
					update_info_box();
				}
			});	
			$('.timepicker').timePicker({ 
				startTime: "06:00", // Using string. Can take string or Date object.
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
	
	//	Binds
	
	//repeats
	$('#event_template_repeat').bind('change', function() {
					switch($(this).val()){
						case "Daily":
							on_change_of_repeats();
							$('#select_week_days').html('');
							update_info_box();
						break;

						case "Weekly":
							on_change_of_repeats();
							$('#select_week_days').html('Repeat on: <br/>\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Mon" />Mon\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Tue" />Tue\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Wed" />Wed\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Thu" />Thu\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Fri" />Fri\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Sat" />Sat\
																											<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Sun" />Sun\
																											<br/><br/>'
							);
							$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
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
								$('#event_template_interval').val('');
						break;
					} // end of switch
	}); // end of change bind

	function on_change_of_repeats(){
		$('#range').show();
		set_repeat_every_x();
		pluralize($('#event_template_interval').val(), freq);
	};
	
	// Radio Group Binds
	$('input:radio').attr('checked', false);
	
	$('#end_repeat_radio_on_date').bind('click', function() {
		$('#after').html('');
		$('#on_date').html('<input type="text" size="10" name="event_template[until]" id="event_template_until" class="date_picker">');
		
		$('#event_template_until').datepicker({
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
		$('#event_template_until').focus();
	  $('#event_template_until').val(Date.parse($('#start_date').val()).add(1).month().toString('MM/dd/yyyy'));
		update_info_box();
	});
	
	$('#end_repeat_radio_after').bind('click', function() {
		$('#on_date').html('');
		$('#after').html('<input type="text" size="2" name="event_template[count]" id="event_template_count" value="1"> Occurrences');
		$('#event_template_count').bind('keyup', function() {
			update_info_box();							
		});
		update_info_box();
	});
		
		
	//dynamic updates
	//interval
		$('#event_template_interval').bind('change', function() {
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
		if ($('#event_template_repeat').val() == 'Daily') {
			freq = 'day';
		} else {
			freq = $('#event_template_repeat').val().replace('ly', '').trim();
		}
	}
	
	
	function update_info_box() {
			var repeat_freq = $('#event_template_repeat').val();
			var r_interval = $('#event_template_interval').val();
			var until = $('#event_template_until').val();
			var after = $('#event_template_count').val();
			var str = '';
			var days_arr = $("input:checkbox[name='event_template[byday][]']:checked");
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
				str = $('#event_template_repeat').val();
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
