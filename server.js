var express = require('express');

// Require middleware-modules.
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Initialize server.
var server = express();

// Connect to Redis.
var redisPort = process.env.REDIS_PORT || 6379;
var redisHost = process.env.REDIS_HOST || '127.0.0.1';
var redis = require('redis').createClient(redisPort, redisHost);

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

// Parse cookies, used for storing token for authentication.
server.use(cookieParser());

// Include this middleware each time a authentication is required.
var requireAuth = function (req, res, next) {
};

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
