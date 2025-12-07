const redis = require("redis"),
  config = require("../config").cfg;

var client;

var init = function () {
  let redisConf = config.redis;
  client = redis.createClient({
    socket: {
      host: redisConf.server,
      port: redisConf.port,
      tls: false,
    },
    password: redisConf.pass,
  });
  client.on("error", (err) => {
    console.log("redis error", err);
  });
  client
    .connect()
    .then(() => {
      console.log("redis connected");
    })
    .catch((err) => {
      console.log("redis failed", err);
    });
};
exports.setValue = function (key, value) {
  //client.flushAll().then(y=>console.log('flush')).catch(err=>console.log(err))
  return client
    .set(key, value)
    .then(function (response) {
      if (response) {
        // logger.info({
        //     'value': response
        // }, '_redisSetValue');
        return response;
      }
    })
    .catch(function (error) {
      return error;
    });
};
exports.getValue = function (key) {
  return client
    .get(key)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      return error;
    });
};

exports.expire = function (key, expiryTime) {
  return client
    .expireat(key, expiryTime)
    .then(function (response) {
      // logger.info({
      //     expire: response
      // }, '_expireToken');
      return response;
    })
    .catch(function (error) {
      // logger.error({
      //     'error': error
      // }, '_expireToken');
      console.log(error);
    });
};

exports.deleteValue = function (key) {
  return client
    .del(key)
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      throw error;
    });
};

init();
