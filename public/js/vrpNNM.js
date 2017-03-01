var vrpNNM = (function() {
	var vrpNNM = function(options) {
		var demands = options.demands;
		var interDistances = options.interDistances;
		var capacity = options.capacity;

		var calculatedLocations = [];
		var center = 'a';
		var otherLocations = Object.keys(demands);
		var optimizedRoutes = [];

		function arrayItemHas(array, key) {
			return array.join('').indexOf(key) > -1;
		};
		function calcDemand(cycle, newLoc) {
			var qty = 0;
			for (var i = 0; i < cycle.length; i++) {
				var loc = cycle[i];
				var demand = demands[loc];
				qty += demand;
			};
			if (!newLoc) {
				return qty;
			}
			if (newLoc.length > 1) {
				for (var j = 0; j < newLoc.length; j++) {
					var loc = newLoc[j];
					var demand = demands[loc];
					qty += demand;
				};
				return qty;
			};

			return qty + demands[newLoc];
		};

		function isOrigin(loc) {
			return loc == 'a';
		};

		function getSibling(pair, item) {
			var sibling = pair.replace(item, '');
			if (!isOrigin(sibling))
				return sibling;
			else
				return false;
		};

		function stringHas(string, s) {
			return string.indexOf(s) > -1;
		};

		function findRoute(routes) {
			var minDistance = 0;
			var nearestLocation;
			var currLocation = routes[routes.length - 1];

			for (var locationPair in interDistances) {

				var distance = interDistances[locationPair];

				if (stringHas(locationPair, currLocation)) {

					var locationToAdd = getSibling(locationPair, currLocation);

					var isInRoutes = stringHas(routes, locationToAdd);
					var hasCrossedCapacity = calcDemand(routes, locationToAdd) > capacity;
					var hasNewLocationDemand = demands[locationToAdd] > 0;
					var isCalculated = arrayItemHas(calculatedLocations, locationToAdd);
					// if (locationToAdd && locationToAdd === 'e') debugger;

					if ((!nearestLocation || minDistance > distance) && (locationToAdd && !hasCrossedCapacity && !isInRoutes && hasNewLocationDemand && !isCalculated)) {
						nearestLocation = locationToAdd;
						minDistance = distance;
					};
				}
			}
			nearestLocation && !arrayItemHas(calculatedLocations, nearestLocation) ? calculatedLocations.push(nearestLocation) : null;

			return nearestLocation || '';
		}
		
		
		for (var i = 0; i < otherLocations.length; i++) {
			var newRoutes = '';
			for (var j = 0; j < otherLocations.length; j++) {
				if(!newRoutes.length) {
					var routeToAdd = findRoute('a');
				} else {
					var routeToAdd = findRoute(newRoutes);
				}
				
				newRoutes = newRoutes + routeToAdd;
			}
			if(newRoutes.length)
				optimizedRoutes.push(newRoutes);
		}

		return optimizedRoutes;
	};

	return vrpNNM;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = vrpNNM;
else
	window.vrpNNM = vrpNNM;