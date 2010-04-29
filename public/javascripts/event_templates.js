// Event template Form

function	set_start_end_date_pickers(){
	 $('.date_picker').datepicker();
	
		$('#start_date').datepicker({
			onSelect: function(){
				$('#start_clone').val($(this).val());
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
						$('#start_clone').val($('#start_date').val());
						$('#range').show();
						
						$('#end_repeat_radio_on_date').bind('click', function() {
							$('#after').html('');
							$('#on_date').html('<input type="text" size="10" name="event_template[until]" id="event_template_until" class="date_picker">');
							
							$('#event_template_until').datepicker({
							    beforeShow: function(input, inst)
							    {
							        inst.dpDiv.css({marginTop: -input.offsetHeight + 'px', marginLeft: input.offsetWidth + 'px'});
							    },
									onSelect: function(dateText, inst){
										update_repeat_indicator_with_until();
									}
							});
							
							// Add 30 days to until field automatically
							$('#event_template_until').val(Date.parse($('#start_date').val()).add(1).month().toString('MM/dd/yyyy'));
						 	
							$('#event_template_until').focus();
							
							update_repeat_indicator_with_until();
						
						});
						
						$('#end_repeat_radio_after').bind('click', function() {
							$('#on_date').html('');
							$('#after').html('<input type="text" size="2" name="event_template[count]" id="event_template_count"> Occurrences');
							$('#repeat_indicator').html('Every ' + $('#event_template_interval :selected').val() + ' ' + $('#repeat_every_x').html() );
					
							$('#event_template_count').bind('keyup', function() {
									$('#repeat_indicator').html('Every ' + $('#event_template_interval :selected').val() + ' ' + $('#repeat_every_x').html()
										+ '<br/>End after ' + $('#event_template_count').val() + ' times (occurrences / classes)');
							});
						});
						
										
					break;
					
					default: // Every X selected
						show_repeat_options();
					break;
				} // end of switch
	 }); // end of change function
} // end of repeat_options

function show_repeat_options() {
	$('#repeat_indicator').html($('#event_template_repeat').val()).show();
	$('#repeat_every_x').html($('#event_template_repeat :selected').text().replace('Every', '').trim());
	$('#custom_repeat').hide();
	$('#interval_select').show();
};

function update_repeat_indicator_with_until(){
	$('#repeat_indicator').html('Every ' + $('#event_template_interval :selected').val() + ' ' + $('#repeat_every_x').html() + 
															', Until ' + Date.parse($('#event_template_until').val()).toString('dddd, MMMM d, yyyy')
															);
															
}

function end_repeat_options(){
	
	$('#event_template_interval').bind('change', function() {
		$('#after').html('');
		$('#end_repeat_radio_after').attr('checked', false);
		
		$('#on_date').html('');
		$('#end_repeat_radio_on_date').attr('checked', false);
		
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
