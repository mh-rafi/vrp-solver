;
(function() {
	var dispMapCtrl = ['$scope', function($scope) {
		var vm = this;
		vm.genObjKey = function(obj) {
			var keys = Object.keys(obj);
			var highestNum = 1;
			if (keys.length) {
				angular.forEach(keys, function(key) {
					key = parseInt(key);
					if (key > highestNum)
						highestNum = key;
				});
			}
			return highestNum + 1;
		};

		var mapDiv = document.getElementById('display_map');
		var dirMapDiv = document.getElementById('direction_map');
		var calcBtn = document.getElementById('calcBtn');

		var geocoder = new google.maps.Geocoder();
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();
		var distanceMatrix = new google.maps.DistanceMatrixService();

		var map = new google.maps.Map(mapDiv, {
			zoom: 10,
			center: new google.maps.LatLng(23, 90)
		});
		var dirMap = new google.maps.Map(dirMapDiv, {
			zoom: 10,
			center: new google.maps.LatLng(23, 90)
		});
		// directionsDisplay.setMap(map);

		var allLocations = [];
		vm.originLocation = [];
		vm.locationStore = {};
		vm.interDistances = {};
		vm.capacity = '';


		google.maps.event.addListener(map, 'click', function(e) {
			// console.log(e);
			if (!vm.originLocation.length) {
				vm.geocoderByLatLong(e.latLng, function(place) {
					console.log(place);
					$scope.$apply(function() {
						vm.originLocation.push({
							address: place.formatted_address,
							latlng: e.latLng
						});
						console.log(vm.originLocation);
					});
				});
			} else {
				vm.geocoderByLatLong(e.latLng, function(place) {
					$scope.$apply(function() {
						var locationKey = vm.genObjKey(vm.locationStore);
						vm.locationStore[locationKey] = {
							address: place.formatted_address,
							demand: 10,
							latlng: e.latLng
						};
						console.log(vm.locationStore);
					});
				});
			};

			new google.maps.Marker({
				map: map,
				draggable: true,
				position: e.latLng
			});
			// allLocations.push(e.latLng);
		});

		vm.showDirection = function(waypoints) {
			console.log(waypoints);
			directionsDisplay.setMap(dirMap);
			var request = {
				origin: vm.originLocation[0].latlng,
				destination: vm.originLocation[0].latlng,
				travelMode: 'DRIVING',
				waypoints: waypoints,
				optimizeWaypoints: true
			};
			directionsService.route(request, function(result, status) {
				if (status == 'OK') {
					directionsDisplay.setDirections(result);
				}
			});
		}
		vm.optimizedRoutes = {};

		vm.calcRoutes = function(interDistances) {
			var demands = {};
			angular.forEach(vm.locationStore, function(val, key) {
				demands[key] = val.demand
			});
			var optRoutes = vrp({
				interDistances: interDistances,
				demands: demands,
				capacity: 40
			});
			angular.forEach(optRoutes, function(routes) {
				vm.optimizedRoutes[routes] = {
					waypoints: []
				};
				var locations = routes.split('');
				angular.forEach(locations, function(locKey) {
					// new google.maps.LatLng(vm.locationStore[locKey].latlng.lat(), vm.locationStore[locKey].latlng.lng())
					vm.optimizedRoutes[routes].waypoints.push({
						location: vm.locationStore[locKey].latlng,
						stopover: true
					});
				});
			});
			console.log(optRoutes);
			console.log(vm.optimizedRoutes);
		};

		vm.getInterDistances = function() {
			allLocations.push(vm.originLocation[0].latlng);
			angular.forEach(vm.locationStore, function(val, key) {
				allLocations.push(val.latlng);
			});

			var request = {
				origins: allLocations,
				destinations: allLocations,
				travelMode: 'DRIVING'
			};

			distanceMatrix.getDistanceMatrix(request, function(result, status) {
				if (status == 'OK') {
					console.log(result);
					angular.forEach(result.rows, function(rowVal, rowKey) {
						angular.forEach(rowVal.elements, function(elmVal, elmKey) {
							if (rowKey != elmKey) {
								var distKey = (parseInt(rowKey) + 1).toString() + (parseInt(elmKey) + 1).toString();
								vm.interDistances[distKey] = elmVal.distance.value;
							};
						});
					});
					console.log(vm.interDistances);
					$scope.$apply(function() {
						vm.calcRoutes(vm.interDistances);
					});
				} else {
					console.log(status);
				}
			});
		};
		vm.geocoderByLatLong = function(latlong, callback) {
			geocoder.geocode({
				'latLng': latlong
			}, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[0]) {
						if (callback)
							callback(results[0]);
					}
				}
			});
		}

	}];

	angular.module('vrp')
		.controller('displayMapCtrl', dispMapCtrl);

})();