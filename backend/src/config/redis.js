const Redis = require('redis');
require('dotenv').config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('[Redis Client Error]', err);
});

(async () => {
  try {
    await redisClient.connect();
    console.log('[Redis] Connected to cache instance successfully.');
  } catch (err) {
    console.warn('[Redis] Connection failed. Running without distributed cache fallback.');
  }
})();

module.exports = redisClient;