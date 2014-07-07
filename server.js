var express = require('express');

// Require middleware-modules.
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Initialize server.
var server = express();

// Get redis client.
var redis = require('./redis');

// Use consolidate for templating, since Hogan.js doesn't work well with Express
// out of the box.
var cons = require('consolidate');
server.engine('html', cons.hogan);
server.set('view engine', 'html');
server.set('views', __dirname + '/views');

// Serve static files in /static.
server.use(express.static(__dirname + '/static'));

// Parse form data. TODO CSRF
server.use(bodyParser.urlencoded());

// Serve index page.
server.get('/', function (req, res) {
  res.render('index', {
    "header": "Colors",
    "items": [
        {"name": "red", "first": true, "url": "#Red"},
        {"name": "green", "link": true, "url": "#Green"},
        {"name": "blue", "link": true, "url": "#Blue"}
    ],
    "empty": false
  });
});

var port = process.env.PORT || 3141;
server.listen(port, function () {
  console.info('Express server listening on port ' + port);
});
