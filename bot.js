// Get redis client.
var redis = require('./redis');
var DHT = require('bittorrent-dht');

var dht = new DHT();

var dhtPort = process.env.DHT_PORT || 6881;
dht.listen(dhtPort, function () {
  console.log('now listening');
});

dht.on('ready', function () {
  dht.lookup('CE9FBDAA734CFBC160E8EF9D29072646C09958DD');
});

var i = 0;

dht.on('peer', function (addr, hash, from) {
  console.log(i++, 'found potential peer ' + addr + ' using ' + from);
});

console.log('bot2');
