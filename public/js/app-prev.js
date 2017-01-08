document.addEventListener('DOMContentLoaded', function(e) {
	var mapDiv = document.getElementById('display_map');
	var calcBtn = document.getElementById('calcBtn');

	var directionsService = new google.maps.DirectionsService();
	var directionsDisplay = new google.maps.DirectionsRenderer();
	var map = new google.maps.Map(mapDiv, {
		zoom: 10,
		center: new google.maps.LatLng(23, 90)
	});
	var waypoints = [];

	google.maps.event.addListener(map, 'click', function(e) {
		console.log(e);
		new google.maps.Marker({
			map: map,
			draggable: true,
			position: e.latLng
		});
		waypoints.push({
			location: e.latLng,
			stopover: true
		});
	});

	calcBtn.addEventListener('click', function() {
		console.log('clicked');
		
	});
	
	// var optimizedRoutes = vrp({
	// 	interDistances: interDistances,
	// 	demands: demands,
	// 	capacity: 40
	// });

	// console.log(optimizedRoutes);

});