// Get redis client.
var redis = require('./redis');
var geoip = require('geoip-lite');

var _ = require('lodash');

// TODO Currently very inefficient, since data is being regenerated every time.

var genLocStats = function () {
  var multi = redis.multi();
  multi.zrevrange('nodes', 0, 1000000);
  multi.del('loc_stats:countries:copy');
  multi.del('loc_stats:regions:copy');
  multi.del('loc_stats:cities:copy');
  multi.exec(function (err, results) {
    var addrs = results[0];
    _.each(addrs, function (addr) {
      addr = addr.split(':')[0];
      var geo = geoip.lookup(addr);
      if (geo) {
        redis.zincrby('loc_stats:countries:copy', 1, geo.country);
        redis.zincrby('loc_stats:regions:copy', 1, geo.region);
        redis.zincrby('loc_stats:cities:copy', 1, geo.city);
      }
    });
    redis.rename('loc_stats:countries:copy', 'loc_stats:countries');
    redis.rename('loc_stats:regions:copy', 'loc_stats:regions');
    redis.rename('loc_stats:cities:copy', 'loc_stats:cities');
  });
  setTimeout(function () {
    genLocStats();
  }, 1000);
};

genLocStats();
