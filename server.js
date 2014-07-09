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

var convertWithscoresToArrays = function (arr) {
  var arr1 = [];
  var arr2 = [];
  for (var i = 0; i < arr.length; i += 2) {
    arr1.push(arr[i]);
    arr2.push(arr[i+1]);
  }
  return [arr1, arr2];
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
  multi.zrevrange(['loc_stats:lls', 0, 5000, 'WITHSCORES']);
  multi.zrevrange(['peers', 0, 1000, 'WITHSCORES']);

  multi.exec(function (err, data) {
    var parsed;
    var edges = {
      count: data[0]
    };
    parsed = convertWithscoresToArrays(data[1]);
    var countries = {
      values: parsed[1],
      labels: parsed[0],
      count: data[4]
    };
    parsed = convertWithscoresToArrays(data[2]);
    var regions = {
      values: parsed[1],
      labels: parsed[0],
      count: data[5]
    };
    parsed = convertWithscoresToArrays(data[3]);
    var cities = {
      values: parsed[1],
      labels: parsed[0],
      count: data[6]
    };
    var lls = data[7];
    var peers = data[8];

    var stats = {};
    for (var i = 0; i < peers.length; i += 2) {
      var addr = peers[i];
      var createdAt = peers[i+1];
      // Similar to crawler (hash function).
      var time = Math.floor(parseInt(createdAt)/50);
      stats[time] = stats[time] || 0;
      stats[time] += 1;
    }

    peers = {
      labels: _.keys(stats),
      data: _.values(stats)
    };
    callback(err, {
      edges: edges,
      countries: countries,
      regions: regions,
      cities: cities,
      lls: lls,
      peers: peers
    });
  });
};

var getTop = function (callback) {
  redis.zrevrange('m:top', 0, 31, function (err, infoHashes) {
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
      callback(null, data);
    });
  });
};

var getLatest = function (callback) {
  redis.lrange('m:latest', 0, 50, function (err, infoHashes) {
    // Performance optimization: Get multiple magnets at once.
    var multi = redis.multi();
    _.each(infoHashes, function (infoHash) {
      multi.hgetall('m:' + infoHash);
    });
    multi.exec(function (err, latest) {
      callback(null, latest);
    });
  });
};

// Serve index page.
server.get('/', cacheFront, function (req, res) {
  // Get number of edges etc. in graph.
  getStats(function (err, stats) {
    getTop(function (err, top) {
      getLatest(function (err, latest) {
        res.render('index', {
          top: top,
          latest: latest,
          stats: stats
        });
      });
    });
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
      res.redirect('/#submit');
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
        res.redirect('/#latest');
      });
    }
  });
});

var port = process.env.PORT || 3141;
server.listen(port, function () {
  console.info('Express server listening on port ' + port);
});
