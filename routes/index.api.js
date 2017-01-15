var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');

router.use(function(req, res, next) {
	console.log('isAuthenticated MiddleWare log');

	if (!req.isAuthenticated()) {
		return res.status(401).json({
			state: 'error',
			message: 'Authentication error!'
		});
	}
	return next();
});

router.get('/user/info', function(req, res) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		if (err) {
			return res.status(500).json({
				state: 'error',
				message: 'Server Error!'
			});
		};
		if(!user) {
			return res.status(500).json({
				state: 'error',
				message: 'No User!'
			});
		};
		// console.log(user);
		res.send(user);
	})
});

router.post('/locations', function(req, res) {
	User.findOne({
		_id: req.user._id
	}, function(err, user) {
		// {origin, locations, interdistances}
		
		if (err) {
			return res.status(500).json({
				state: 'error',
				message: 'Server Error!'
			});
		};

		user.capacity = req.body.capacity || user.capacity;
		user.origin = req.body.origin || user.origin;
		user.locations = req.body.locations || user.locations;
		user.interdistances = req.body.interdistances || user.interdistances;
		user.save(function(err, resUser) {
			res.json(resUser).send();
		});
	})
})


module.exports = router;