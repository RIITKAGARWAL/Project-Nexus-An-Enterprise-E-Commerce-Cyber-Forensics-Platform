const redisClient = require('../config/redis');

/**
 * Enterprise Redis-backed sliding window rate limiter
 */
const rateLimiter = (limit = 10, windowSec = 60) => {
  return async (req, res, next) => {
    try {
      if (!redisClient.isOpen) {
        return next(); // Fallback gracefully if Redis is offline
      }

      const ip = req.ip || req.connection.remoteAddress;
      const key = `ratelimit:${ip}`;

      const requests = await redisClient.incr(key);
      if (requests === 1) {
        await redisClient.expire(key, windowSec);
      }

      if (requests > limit) {
        return res.status(429).json({
          status: 'ERROR',
          message: 'Too many requests from this IP, please try again later.'
        });
      }

      next();
    } catch (err) {
      // Fail open if cache errors out, ensuring high availability
      next();
    }
  };
};

module.exports = { rateLimiter };