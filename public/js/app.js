angular.module('vrp', [])
	.run(['$rootScope', '$http', function($rootScope, $http) {
		$rootScope.getUser = function() {
			return $http.get('/api/user/info');
		};
	}])
	.filter('exerpt', [function() {
		return function(text) {
			var limit = 15;
			if (!text)
				return;

			if (typeof text != 'string')
				text = text.toString();

			if (text.length > limit) {
				text = text.substr(0, limit) + '...'
			}

			return text;
		}
	}]);