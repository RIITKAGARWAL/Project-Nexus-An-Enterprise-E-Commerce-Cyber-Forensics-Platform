const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// --- Inlined Enterprise Rate Limiter ---
const requestCounts = new Map();

// Clear tracking map every 15 minutes to prevent memory leaks
setInterval(() => {
  requestCounts.clear();
}, 15 * 60 * 1000);

const authLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, startTime: now });
    return next();
  }

  const clientData = requestCounts.get(ip);

  if (now - clientData.startTime > windowMs) {
    clientData.count = 1;
    clientData.startTime = now;
    return next();
  }

  clientData.count += 1;

  if (clientData.count > maxRequests) {
    return res.status(429).json({
      status: 'ERROR',
      message: 'Too many authentication attempts from this IP, please try again after 15 minutes.'
    });
  }

  next();
};
// ---------------------------------------

// Apply strict brute-force protection to sensitive authentication routes
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

module.exports = router;