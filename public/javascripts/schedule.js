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
		$.get("/people/" + monqi_instructor, function(data){
			$('#overlay').html('<a href="#" id="sub" class="person_preview_links"><img src="/images/sub_instructor.png" alt="Sub Instructor"> Sub Instructor </a><br />' + data);
			var instructor_links = $('.person_preview_links').detach();
			instructor_links.appendTo('#admin_links');
			monqi_api.load();
		 	bind_sub_function();
			}, 'script'
		);
	}); 	
}

function bind_sub_function() {
	$('#sub').bind('click', function(event) {
	$('.bio').slideUp('slow', function() {
	    alert('Animation complete.');
	  });
	});
}

fetch_classes($('#current_date').text());
