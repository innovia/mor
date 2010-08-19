$(document).ready(function() {
	$(":date").dateinput();
	
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
		
		$('#daily_view').bind('click', function(event) {
			set_view_title();
			fetch_classes(Date.parse($('#current_date').text()));
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
			
		
		$('#weekly_view').bind('click', function(event) {
			$('#view_title').html('Weekly classes');
			fetch_classes(Date.parse('t'), 'weekly');
		});
		
		$('#prev_week').bind('click', function(event) {
				selected_date = Date.parse($('#current_date').text()).add(-1).week();
				set_date_header(selected_date);
				$('#view_title').html('Weekly classes');
				fetch_classes(selected_date, 'weekly');
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

function set_date_header(fmtDate){
	$('#current_date').html(fmtDate.toString('dddd, MMMM d yyyy'));
}

function set_view_title(){
	$('#view_title').html(Date.parse($('#current_date').text()).toString('dddd') + ' classes');
}

function set_scrollable(){
	$("#schedule_page").scrollable({ 
	  size: 1, 
	  clickable: false,
		//keyboard: false,
	}).navigator("#days_selector");
	
}

function fetch_classes(current_date, period){
	$.ajax({
		url: '/events/fetch_classes',
	  type: 'GET',
	  dataType: 'script',
	  data: 'current_date=' + current_date + '&period=' + period 
	});
}