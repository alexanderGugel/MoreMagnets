// Get redis client.
var redis = require('./redis');
var geoip = require('geoip-lite');

var _ = require('lodash');

// TODO Currently very inefficient, since data is being regenerated every time.

var genLocStats = function () {
  redis.zrevrange('nodes', 0, 1000000, function (err, addrs) {
    // Key: location in format country:region:city
    // Value: count
    var countries = {};
    var regions = {};
    var cities = {};
    _.each(addrs, function (addr) {
      addr = addr.split(':')[0];
      var geo = geoip.lookup(addr);
      if (geo) {
        countries[geo.country] = countries[geo.country] || 0;
        countries[geo.country]++;
        regions[geo.region] = regions[geo.region] || 0;
        regions[geo.region]++;
        cities[geo.city] = cities[geo.city] || 0;
        cities[geo.city]++;
      }
    });
    redis.hmset('loc_stats:countries', countries);
    redis.hmset('loc_stats:regions', regions);
    redis.hmset('loc_stats:cities', cities);
    setTimeout(function () {
      genLocStats();
    }, 1000);
  });
};

genLocStats();
