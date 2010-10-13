$(document).ready(function() {
	$(":date").dateinput({
		format: '',
		
		onHide: function(){
			return false;
		},
		change: function(e, date){
			$('#current_date').html(this.getValue("dd<span></span>"));
		}
	}).data("dateinput").setValue(0).show();
	
	var selected_date;
		$("#datepicker").datepicker({
			showOn: 'button',
			buttonImage: 'images/calendar.gif',
			buttonImageOnly: true
		});
		
		$('#prev_day').bind('click', function(event) {
			selected_date = Date.parse($('#current_date').text()).add(-1).day();
			set_date_header(selected_date);
			set_view_title();		
			fetch_classes(selected_date);
		});
		
		
		
		$('#next_day').bind('click', function(event) {
			selected_date = Date.parse($('#current_date').text()).add(1).day();
			set_date_header(selected_date);
			set_view_title();		
			fetch_classes(selected_date);
		});
		
	
		$('#today_view').bind('click', function(event) {
			$('#current_date').html(Date.today().toString('dddd, MMMM d yyyy'));
			$('#view_title').html('Today\'s classes');
			fetch_classes(Date.parse('t'));
		});
			
		
		$('#daily_view').bind('click', function(event) {
			set_view_title();
			$('#date_navi').html('<li id="prev_day"><a href="#">prev_day</a></li>' +
													 '<li id="next_day"><a href="#"> next_day</a></li>');
			fetch_classes(Date.parse($('#current_date').text()));
		});
		
		$('#weekly_view').bind('click', function(event) {
			$('#view_title').html('Weekly classes');
			$('#date_navi').html('<li id="prev_week"><a href="#">prev_week</a></li>' + 
													 '<li id="next_week"><a href="#">next_week</a></li>');
			fetch_classes(Date.parse('t'), 'weekly');
		});
		
		$('#prev_week').bind('click', function(event) {
				selected_date = Date.parse($('#current_date').text()).add(-1).week();
				set_date_header(selected_date);
				$('#view_title').html('Weekly classes');
				fetch_classes(selected_date.moveToDayOfWeek(1, -1), 'weekly');
				//Date.getDayNumberFromName(selected_date.toString('dddd'))
				lastSelectedTab = offset_day_number(4);
		});
		
		$('#next_week').bind('click', function(event) {
				selected_date = Date.parse($('#current_date').text()).add(1).week();
				set_date_header(selected_date);
				$('#view_title').html('Weekly classes');
				fetch_classes(selected_date, 'weekly');
		});
							
		fetch_classes($('#current_date').text());
		$('#view_title').html('Today\'s classes');		
});

function offset_day_number(passed_day){
	if (passed_day < 6 ) { 
		passed_day -= 1;
		}else {
		passed_day = 0;
	}
	return passed_day;
}


function set_date_header(fmtDate){
	$('#current_date').html(fmtDate.toString('dddd, MMMM d yyyy'));
}

function set_view_title(){
	$('#view_title').html(Date.parse($('#current_date').text()).toString('dddd') + ' classes');
}

function set_scrollable(){
	api = $("#schedule_page").scrollable({ 
	  size: 1, 
	  clickable: false,
		//keyboard: false,
	}).navigator({navi: "#days_selector", api: true});
	
}

function fetch_classes(current_date, period){
	$.ajax({
		url: '/events/fetch_classes',
	  type: 'GET',
	  dataType: 'script',
	  data: 'current_date=' + current_date + '&period=' + period ,
	  complete: function() {
	    if (period > 1) {api.seekTo(lastSelectedTab)}
	  },
	});
}


