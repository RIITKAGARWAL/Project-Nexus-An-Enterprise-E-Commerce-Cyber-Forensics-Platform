const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Both routes are strictly protected by JWT verification and Admin role checks
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
router.patch('/users/role', verifyToken, verifyAdmin, updateUserRole);

module.exports = router;