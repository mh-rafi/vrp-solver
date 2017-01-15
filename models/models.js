var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// create User Schema
var User = Schema({
	username: String,
	authProvider: String,
	local: {
		username: String,
		password: String
	},
	google: {
		id: String,
		token: String
	},
	name: String,
	title: String,
	email: String,
	phone: String,
	photo: String,
	website: String,
	origin: Schema.Types.Mixed,
	locations: Schema.Types.Mixed,
	interdistances: Schema.Types.Mixed
});


mongoose.model('User', User);
