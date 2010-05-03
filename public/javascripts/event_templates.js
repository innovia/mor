$(document).ready(function() {
	date_and_time_pickers();
	all_day_listner();
	repeats_drop_down_listner();

	// Variables
	var every = '';
	
	// Functions
function	date_and_time_pickers(){
		$('#start_date').datepicker({
			onSelect: function(){
				$('#start_clone').val($(this).val());
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
};

function all_day_listner() {
	$('#allday').bind('click', function() {
																					if ($('#allday').attr("checked") == true) {
																							$('#time_pickers').hide();
																					}else{
																							$('#time_pickers').show();
																					}
	});
																					
};

function repeats_drop_down_listner(){	
	$('#event_template_repeat').bind('change', function() {
				var val = $('#event_template_repeat').val();
				switch(val){
					case "Daily":
						show_end_after_or_until_radio();		
						$('#select_week_days').html('');
						$('#start_clone').val($('#start_date').val());
						interval_listner('day');
						update_repeat_indicator('Daily');
					break;
					
					case "Weekly":
						interval_listner('week');
						update_repeat_indicator('Weekly');
					break;
					
					case "Monthly":
						interval_listner('month');
						update_repeat_indicator('Monthly');
					break;
					
					case "Yearly": 
						interval_listner('year');
						update_repeat_indicator('Yearly');
					break;
					
					default: // Does not repeat
							$('#repeat_indicator').hide();
							$('#interval_select').hide();
							$('#event_template_interval').val('');
					break;
				} // end of switch
	 }); // end of change bind
}; // end of repeats_drop_down_listner

// Bind interval changes
function interval_listner(freq) {
		pluralize($(this).val(), freq);
	$('#interval_select').show();
	$('#event_template_interval').bind('change', function() {
		pluralize($(this).val(), freq);
		
	});
};

// pluralize days, weeks, months, years
function pluralize(counter, item) {
	if (counter > 1) { 
		item = item + 's';
		every = ', Every ';// add "Every" to indicator 
	} 
	$('#repeat_every_x').html(item);
};

// End Repeat Radio Group binds
function show_end_after_or_until_radio(){
	$('#after').html('');
	$('#on_date').html('');
	$('input:radio').attr('checked', false);
	$('#range').show();
	
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
function update_repeat_indicator(freq_repeats){
	
// Daily, Every 3 days

	str = freq_repeats; // Daily, Weekly, Monthly
  str += every;
 // , Every
 // + interval
 // + pluralize
$('#repeat_indicator').html(str);
	
	
/*	var selected_days = '';
  var repeats = '';

	if (repeats == 'week') {selected_days = ' on ';}
	 
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


	$('#repeat_indicator').html(every + repeat_every + repeats + selected_days + repeat_until + end_after); */
	
	$('#repeat_indicator').show();
};

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

});