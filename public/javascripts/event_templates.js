// Event template Form

function	set_start_end_date_pickers(){
		$('#start_date').datepicker({
			onSelect: function(){
				$('#start_clone').val($(this).val());
				$('input:checkbox').attr('checked', false);
				$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
			}
		});	
		
		$('.timepicker').timePicker({ 
			startTime: "06:00", // Using string. Can take string or Date object.
		  endTime: new Date(0, 0, 0, 22, 00, 0), // Using Date object here.
		  show24Hours: false,
		  separator: ':',
		  step: 5
		 });
		
		
		$('#allday').bind('click', function() {
																						if ($('#allday').attr("checked") == true) {
																								$('#time_pickers').hide();
																						}else{
																								$('#time_pickers').show();
																						}
		});
}
	
function repeat_options(){
	$('#event_template_repeat').bind('change', function() {
				var val = $('#event_template_repeat').val();
				switch(val){
					case "Does not repeat": // None selected
						$('#custom_repeat').hide();
						$('#repeat_indicator').hide();
						$('#interval_select').hide();
						$('#event_template_interval').val('');
					break;

					case "Custom": //Custom selected
						$('#repeat_indicator').html($(this).val()).show();
						$('#custom_repeat').show();
						$('#interval_select').hide();
					break;

					case "Daily":
						show_repeat_options();
						$('#select_week_days').html('');
						$('#start_clone').val($('#start_date').val());
						$('#range').show();
						show_end_after_or_until_radio();		
					break;
					
					case "Weekly":
						show_repeat_options();
						$('#range').show();
						show_end_after_or_until_radio();														
						$('#select_week_days').html('Repeat on: <br/>\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Mon" />Mon\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Tue" />Tue\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Wed" />Wed\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Thu" />Thu\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Fri" />Fri\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Sat" />Sat\
																				<input id="event_template_byday_" name="event_template[byday][]" type="checkbox" value="Sun" />Sun'
						);
																				
						$('input:checkbox').bind('click', function() { update_repeat_indicator();	});
						
						// auto check the checkbox for the selected day 	
						$("input:checkbox[value*='" + Date.parse($('#start_date').val()).toString('ddd') +"']").attr("checked", true);
						
						// set end repeat radio buttons to unchecked
						$('input:radio').attr('checked', false);
						update_repeat_indicator();							
					break; 
					
					default: // Every X selected
						show_repeat_options();
						show_end_after_or_until_radio();
					break;
				} // end of switch
	 }); // end of change function
} // end of repeat_options

function show_repeat_options() {
	$('#repeat_indicator').html($('#event_template_repeat').val()).show();
	$('#repeat_every_x').html($('#event_template_repeat :selected').text().replace('Every', '').trim());
	$('#custom_repeat').hide();
	$('#interval_select').show();
	show_end_after_or_until_radio();
};



// End Repeat Radio Group binds
function show_end_after_or_until_radio(){
	$('#after').html('');
	$('#on_date').html('');
	$('input:radio').attr('checked', false);
	
	// Bind Radio Group Buttons
	
	$('#end_repeat_radio_on_date').bind('click', function() {
		$('#after').html('');
		$('#on_date').html('<input type="text" size="10" name="event_template[until]" id="event_template_until" class="date_picker">');
		
		$('#event_template_until').datepicker({
		    beforeShow: function(input, inst)
		    {
		        inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
		    },
				onSelect: function(){
					update_repeat_indicator();
				}
		});
		
		// Add 30 days to until field automatically
	  $('#event_template_until').val(Date.parse($('#start_date').val()).add(1).month().toString('MM/dd/yyyy'));
		$('#event_template_until').focus();
	 	$('#event_template_until').bind('blur', function(event) {
			update_repeat_indicator();
	 	});
		
									
	});
	
	$('#end_repeat_radio_after').bind('click', function() {
		$('#on_date').html('');
		$('#after').html('<input type="text" size="2" name="event_template[count]" id="event_template_count"> Occurrences');

		$('#event_template_count').bind('keyup', function() {
				update_repeat_indicator();							
		});
	});	
}


// Repeat Indicator Auto Update
function update_repeat_indicator(){
	var every = '';
	var repeats = $('#event_template_repeat :selected').text().replace('Every', '').trim(); // read the selected repeats dropdown (Daily, Weeklky, Monthly, Yearly)
	var selected_days = '';

	if (repeats == 'week') {
			selected_days = ' on '; 
	}
 	var repeat_every = $('#event_template_interval :selected').val();
	if (repeat_every == 1) {
		repeat_every = ', ';
		repeats = $('#event_template_repeat :selected').val();		
		} else { 
						repeats = repeats + 's'; // pluralize repeats	
						repeat_every = repeat_every + ' ';
						every = 'Every ';// add "Every" to indicator 
	} 

	var start_day =  Date.parse($('#start_date').val()).toString('dddd');

	var days_arr = $("input:checkbox[name='event_template[byday][]']:checked");

	$.each(days_arr, function(index, value) { 
	   																				selected_days += $(this).val();
		 																				if ( index !== days_arr.length-1 ) {
																							selected_days += ', ';
																						}
	});

	var repeat_until =  $('#event_template_until').val();
		if (repeat_until == null) {
				repeat_until = ' until is null ' + repeat_until;
		} else {
			repeat_until = Date.parse(repeat_until).toString('dddd, MMMM d, yyyy');
		}


	var end_after = $('#event_template_count').val();
	if (end_after == null) { end_after = '';}


	$('#repeat_indicator').html(every + repeat_every + repeats + selected_days + repeat_until + end_after);


	console.info('every: ' + every);
	console.info('repeat_every: ' + repeat_every);
	console.info('repeats: ' + repeats);
	console.info('selected_days: ' + selected_days);
	console.info('until: ' + repeat_until);
	console.info('end after: '+ end_after);
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