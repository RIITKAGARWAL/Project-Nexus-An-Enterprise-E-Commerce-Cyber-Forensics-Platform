const express = require('express');
const router = express.Router();
const { verifyAuditChain } = require('../controllers/forensicController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Only authenticated admins can run cryptographic forensic chain verifications
router.get('/verify', verifyToken, verifyAdmin, verifyAuditChain);

module.exports = router;