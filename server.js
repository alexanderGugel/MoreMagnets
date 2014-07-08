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

var cacheFront = function (req, res, next) {
  // TODO
  next();
};

var getStats = function (callback) {
  var multi = redis.multi();
  multi.zcard('edges');
  multi.zrevrange(['loc_stats:countries', 0, 10, 'WITHSCORES']);
  multi.zrevrange(['loc_stats:regions', 0, 10, 'WITHSCORES']);
  multi.zrevrange(['loc_stats:cities', 0, 10, 'WITHSCORES']);
  multi.zcard('loc_stats:countries');
  multi.zcard('loc_stats:regions');
  multi.zcard('loc_stats:cities');

  multi.exec(function (err, data) {
    var edges = {
      count: data[0]
    };
    var countries = {
      data: data[1],
      count: data[4]
    };
    var regions = {
      data: data[2],
      count: data[5]
    };
    var cities = {
      data: data[3],
      count: data[6]
    };
    console.log(edges);
    callback(err, {
      edges: edges,
      countries: countries,
      regions: regions,
      cities: cities
    });
  });
};

// Serve index page.
server.get('/', cacheFront, function (req, res) {
  redis.zrevrange('m:top', 0, 20, function (err, infoHashes) {
    // Performance optimization: Get multiple magnets at once.
    var multi = redis.multi();
    _.each(infoHashes, function (infoHash) {
      multi.hgetall('m:' + infoHash);
      // Retrieve latest points for data viz.
      multi.zrevrange('m:' + infoHash + ':ps', 0, 10);
    });
    multi.exec(function (err, data) {
      // Ideally, every second data element contains the historical graph data.
      _.each(data, function (datum, index) {
        if (datum.n) {
          datum.psPast = {};
          datum.psPast.labels = [];
          datum.psPast.data = [];
          _.each(data[index+1], function (point) {
            point = point.split(':');
            datum.psPast.labels.push(point[0]);
            datum.psPast.data.push(point[1]);
          });
        }
      });
      data = _.filter(data, function (datum) {
        return datum.n !== undefined;
      });
      // Get number of edges etc. in graph.
      getStats(function (err, stats) {
        res.render('index', {
          top: data,
          stats: stats
        });
      });
    });

  });
});

// Serve detailed view for one magnet URI.
server.get('/magnets/:infoHash', function (req, res) {

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
      // Use short names for performance reasons.
      redis.hmset('m:' + magnet.infoHash, {
        mu: magnetURI, // Magnet URI
        n: magnet.name,
        ih: magnet.infoHash,
        ca: createdAt, // Created at (Unix timestamp)
        ip: ip,
        ps: -1 // Points: Indicate that this magnet has not been crawled yet.
               // See bot.js for explanation of points.
      }, function (err) {
        redis.sadd('m:all', magnet.infoHash);
        redis.zadd('m:ca', createdAt, magnet.infoHash);
        redis.lpush('m:latest', magnet.infoHash);
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
