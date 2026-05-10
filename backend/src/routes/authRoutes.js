const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { rateLimiter } = require('../middleware/rateLimiter');

// Limit login attempts to 5 per minute per IP to prevent brute-forcing
router.post('/register', rateLimiter(10, 60), register);
router.post('/login', rateLimiter(5, 60), login);

module.exports = router;