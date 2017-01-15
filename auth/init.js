var passport = require('passport');
var mongoose = require('mongoose');
var _ = require('underscore');
var User = mongoose.model('User', User);;


module.exports = function() {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			var filteredData = user ? _.pick(user, '_id', 'email', 'name') : null;
			done(err, filteredData);
		});
	});

};