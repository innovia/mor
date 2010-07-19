$(document).ready(function() {
		$("#datepicker").datepicker({
			showOn: 'button',
			buttonImage: 'images/calendar.gif',
			buttonImageOnly: true
		});
		
		$('#prev_day').bind('click', function(event) {
			var cur = $('#current_date').text();
			fetch_classes(Date.parse(cur).add(-1).day());
		});
		
		$('#next_day').bind('click', function(event) {
			var cur = $('#current_date').text();
			fetch_classes(Date.parse(cur).add(1).day());
		});
		
		$('#prev_week').bind('click', function(event) {
			var cur = $('#current_date').text();
			fetch_classes(Date.parse(cur).add(-1).week());
		});
		
		$('#next_week').bind('click', function(event) {
			var cur = $('#current_date').text();
			fetch_classes(Date.parse(cur).add(1).week());
		});
		
		
		$('#today_view').bind('click', function(event) {
			fetch_classes(Date.parse('t'));
		});
		
		$('#weekly_view').bind('click', function(event) {
			fetch_classes(Date.parse('t'), 'weekly');
		});
		
			$('#daily_view').bind('click', function(event) {
				var cur = $('#current_date').text();
				fetch_classes(Date.parse(cur));
			});
		
});

	
function fetch_classes(current_date, period){
	$.ajax({
		url: '/events/fetch_classes',
	  type: 'GET',
	  dataType: 'script',
	  data: 'current_date=' + current_date + '&period=' + period 
	});
}