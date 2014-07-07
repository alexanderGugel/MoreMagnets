// Get redis client.
var redis = require('./redis');

var DHT = require('bittorrent-dht');
var magnet = require('magnet-uri');

var dht = new DHT();

// Port 6881 works best.
var dhtPort = process.env.DHT_PORT || 6881;

dht.listen(dhtPort, function () {
  console.log('Bot started listening on port ' + dhtPort);
});

var crawl = function (magnetUri) {
  console.info('Crawling ' + magnetUri);
  // dht.lookup('CE9FBDAA734CFBC160E8EF9D29072646C09958DD');
  // Issue lookup multiple times (UDP packages might get lost).
  var counter = 0;
  var lookup = function () {
    console.info(++counter +'. lookup on ' + magnetUri);
    dht.lookup(magnetUri);
    if (counter === 10) {
      // We don't want to keep on executing the anonymous function every n
      // seconds if there is no peer having this torrent.
      clearInterval(timer);
      console.info('Stop lookup on bootstraped nodes for ' + magnetUri);
    }
  };
  // Lookup ASAP, don't wait 100 ms.
  lookup();
  var timer = setInterval(lookup, 100);
};

var crawlNext = function () {
  redis.lpop('crawl', function (err, magnetUri) {
    if (err) {
      console.error('Failed to retrieve crawl job: ' + err.message);
    } else if (magnetUri) {
      redis.rpush('crawl', magnetUri);
      crawl(magnetUri, function (err, data) {
      });
    }
  });
};

// Don't lookup before dht is ready (started listening).
dht.on('ready', function () {
  // Invoke crawlNext, since we don't want to wait 10 seconds before we start
  // retrieving the first crawl job.
  crawlNext();
  // Retrieve and crawl next Magnet URI every 10 seconds.
  setInterval(crawlNext, 10000);
});

var i = 0;

dht.on('peer', function (addr, hash, from) {
  console.info(++i, 'found potential peer ' + addr + ' using ' + from);
});
