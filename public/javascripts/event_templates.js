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
