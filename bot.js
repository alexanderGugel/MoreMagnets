// Get redis client.
var redis = require('./redis');

var DHT = require('bittorrent-dht');
var dht = new DHT();

// Port 6881 works best.
var dhtPort = process.env.DHT_PORT || 6881;

dht.listen(dhtPort, function () {
  console.log('Bot started listening on port ' + dhtPort);
});

// Don't lookup before dht is ready (started listening).
dht.on('ready', function () {
  dht.lookup('CE9FBDAA734CFBC160E8EF9D29072646C09958DD');
});

var i = 0;

dht.on('peer', function (addr, hash, from) {
  console.log(i++, 'found potential peer ' + addr + ' using ' + from);
});
