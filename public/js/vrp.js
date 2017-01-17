var vrp = (function() {
	var vrp = function(options) {
		var demands = options.demands;
		var interDistance = options.interDistances;
		var capacity = options.capacity;

		function isInArray(array, item) {
			return array.indexOf(item) > -1;
		};

		function getSibling(pair, item) {
			var sibling = pair.replace(item, '');
			if(!isOrigin(sibling))
				return sibling;
			else
				return '';
		};

		function isOrigin(loc) {
			return loc == 'a';
		};
		function XOR(a, b) {
			return (a || b) && !(a && b);
		};

		function calcDemand(cycle, newLoc) {
			var qty = 0;
			for (var i = 0; i < cycle.length; i++) {
				var loc = cycle[i];
				var demand = demands[loc];
				qty += demand;
			};
			return qty + demands[newLoc];
		};

		function hasBoth(cycle, edge) {
			return cycle.indexOf(edge[0]) > -1 && cycle.indexOf(edge[edge.length - 1]) > -1;
		};

		function notExists(cycle, edge) {
			return cycle.indexOf(edge[0]) === -1 && cycle.indexOf(edge[edge.length - 1]) === -1;
		};

		function getPointInMiddle(cycle, edge) {
			if (hasBoth(cycle, edge))
				return false;
			if (cycle.indexOf(edge[0]) === 0 || cycle.indexOf(edge[0]) === cycle.length - 1)
				return false;
			if (cycle.indexOf(edge[edge.length - 1]) === 0 || cycle.indexOf(edge[edge.length - 1]) === cycle.length - 1)
				return false;
			if (notExists(cycle, edge))
				return false;

			var matchedArr = cycle.match(edge[0]) || cycle.match(edge[edge.length - 1]);
			return matchedArr[0];
		}

		function getEdgeLocToAdd(cycle, edge) {
			if (cycle.length === 1) {
				if (edge.indexOf(cycle) > -1) {
					var pos = edge.indexOf(cycle) === 0 ? 1 : 0;
					return edge[pos];
				} else {
					return false;
				}
			};

			if (!XOR((edge.indexOf(cycle[0]) > -1), (edge.indexOf(cycle[cycle.length - 1]) > -1)))
				return false;

			if (edge.indexOf(cycle[0]) > -1)
				var pos = edge.indexOf(cycle[0]) === 0 ? 1 : 0;


			if (edge.indexOf(cycle[cycle.length - 1]) > -1)
				var pos = edge.indexOf(cycle[cycle.length - 1]) === 0 ? 1 : 0;

			

			return edge[pos]; 
		};

		function getEdgeLocToAddPos(cycle, edge) {
			if (edge.indexOf(cycle[0]) > -1)
				return 'first';

			if (edge.indexOf(cycle[cycle.length - 1]) > -1)
				return 'last';
		};

		function sortSavingsKeys(savingsObj) {
			var keys = Object.keys(savingsObj);
			var length = keys.length;

			for (var i = 0; i < length; i++) {
				for (var j = 0; j < (length - i - 1); j++) {
					if (savingsObj[keys[j]] > savingsObj[keys[j + 1]]) {
						var temp = keys[j];
						keys[j] = keys[j + 1];
						keys[j + 1] = temp;
					}
				}
			};
			return keys.reverse();
		}
		function arrayItemHas(array, key) {
			return array.join('').indexOf(key) > -1;
		};

		var savings = {};

		//CHECK DEMAND IS 0
		for (var locKey in demands) {
			var demand = demands[locKey];
			if (demand === 0) {
				for (var keyPair in interDistance) {
					if (keyPair.indexOf(locKey) > -1) {
						delete interDistance[keyPair];
					}
				}
			}
		};

		for (var d in interDistance) {
			var reversed = d.split("").reverse().join("");
			if (d.indexOf('a') === -1 && !savings.hasOwnProperty(reversed)) {
				savings[d] = interDistance['1' + d[0]] + interDistance['1' + d[1]] - interDistance[d];
			}
		}


		var orderedSavings = sortSavingsKeys(savings);
		// console.log(orderedSavings);

		var joinedCycles = [];
		// var unJoinedCycles = [];
		var joinedLocs = [];
		var isJoined;
		var cycleToStore
		var knockedOut;

		for (var i = 0; i < orderedSavings.length; i++) {
			

			// console.log('\n', '=================== >>>>> ====================');

			var edge = orderedSavings[i];
			var loc1 = edge[0];
			var loc2 = edge[1];
			knockedOut = false;
			// if(edge.indexOf('f') > -1)
			// 	debugger;

			if (!joinedCycles.length) {
				// console.log('first loop first edge', edge);
				if(calcDemand(loc1, loc2) <= capacity) {
					joinedCycles.push(edge);
					joinedLocs = edge.split('');
				};
			} else {

				// console.log('first loop i = %s , edge = %s', i, edge);
				for (var j = 0; j < joinedCycles.length; j++) {
					// console.log('\n', '----------------------------------------');
					// console.log('joinedCycles ', joinedCycles);
					if (!knockedOut) {
						var newCycle;
						var cycleStr = joinedCycles[j];

						// returns false if fails XOR or has both
						var edgeLocToAdd = getEdgeLocToAdd(cycleStr, edge);
						var cycleHasEdgeBoth = hasBoth(cycleStr, edge);
						var hasCrossedCapacity = calcDemand(cycleStr, edgeLocToAdd) > capacity;
						var locNotExists = notExists(cycleStr, edge);
						var pointInMiddle = getPointInMiddle(cycleStr, edge);
						var existsInJoinedCycles = arrayItemHas(joinedCycles, edgeLocToAdd);
						// console.log(cycleStr + '-' + edge + '-'+ calcDemand(cycleStr, edgeLocToAdd) + '-' + i);

						// console.log('Second loop i = %s , j = %s , cycleStr = %s , edge = %s, edgeLocToAdd = %s', i, j, cycleStr, edge, edgeLocToAdd);
						// console.log('cycleHasEdgeBoth = %s , hasCrossedCapacity = %s , locNotExists = %s , pointInMiddle = %s ',
						// 	cycleHasEdgeBoth, hasCrossedCapacity, locNotExists, pointInMiddle);
						
						
						if (hasCrossedCapacity) {
							// joinedLocs = joinedLocs.concat(cycleStr.split(''));
						};

						if (demands[edgeLocToAdd] > capacity) {
							// console.log('edgeLocToAdd thrown to trash');
							joinedLocs.push(edgeLocToAdd);
						};
						// cycle has both, store in joinedLocs and no need to check with other cycle in joined cycle
						if (cycleHasEdgeBoth) {
							// console.log('Cycle has both');
							knockedOut = true;
							joinedLocs = joinedLocs.concat(edge.split(''));
						};

						// cycle has already edgePoint, store in joinedLocs
						if (cycleStr.indexOf(edgeLocToAdd) > -1) {
							// console.log('############# Cycle has edgeLocToAdd %s', edgeLocToAdd);
							joinedLocs.push(edgeLocToAdd);
						};

						if (edgeLocToAdd && !cycleHasEdgeBoth && !hasCrossedCapacity && cycleStr.indexOf(edgeLocToAdd) === -1) {
							var posToAdd = getEdgeLocToAddPos(cycleStr, edge);
							// console.log('All condition fullfilled >>>>>>>>>>>>> edgeLocToAdd = %s', edgeLocToAdd);
							if (posToAdd === 'first') {
								newCycle = edgeLocToAdd + cycleStr;
							} else if (posToAdd === 'last') {
								newCycle = cycleStr + edgeLocToAdd;
							};
							// console.log('joinedLocs has edgeLocToAdd ', joinedLocs.indexOf(edgeLocToAdd) > -1);
							if (joinedLocs.indexOf(edgeLocToAdd) === -1) {
								joinedCycles[j] = newCycle;
								joinedLocs = joinedLocs.concat(newCycle.split(''));
								// console.log('Second loop, **** joined cycle ******', newCycle);

								// If there is another one point cycle in joinedCycles, we should remove that
								if (isInArray(joinedCycles, edgeLocToAdd)) {
									joinedCycles.splice(joinedCycles.indexOf(edgeLocToAdd), 1);
								};
							}

							isJoined = true;
							// console.log('A');
						} else {
							// console.log('B');
							if (locNotExists) {
								// console.log('not Exists');
								cycleToStore = edge;
								isJoined = false;
							} 

							// else if (hasCrossedCapacity && !cycleHasEdgeBoth && demands[edgeLocToAdd] <= capacity) {
							// 	// console.log('has Crossed Capacity');
							// 	cycleToStore = edgeLocToAdd;
							// 	isJoined = false;
							// } else if (pointInMiddle) {
							// 	// console.log('point In Middle')
							// 	cycleToStore = getSibling(edge, pointInMiddle);
							// 	knockedOut = true;
							// 	isJoined = false;
							// } 

							else {
								// console.log('isJoined = true');
								isJoined = true;
							}


						}

						if (!isJoined) {
							// console.log('isJoined condition----------');
							
							for (var k = 0; k < cycleToStore.length; k++) {

								if (!arrayItemHas(joinedCycles, cycleToStore[k]) && joinedLocs.indexOf(cycleToStore[k]) === -1 && demands[cycleToStore[k]] <= capacity) {
									joinedCycles.push(cycleToStore[k]);
									// console.log('Pushed to joinedCycles', cycleToStore[k]);
								} else {
									// console.log('isJoined condition cycleToStore exists in joinedCycles ----------', cycleToStore[k]);
								}
							}
						}
					}
					// console.log('joinedCycles ', joinedCycles);
				}; // End second loop
			}
			
		} // End First loop
		// console.log(joinedCycles);
		return joinedCycles;
	};
	return vrp;
})();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
	module.exports = vrp;
else
	window.vrp = vrp;
