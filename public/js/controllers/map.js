;
(function() {
	var dispMapCtrl = ['$rootScope', '$scope', '$http', function($rootScope, $scope, $http) {
		var vm = this;
		vm.originLocation = [];
		var locNames = ['b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$'];
		var mapDiv = document.getElementById('display_map');
		var calcBtn = document.getElementById('calcBtn');

		var geocoder = new google.maps.Geocoder();
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();
		var distanceMatrix = new google.maps.DistanceMatrixService();
		var originMarker;
		var locationMarkers = {};

		vm.locationStore = {};
		vm.interDistances = {};
		vm.capacity = 30;
		vm.msgFlags = {
			isOriginSelected: 0,
			selectLocationsCount: 0,
		};

		var map = new google.maps.Map(mapDiv, {
			zoom: 7,
			center: new google.maps.LatLng(23, 90)
		});

		$rootScope.getUser().then(function(res) {
			$rootScope.user = res.data;
			$rootScope.isLoggedin = true;

			var user = res.data;
			console.log(res.data);
			if (!user.capacity || !user.origin || !user.locations)
				return;

			vm.capacity = user.capacity;
			vm.originLocation.push(user.origin);
			vm.interDistances = user.interdistances || vm.interDistances;
			vm.locationStore = angular.copy(user.locations);

			vm.watchDataChange();
			// Set origin marker
			originMarker = new google.maps.Marker({
				map: map,
				position: user.origin.latlng
			});

			// SET MAP MARKER
			angular.forEach(user.locations, function(val, key) {
				locationMarkers[key] = new google.maps.Marker({
					map: map,
					position: val.latlng
				});
				// console.log(val.latlng);
			});

			vm.updateMsgFlags();

		}, function(err) {
			console.log('isLoggedin err', err);
		});

		google.maps.event.addListener(map, 'click', function(e) {
			// console.log(e);
			if (!vm.originLocation.length) {
				vm.geocoderByLatLong(e.latLng, function(place) {
					// console.log(place);
					$scope.$apply(function() {
						vm.originLocation.push({
							address: place.formatted_address,
							latlng: {
								lat: e.latLng.lat(),
								lng: e.latLng.lng()
							}
						});
						vm.updateMsgFlags();
						// console.log(vm.originLocation);
					});
				});
				originMarker = new google.maps.Marker({
					map: map,
					position: e.latLng
				});
			} else {
				var locationKey = vm.genObjKey(vm.locationStore);
				vm.geocoderByLatLong(e.latLng, function(place) {
					$scope.$apply(function() {
						vm.locationStore[locationKey] = {
							address: place.formatted_address,
							demand: 10,
							latlng: {
								lat: e.latLng.lat(),
								lng: e.latLng.lng()
							}
						};
						vm.updateMsgFlags();
					});
				});
				locationMarkers[locationKey] = new google.maps.Marker({
					map: map,
					position: e.latLng
				});
				// console.log(locationMarkers);
			};

		});
		vm.updateMsgFlags = function() {
			vm.msgFlags.isOriginSelected = vm.originLocation.length;
			vm.msgFlags.selectLocationsCount = Object.keys(vm.locationStore).length;
		}
		vm.exportData = function() {
			var text = JSON.stringify({
				origin: vm.originLocation[0],
				capacity: vm.capacity,
				locations: vm.locationStore,
				interdistances: vm.interDistances
			});

			var a = document.createElement("a");
			var file = new Blob([text], {
				type: 'text/plain'
			});
			a.href = URL.createObjectURL(file);
			a.download = 'VRP-data.txt';
			a.click();
		};
		vm.importData = function() {
			if(!vm.fileInput)
				return;

			vm.fileInput = JSON.parse(vm.fileInput);
			
			vm.capacity = vm.fileInput.capacity;
			vm.originLocation = [];
			vm.originLocation.push(vm.fileInput.origin);
			vm.interDistances = angular.copy(vm.fileInput.interdistances);
			vm.locationStore = angular.copy(vm.fileInput.locations);

			console.log(vm.interDistances);
			vm.isImporting = false;
		};
		vm.importSaveData = function() {
			vm.importData();
			vm.saveSettings();
		};
		vm.isLocationsSame = function(locs1, locs2) {
			var locsToIterate = Object.keys(locs1).length >= Object.keys(locs2).length ? locs1 : locs2;
			var locsToCompare = Object.keys(locs1).length < Object.keys(locs2).length ? locs1 : locs2;

			for (var locKey in locsToIterate) {
				if (!locsToCompare[locKey]) {
					return false;
				};
				if (locsToIterate[locKey].address !== locsToCompare[locKey].address) {
					return false;
				};
			};
			return true;
		};
		vm.isObjEmpty = function(obj) {
			for (var prop in obj) {
				if (obj.hasOwnProperty(prop))
					return false;
			}

			return JSON.stringify(obj) === JSON.stringify({});
		};
		vm.calcDemand = function(keys) {
			var totalDemand = 0;
			for (var i = 0; i < keys.length; i++) {

				totalDemand += vm.locationStore[keys[i]].demand;
				// console.log(totalDemand, vm.locationStore[keys[i]].demand);
			};

			return totalDemand;
		};
		vm.watchDataChange = function() {
			$scope.$watch(angular.bind(this, function() {
				return vm.locationStore;
			}), function(newVal, oldVal) {
				console.log('data watch');
				var newKeys = Object.keys(newVal);
				var oldKeys = Object.keys(oldVal);

				if(!$rootScope.user)
					return;

				if (!vm.isLocationsSame(vm.locationStore, $rootScope.user.locations)) {
					vm.dataTouched = true;
					vm.interDistances = {};
				}

				// console.log('old', oldVal);
				// console.log('new', newVal);
				// console.log('data touched', oldVal != newVal);
				console.log('data touched', newKeys.length != oldKeys.length);

			});
		};
		vm.reassignItems = function(items) {
			var reassignedItems = {};
			var prevKeyIndex = 0;

			angular.forEach(items, function(val, key) {
				var keyPosInNames = locNames.indexOf(key);
				var newKey = locNames[prevKeyIndex++];
				reassignedItems[newKey] = val;
			});
			return reassignedItems;
		};

		vm.genObjKey = function(obj) {

			var keys = Object.keys(obj);
			var highestNum = keys.length - 1;
			var hightsKey = keys[highestNum] || 'b';

			var newKey = locNames[highestNum + 1];

			return newKey;
		};

		vm.saveSettings = function() {
			vm.isSaving = true;
			$http.post('/api/locations', {
				capacity: vm.capacity,
				origin: vm.originLocation[0],
				locations: vm.locationStore,
				interdistances: vm.interDistances
			}).then(function(res) {
				vm.isSaving = false;
				vm.isValidDistMatrix = true;
				// console.log(res);
			}, function(err) {
				vm.isSaving = false;
				console.log('Save err', err);
			});
		};
		vm.getAddressText = function(key) {
			// console.log(vm.locationStore[key[1]].address);
			var location = vm.locationStore[key] || vm.originLocation[0];
			return location ? location['address'] : ' ';
		};

		vm.removeOrigin = function() {
			vm.originLocation = [];
			originMarker.setMap(null);
			originMarker = {};
			vm.updateMsgFlags();
		};

		vm.removeLocation = function(key) {
			locationMarkers[key].setMap(null);
			delete vm.locationStore[key];
			delete locationMarkers[key];

			vm.locationStore = vm.reassignItems(vm.locationStore);
			locationMarkers = vm.reassignItems(locationMarkers);
			vm.updateMsgFlags();
		};
		var dirMap;
		var dirMapDiv;
		vm.showDirection = function(waypoints) {
			dirMapDiv = document.getElementById('direction_map');
			// console.log(dirMapDiv, dirMapDiv.hasChildNodes());
			if (dirMapDiv && !dirMapDiv.hasChildNodes()) {
				// console.log('test');
				dirMap = new google.maps.Map(dirMapDiv, {
					zoom: 10,
					center: new google.maps.LatLng(23, 90)
				});
			};

			directionsDisplay.setMap(dirMap);
			var request = {
				origin: vm.originLocation[0].latlng,
				destination: vm.originLocation[0].latlng,
				travelMode: 'DRIVING',
				waypoints: waypoints,
				optimizeWaypoints: true,
				unitSystem: google.maps.UnitSystem.METRIC
			};

			directionsService.route(request, function(result, status) {
				if (status == 'OK') {
					directionsDisplay.setDirections(result);
					console.log(result);
					vm.totolDistance = 0;
					$scope.$apply(function() {
						angular.forEach(result.routes[0].legs, function(route) {
							vm.totolDistance += route.distance.value;
						});
						vm.totolDistance = parseInt(vm.totolDistance / 1000);
					});
					console.log(vm.totolDistance);
				}
			});
		}

		vm.solveVRP = function() {
			vm.calcRoutes(vm.interDistances);
		};
		vm.calcRoutes = function(interDistances) {
			vm.optimizedRoutes = {};
			var demands = {};

			//PREPARE DEMANDS
			angular.forEach(vm.locationStore, function(val, key) {
				demands[key] = val.demand
			});

			// console.log('vrp.js input', {
			// 	interDistances: angular.copy(interDistances),
			// 	demands: angular.copy(demands),
			// 	capacity: angular.copy(vm.capacity)
			// });
			var optRoutes = vrp({
				interDistances: angular.copy(interDistances),
				demands: angular.copy(demands),
				capacity: angular.copy(vm.capacity)
			});

			// console.log('vrp.js output', optRoutes);

			angular.forEach(optRoutes, function(routes) {
				vm.optimizedRoutes[routes] = {
					addresses: [],
					waypoints: []
				};

				var locations = routes.split('');
				angular.forEach(locations, function(locKey) {
					// new google.maps.LatLng(vm.locationStore[locKey].latlng.lat(), vm.locationStore[locKey].latlng.lng())
					vm.optimizedRoutes[routes].waypoints.push({
						location: vm.locationStore[locKey].latlng,
						stopover: true
					});
					vm.optimizedRoutes[routes].addresses.push(vm.locationStore[locKey].address);
				});
			});

			setTimeout(function() {
				smoothScroll('optRoutes');
			}, 400);

			console.log(vm.optimizedRoutes);
		};
		vm.iterateDistanceMatrixResult = function(result, callback) {
			angular.forEach(result.rows, function(rowVal, rowKey) {
				angular.forEach(rowVal.elements, function(elmVal, elmKey) {
					if (callback)
						callback({
							value: rowVal,
							key: rowKey
						}, {
							value: elmVal,
							key: elmKey
						});
				});
			});
		};


		vm.checkInterDistances = function(interDistances, callback) {
			angular.forEach(interDistances, callback);
		};

		vm.isValidDistMatrix = true;
		vm.joinInterDistances = function(locationToUser, interDistances) {
			var newInterDistances = {};
			var allKeys = ['a'];
			var locationToUserKeys = Object.keys(locationToUser);
			var locationStoreKeys = Object.keys(vm.locationStore);
			allKeys = allKeys.concat(locationStoreKeys);

			// JOIN locationToUser TO MAIN INTER DISTANCE COLLECTION
			console.log(allKeys);
			angular.forEach(allKeys, function(loc1) {
				angular.forEach(allKeys, function(loc2) {
					if (loc1 === loc2)
						return;

					var distKey = loc1 + loc2;
					var reversedDistkey = distKey.split('').reverse().join('');

					if (interDistances.hasOwnProperty(distKey) || interDistances.hasOwnProperty(reversedDistkey))
						return;


					interDistances[distKey] = 0;
				});
			});
			// console.log(interDistances);
			// CHECK DISTANCE MATRIX HAS 0 VALUE
			vm.checkInterDistances(interDistances, function(val, key) {
				if (val === 0)
					vm.isValidDistMatrix = false;
			});

			if (vm.isValidDistMatrix) {
				vm.calcRoutes(vm.interDistances);
			};

			$scope.$apply(function() {
				vm.interDistances = interDistances;
			});

			// console.log('all keys', allKeys);
			// console.log(vm.interDistances);
		};

		vm.getInterDistances = function() {
			// console.log('isObjEmpty', vm.isObjEmpty(vm.interDistances));
			// IF LOGGED IN AND LOCATIONS ARE SAME
			if ($rootScope.isLoggedin && vm.isLocationsSame(vm.locationStore, $rootScope.user.locations)) {
				console.log('from data');
				return vm.calcRoutes(vm.interDistances);
			};
			// console.log('is same', vm.isLocationsSame(vm.locationStore, $rootScope.user.locations));

			var allLocations = [];
			allLocations.push(vm.originLocation[0].latlng);

			var locationKeys = Object.keys(vm.locationStore);
			var locationsToGoogle = vm.locationStore;
			var maxLocNum = 7;
			var isLocNumExceeds = locationKeys.length > maxLocNum;

			// IF LOCATION IS MORE THAN 7
			if (isLocNumExceeds) {
				locationsToGoogle = {};
				var locationToUser = {};

				// SEPARATE LOCATIONS INTO TWO COLLECTIONS
				angular.forEach(vm.locationStore, function(val, key) {
					var keyPosInNames = locNames.indexOf(key);
					if (keyPosInNames < maxLocNum) {
						locationsToGoogle[key] = val;
					} else {
						locationToUser[key] = val;
					}
				});
			};

			// MAKE A ARRAY OF LAT LONG OF ALL LOCATIONS locationsToGoogle
			angular.forEach(locationsToGoogle, function(val, key) {
				allLocations.push(val.latlng);
			});

			console.log(allLocations);
			// GET INTERDISTANCES FROM GOOGLE
			var request = {
				origins: allLocations,
				destinations: allLocations,
				travelMode: 'DRIVING',
				unitSystem: google.maps.UnitSystem.METRIC
			};
			distanceMatrix.getDistanceMatrix(request, function(result, status) {
				if (status == 'OK') {
					// RESTRUCTURE GOOGLE RESPONSE DATA
					vm.iterateDistanceMatrixResult(result, function(row, element) {
						if (row.key != element.key) {

							var loc1 = locNames[row.key - 1];
							var loc2 = locNames[element.key - 1];

							// FIRT KEY IS A
							if (row.key == 0)
								loc1 = 'a';
							if (element.key == 0)
								loc2 = 'a';

							var distKey = loc1 + loc2;
							var reversedDistkey = distKey.split('').reverse().join('');

							// CONSTRUCT INTER DISTANCE COLLECTION
							if (!vm.interDistances.hasOwnProperty(reversedDistkey)) {
								vm.interDistances[distKey] = element.value.distance.value ? element.value.distance.value / 1000 : 0;
							}
						};
					});

					// console.log(result.rows);
					// console.log('from google');
					// IS LOCATION MORE THAN 7
					if (isLocNumExceeds) {
						vm.joinInterDistances(locationToUser, vm.interDistances);
					} else {
						// CALCULATE USING VRP IN ANGULAR CONTEXT
						$scope.$apply(function() {
							vm.calcRoutes(vm.interDistances);
						});
					};

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
		};

		function currentYPosition() {
			// Firefox, Chrome, Opera, Safari
			if (self.pageYOffset) return self.pageYOffset;
			// Internet Explorer 6 - standards mode
			if (document.documentElement && document.documentElement.scrollTop)
				return document.documentElement.scrollTop;
			// Internet Explorer 6, 7 and 8
			if (document.body.scrollTop) return document.body.scrollTop;
			return 0;
		};

		function elmYPosition(eID) {
			var elm = document.getElementById(eID);
			var y = elm.offsetTop;
			var node = elm;
			while (node.offsetParent && node.offsetParent != document.body) {
				node = node.offsetParent;
				y += node.offsetTop;
			}
			return y;
		};

		function smoothScroll(eID) {
			var startY = currentYPosition();
			var stopY = elmYPosition(eID);
			var distance = stopY > startY ? stopY - startY : startY - stopY;
			if (distance < 100) {
				scrollTo(0, stopY);
				return;
			}
			var speed = Math.round(distance / 100);
			if (speed >= 20) speed = 20;
			var step = Math.round(distance / 25);
			var leapY = stopY > startY ? startY + step : startY - step;
			var timer = 0;
			if (stopY > startY) {
				for (var i = startY; i < stopY; i += step) {
					setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
					leapY += step;
					if (leapY > stopY) leapY = stopY;
					timer++;
				}
				return;
			}
			for (var i = startY; i > stopY; i -= step) {
				setTimeout("window.scrollTo(0, " + leapY + ")", timer * speed);
				leapY -= step;
				if (leapY < stopY) leapY = stopY;
				timer++;
			}
			return false;
		};

	}];

	angular.module('vrp')
		.controller('displayMapCtrl', dispMapCtrl);

})();