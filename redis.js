// Connect to Redis.
var redisPort = process.env.REDIS_PORT || 6379;
var redisHost = process.env.REDIS_HOST || '127.0.0.1';
var redis = require('redis').createClient(redisPort, redisHost);

module.exports = redis;
