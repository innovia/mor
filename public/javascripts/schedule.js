$(document).ready(function() {
	function fetch_classes(current_date){
		$.ajax({
			url: '/events/fetch_classes',
		  type: 'GET',
		  dataType: 'script',
		  data: 'current_date=' + current_date,
		  complete: function() {
		  },
		});
	}
	
	fetch_classes($('#current_date').text());
});
