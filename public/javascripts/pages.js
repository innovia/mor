$(document).ready(function() {
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
});

