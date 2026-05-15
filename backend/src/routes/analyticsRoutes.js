const express = require('express');
const router = express.Router();
const { getForensicAnalytics } = require('../controllers/analyticsController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Only authenticated admins can access forensic intelligence metrics
router.get('/metrics', verifyToken, verifyAdmin, getForensicAnalytics);

module.exports = router;