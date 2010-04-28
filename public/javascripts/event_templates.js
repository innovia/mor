// Event template Form

function	set_start_end_date_pickers(){
	 $('.date_picker').datepicker();
	
		$('#start_date').datepicker({
			onSelect: function(){
				$('#end_date').val($(this).val());
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
						trigger_repeat();
						$('#start_clone').val($('#start_date').val());
						$('#range').show();

					break;
					
					default: // Every X selected
						trigger_repeat();
					break;
				} // end of switch
	 }); // end of change function
} // end of repeat_options

function trigger_repeat() {
	$('#repeat_indicator').html($('#event_template_repeat').val()).show();
	$('#repeat_every_x').html($('#event_template_repeat :selected').text().replace('Every', '').trim());
	$('#custom_repeat').hide();
	$('#interval_select').show();
};


function end_repeat_options(){
	
	$('#event_template_interval').bind('change', function() {
		var val = $('#repeat_every_x'); 
		
		if ($('#event_template_interval :selected').val() > 1) {
			// add 's' to day, week ,month year 
	 		val.html(val.text().replace(val.text(), $('#event_template_repeat :selected').text().replace('Every', '').trim() + 's')); 
			$('#repeat_indicator').html('Every ' + $('#event_template_interval :selected').val() + ' ' + val.html() );
		} else {
			val.html($('#event_template_repeat :selected').text().replace('Every', '').trim());
			$('#repeat_indicator').html( $('#event_template_repeat :selected').val()); 
		}
		
				
	});
	
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
