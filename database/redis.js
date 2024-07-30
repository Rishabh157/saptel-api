/* eslint-disable no-inline-comments */
const { createClient } = require("redis");
const config = require("../config/config");
const logger = require("../config/logger");

let redisClient;
let isReady = false;

// const cacheOptions = config.redis
const cacheOptions = {
  url: config.redis.url,
};

if (config.redis.tlsFlag) {
  Object.assign(cacheOptions, {
    socket: {
      keepAlive: 300, // 5 minutes DEFAULT
      tls: false,
    },
  });
}

async function getRedisClient() {
  if (!isReady) {
    redisClient = createClient({
      ...cacheOptions,
    });
    redisClient.on("connect", () => {
      logger.info("Redis connected");
      isReady = true;
    });
    redisClient.on("error", (err) => {
      logger.error(`Redis Error: ${err}`);
      isReady = false;
    });

    await redisClient.connect();
  }
  return redisClient;
}

getRedisClient().catch((err) => {
  logger.error(err, "Failed to connect to Redis");
});

module.exports = { getRedisClient };
