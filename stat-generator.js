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
  multi.del('loc_stats:lls:copy');
  multi.exec(function (err, results) {
    var addrs = results[0];
    _.each(addrs, function (addr) {
      addr = addr.split(':')[0];
      var geo = geoip.lookup(addr);
      if (geo) {
        !!geo.country && redis.zincrby('loc_stats:countries:copy', 1, geo.country);
        !!geo.region && redis.zincrby('loc_stats:regions:copy', 1, geo.region);
        !!geo.city && redis.zincrby('loc_stats:cities:copy', 1, geo.city);
        !!geo.ll && redis.zincrby('loc_stats:lls:copy', 1, geo.ll.join('|'));
      }
    });
    redis.rename('loc_stats:countries:copy', 'loc_stats:countries');
    redis.rename('loc_stats:regions:copy', 'loc_stats:regions');
    redis.rename('loc_stats:cities:copy', 'loc_stats:cities');
    redis.rename('loc_stats:lls:copy', 'loc_stats:lls');
    genLocStats();
  });
};

genLocStats();
