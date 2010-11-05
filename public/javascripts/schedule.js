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
		monqi_api = $('#overlay').overlay({effect: 'apple', left: 10, top:10, api: true});
	 	if (monqi_api.isOpened()){monqi_api.close();}
		$('#overlay').html('<h2>' + $(this).attr("data-class_title") + '</h2><p><h2>' + $(this).attr("data-class_desc") + '</h2></p>');
		monqi_api.load(); 
	})
}

function bind_instructors_preview() {
	$('.instructor_info').bind('click', function(event) {
		monqi_api = $('#overlay').overlay({effect: 'apple', left: 10, top:5, api: true});
		if (monqi_api.isOpened()){monqi_api.close();}

		var monqi_instructor = $(this).attr("data-instructor");
		var current_event = $(this).attr("data-event");
		$.get("/people/" + monqi_instructor, function(data){
			$('#overlay').html('<a href="#" id="sub" class="person_preview_links"><img src="/images/sub_instructor.png" alt="Sub Instructor"> Sub Instructor </a><br />' + data);
			var instructor_links = $('.person_preview_links').detach();
			instructor_links.appendTo('#admin_links');
			monqi_api.load();
		 	bind_sub_function(current_event);
			}, 'script'
		);
	}); 	
}


function bind_sub_function(event_id) {
	$('#sub').one('click', function(event) {
	$('#admin_links').after('<div style="display:none" id="sub_instructor_form"></div>');
	$('.bio').slideUp('slow', function() {
		$.get('/people/', function(data){
		 $('#sub_instructor_form').html(data).fadeIn('5000');
		 $('#subConfirm').bind('click', function(event) {
			$.post('/events/sub',{
			 param1: "value1", param2: "value2"},
			 function(){
			    //stuff to do *after* page is loaded;
			});
			

			
		});
		});
		
	  });
	});
}

fetch_classes($('#current_date').text());
