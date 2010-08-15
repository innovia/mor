$(document).ready(function() {
		$("#datepicker").datepicker({
			showOn: 'button',
			buttonImage: 'images/calendar.gif',
			buttonImageOnly: true
		});
		
		$('#prev_day').bind('click', function(event) {
			fetch_classes(Date.parse($('#current_date').text()).add(-1).day());
		});
		
		$('#daily_view').bind('click', function(event) {
			fetch_classes(Date.parse($('#current_date').text()));
		});
		
		$('#next_day').bind('click', function(event) {
			fetch_classes(Date.parse($('#current_date').text()).add(1).day());
		});
		
		$('#weekly_view').bind('click', function(event) {
			fetch_classes(Date.parse('t'), 'weekly');
		});
		
		$('#prev_week').bind('click', function(event) {
			fetch_classes(Date.parse($('#current_date').text()).add(-1).week(), 'weekly');
		});
		
		$('#next_week').bind('click', function(event) {
			fetch_classes(Date.parse($('#current_date').text()).add(1).week(), 'weekly');
		});
				
		$('#today_view').bind('click', function(event) {
			fetch_classes(Date.parse('t'));
		});
				
		fetch_classes($('#current_date').text());
});

function fetch_classes(current_date, period){
	$.ajax({
		url: '/events/fetch_classes',
	  type: 'GET',
	  dataType: 'script',
	  data: 'current_date=' + current_date + '&period=' + period 
	});
}