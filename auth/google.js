var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var mongoose = require('mongoose');

var User = mongoose.model('User', User);
var config = require('../_config');
var init = require('./init');

passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  // google sends back the tokens and profile info
  function(token, tokenSecret, profile, done) {
    process.nextTick(function() {
      var email = profile.emails.length ? profile.emails[0].value : null;
      var photo = profile.photos.length ? profile.photos[0].value : null;

      User.findOne({'google.id': profile.id}, function(err, user) {
            if(err)
              return done(err);
            if(user && user.email === email)
              return done(null, user);
            else {
              var newUser = new User();
              newUser.google.id = profile.id;
              newUser.google.token = token;
              
              newUser.name = profile.displayName;
              newUser.email = email;
              newUser.photo = photo;

              newUser.save(function(err) {
                if(err)
                  throw err;
                return done(null, newUser);
              });
              // console.log(profile);
            }
          });
    });
  }

));

// serialize user into the session
init();


module.exports = passport;