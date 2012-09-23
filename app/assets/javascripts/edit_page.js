$(document).ready(function() {
	$('#gallery').innerfade({ animationtype: 'fade', speed: 2000, timeout: 4000, type: 'random' });
	$('#thumbs_scrollable').scrollable({size: 1});
	$("#main").scrollable({ 
	  vertical: true, 
	  size: 1, 
	  clickable: false,
		keyboard: false,
		prev: 'a.prev_page',
		next: 'a.next_page'
	}).navigator(".main_navi");
	
	
	var horizontal = $(".scrollable").scrollable({size: 1, clickable: false, prev: 'a.prev_horizontal', next: 'a.next_horizontal'}).navigator(".navi");
	
	// when page loads setup keyboard focus on the first horzontal scrollable 
	horizontal.eq(0).scrollable().focus();
});
