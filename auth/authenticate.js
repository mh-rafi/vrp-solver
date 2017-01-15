var express = require('express');
var router = express.Router();

var passportGoogle = require('./google');

module.exports = function() {

	router.get('/google', passportGoogle.authenticate('google', { scope : ['profile', 'email'] }));
	router.get('/google/callback',
		passportGoogle.authenticate('google', {
			successRedirect: '/',
			failureRedirect: '/'
		}),
		function(req, res) {
			// Successful authentication
			res.json(req.user);
		});

	router.get('/loggedin', function(req, res) {
		if(req.isAuthenticated()) {
			return res.redirect('/dashboard');
		}
		res.send('Not authenticated');
	});

	router.get('/isLoggedin', function(req, res) {
		if(req.isAuthenticated())
			return res.send(req.user);

		res.status(401).send();
	});

	router.get('/signout', function(req, res) {
		req.logout();
		res.json({state: 'success', message: 'Sign out successful'});
	});

	return router;
}