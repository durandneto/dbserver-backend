var express = require('express');
var app = express();
var cors = require('cors');

var busboy = require('connect-busboy');
/**
* @description: habilitando o CORS para a api funcionar em servidores diferentes
* @developer : Durand Neto
*/ 

var whitelist = [
    'http://localhost:8000'
];
var corsOptions = {
    origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // include before other routes

app.use('/api/v1/user', require('./routes/user')());
app.use('/api/v1/restaurant', require('./routes/restaurant')());

app.listen(3010);
console.log('Listening on port 3010!');