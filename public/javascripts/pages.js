$(document).ready(function() {
	jQuery.ajaxSetup({ 'beforeSend': function(xhr) {xhr.setRequestHeader("Accept", "text/javascript")} })

	$('#edit_page').bind('click', function(event) {
		$('#top_content_page').toggle();
		$('#lower_corner_box').toggle();
		$('#edit_page_box').toggle();
	});
	
 $('#gallery').innerfade({ animationtype: 'fade', speed: 2000, timeout: 4000, type: 'random' }); 
	
 $('#thumbs_scrollable').scrollable({size: 1});

$('.delete_icon').bind('click', function(event) {
   mor_delete_icon = this;
    jConfirm('Are you sure you want to delete this picture?', 'Delete Page Picture', function(r) {  
        if (r) {
								$.post('pictures/'+ $(mor_delete_icon).attr("data-pic"), {_method: 'delete'}, function(){$(mor_delete_icon).prev().parent().slideUp();}, 'script');	
            	}
    });

});



// main vertical scroll 
$("#main_categories").scrollable({ 
    vertical: true, 
    size: 1, 
    clickable: false,
		prev: 'a.prev_page',
		next: 'a.next_page',
}).navigator("#main_navi"); 
 
// horizontal scrollables. each one is circular and has its own navigator instance 
var horizontal = $(".category_scrollable").scrollable({size: 1,clickable: false, prev: 'a.prev_horizontal', next: 'a.next_horizontal'}).navigator(".navi"); 
 
 
// when page loads setup keyboard focus on the first horzontal scrollable 
horizontal.eq(0).scrollable().focus();

$('.staff_links').bind('click', function(event) {	
	 monqi_api = $('#overlay').overlay({effect: 'apple', left: 10, top:170, api: true});

	if (monqi_api.isOpened()){monqi_api.close()}
	
	var monqi_instructor = $(this).attr("data-instructor");
	$.get('/people/' + monqi_instructor, function(data){
		$('#overlay').html(data);
		monqi_api.load();
	}, 'script');
	
	
});



});



