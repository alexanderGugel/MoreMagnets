var _ = require('lodash');

var express = require('express');

// Require middleware-modules.
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var parseMagnetURI = require('magnet-uri');

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

// Store a new Magnet URI.
server.post('/submit', function (req, res) {
  // TODO Display flash messages!
  var magnetURI = req.body['magnet-uri'];
  var magnet = parseMagnetURI(magnetURI);
  console.info('Parsed ' + magnetURI + ' as ' + JSON.stringify(magnet));
  // Empty parsed object -> invalid magnet link!
  if (_.isEmpty(magnet)) {
    return res.redirect('/');
  }
  // Don't insert duplicates!
  redis.exists('m:' + magnet.infoHash, function (err, exists) {
    if (exists) {
      res.redirect('/');
    } else {
      // Everything is ok, insert Magnet in database.
      var createdAt = new Date().getTime();
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      redis.hmset('m:' + magnet.infoHash, {
        mu: magnetURI, // Magnet URI
        pmu: JSON.stringify(magnet), // Parsed Magnet URI
        ca: createdAt, // Created at (Unix timestamp)
        ip: ip
      }, function (err) {
        redis.sadd('m:all', magnet.infoHash);
        redis.zadd('m:ca', createdAt, magnet.infoHash);
        redis.sadd('m:ip:' + ip, magnet.infoHash);
        redis.rpush('m:crawl', magnet.infoHash);
        // Insertion complete.
        res.redirect('/');
      });
    }
  });
});

var port = process.env.PORT || 3141;
server.listen(port, function () {
  console.info('Express server listening on port ' + port);
});
