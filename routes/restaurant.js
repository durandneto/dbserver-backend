 var bodyparser = require('body-parser');
var express = require('express');
var busboyBodyParser = require('busboy-body-parser');
var fs = require('fs');
var jsonfile = require('jsonfile')
var restaurantsFile = './files/restaurants.json'
var restaurantsRateFile = './files/restaurants-rates.json'
var userVotesFile = './files/user-votes.json'
var userAlertsFile = './files/user-alerts.json'

var jwt = require('jwt-simple');
var secret = 'durand-papp';

module.exports = function() {
  try {
  var Api = express.Router();

  Api.use(bodyparser.urlencoded({ extended: false }))
  Api.use(bodyparser.json());
  Api.use(busboyBodyParser());   

   Api.get('/', function(req, res) {

       var user = jwt.decode(req.headers.authorization, secret);

      var file = './files/suggestion-user-'+user.id+'.json'
      var restaurants = jsonfile.readFileSync(restaurantsFile);
      var userAlerts = jsonfile.readFileSync(userAlertsFile);

      var restaurantsRates = [];
      var mySuggestions = [];
      var returnSuggestions = [];

      if (fs.existsSync(file)) { 
        mySuggestions = jsonfile.readFileSync(file);
      }

      restaurantsRates = restaurants.filter(function(restaurant){
        return (restaurant.rate > 0);
      });

      returnSuggestions = restaurants.filter(function(restaurant){
        return ( mySuggestions.indexOf(restaurant.id) == -1 );
      });

      jsonfile.writeFileSync(restaurantsFile, restaurants);
      res.send({status:'SUCCESS', rates:restaurantsRates, suggestions:returnSuggestions, alerts: userAlerts.reverse()  });

  });

   Api.post('/suggest', function(req, res) {

      var msg = {};
      msg.love = "Loves";
      msg.suggest = "Want to lunch in";

      var user = jwt.decode(req.headers.authorization, secret);

      console.log(user)

      var file = './files/suggestion-user-'+user.id+'.json'
      var restaurants = jsonfile.readFileSync(restaurantsFile);
      var restaurantsRates = [];
      var userVotes = jsonfile.readFileSync(userVotesFile);
      var userAlerts = jsonfile.readFileSync(userAlertsFile);

      var mySuggestions = [];
      var returnSuggestions = [];

      if (fs.existsSync(file)) { 
        mySuggestions = jsonfile.readFileSync(file);
      }

      for ( var index in restaurants ) {
        if( mySuggestions.indexOf(restaurants[index].id) == -1){

          if ( restaurants[index].id == req.body.restaurant ){
            if ( req.body.type == 'love' ) {
              restaurants[index].like ++;
              returnSuggestions.push(restaurants[index]);
            } else{
              restaurants[index].rate ++;
              mySuggestions.push(req.body.restaurant);
              jsonfile.writeFileSync(file, mySuggestions);
              userVotes.push({user:user.id, restaurant: req.body.restaurant });
              jsonfile.writeFileSync(userVotesFile, userVotes);
              userAlerts.push({user: user.name, type:msg[req.body.type], restaurant:restaurants[index].name  });
              jsonfile.writeFileSync(userAlertsFile, userAlerts);
            }
            restaurants[index].percent = Math.floor((restaurants[index].rate / userVotes.length) * 100);
          } else{
            restaurants[index].percent = Math.floor((restaurants[index].rate / userVotes.length) * 100);
            returnSuggestions.push(restaurants[index]);
          }
        } else {
          restaurants[index].percent = Math.floor((restaurants[index].rate / userVotes.length) * 100);
        }
      }

      restaurantsRates = restaurants.filter(function(restaurant){
        return (restaurant.rate > 0);
      });

      jsonfile.writeFileSync(restaurantsFile, restaurants);
      res.send({status:'SUCCESS', rates:restaurantsRates, suggestions:returnSuggestions, alerts: userAlerts.reverse() });
      
  });
 
  return Api;

  } catch ( err ) {
  console.log( 'geral Topic' , err);
  }
}