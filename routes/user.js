var bodyparser = require('body-parser');
var express = require('express');
var busboyBodyParser = require('busboy-body-parser');
var jsonfile = require('jsonfile');
var usersMock = './files/users.json';

var jwt = require('jwt-simple');
var secret = 'durand-papp';

module.exports = function() {
  try {
  var Api = express.Router();

  Api.use(bodyparser.urlencoded({ extended: false }))
  Api.use(bodyparser.json());
  Api.use(busboyBodyParser());   

  Api.get('/me', function(req, res) {

    jsonfile.readFile(usersMock, function(err, users) {

      var RandomUserIndex = Math.floor(Math.random() * (users.length));
      var user = users[RandomUserIndex];
      user.access_token = jwt.encode(user, secret);
      res.send({ status:'SUCCESS', user:user });
      
    });
  });

  return Api;

  } catch ( err ) {
    console.log( 'erro on users api' , err);
  }

};