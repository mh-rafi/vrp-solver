var app = require('express')();

var Config = function(origin) {
  this.origin = origin;
  this.google = {
    clientID: '683433971428-hh5i4n19mkepbr8t0pctg6ldk756to4v.apps.googleusercontent.com',
    clientSecret: 'jNEKCLpIQ2JsqHiLr7Eaeff_',
    callbackURL: origin + "/auth/google/callback"
  };
}

const live = 'https://vrp-solver.herokuapp.com';
const dev = 'http://127.0.0.1:3000';
const origin = app.get('env') === 'development' ? dev : live;

module.exports = new Config(origin);