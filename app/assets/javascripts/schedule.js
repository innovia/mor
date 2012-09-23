function fetch_classes(current_date){
	$.ajax({
		url: '/events/fetch_classes',
	  type: 'GET',
	  dataType: 'script',
	  data: 'current_date=' + current_date,
	  complete: function() {
		bind_instructors_preview();
		bind_class_description_preview();
	  },
	});
}
function bind_class_description_preview() {
	$('.class_desc').bind('click', function(event) {
		monqi_api = $('#overlay').overlay({effect: 'apple', left: 10, top:5, api: true});
	 	if (monqi_api.isOpened()){monqi_api.close();}
		var reinstate_link = '<br /><h3><a href="#" id="reinstate_class" class="person_preview_links"><img src="/assets/images/Refresh.gif" alt="Cancel Class">Reinstate Class</a></h3><br />';
		var cancel_link = '<br /><h3><a href="#" id="cancel_class" class="person_preview_links"><img src="/assets/images/door_cancel.png" alt="Cancel Class">Cancel Class</a></h3><br />';
		var toggle_link;
		var class_status = $(this).attr("data-cancelled");
		
		if (class_status == "true") { 
			toggle_link = reinstate_link;
		} else {
			toggle_link = cancel_link;
		}
			
		$('#overlay').html(	'<h2 class="left">' + $(this).attr("data-class_title") + '</h2>' + 
							'<p><h2 class="clear">' + $(this).attr("data-class_desc") + '</h2></p>' + toggle_link
						   );
		monqi_api.load();
		
		var current_event = $(this).attr("data-event");
		bind_cancel_class(current_event); 
		bind_reinstate_class(current_event);
	})
}

function bind_cancel_class(event_id){
	$('#cancel_class').bind('click', function(event) {
		$.post('/events/cancel',{id: event_id});	
	});
}
function bind_reinstate_class(event_id){
	$('#reinstate_class').bind('click', function(event) {
		$.post('/events/reinstate',{id: event_id});	
	});
}


//when clicking on instructor links
function bind_instructors_preview() {
	$('.instructor_info').bind('click', function(event) {
		monqi_api = $('#overlay').overlay({effect: 'apple', left: 10, top:5, api: true});
		if (monqi_api.isOpened()){monqi_api.close();}

		var monqi_instructor = $(this).attr("data-instructor");
		var current_event = $(this).attr("data-event");
		
		$.get("/people/" + monqi_instructor, function(data){
			$('#overlay').html('<a href="#" id="sub" class="person_preview_links"><img src="/assets/images/sub_instructor.png" alt="Sub Instructor"> Sub Instructor </a><br />' + data);
			var instructor_links = $('.person_preview_links').detach();
			instructor_links.appendTo('#admin_links');
			monqi_api.load();
		 	bind_sub_function(current_event);
			}, 'script'
		);
	}); 	
}

//bind the sub instructor button
function bind_sub_function(event_id, class_id) {
	$('#sub').one('click', function(event) {
	$('#admin_links').after('<div style="display:none" id="sub_instructor_form"></div>');
	$('.bio').slideUp('slow', function() {
		$.get('/events/sub_form', function(data){
		 $('#sub_instructor_form').html(data).fadeIn('5000');
		 $('#subConfirm').bind('click', function(event) {
			$.post('/events/sub',{
			 event_id: event_id, sub_instructor: $('#scheduled_instructor_').val()},
			 function(){
			    //stuff to do *after* page is loaded;
			});	
		});
		});
		
	  });
	});
}

fetch_classes($('#current_date').text());
setInterval("fetch_classes($('#current_date').text());", 1200000); // refresh the page every 20 minutes