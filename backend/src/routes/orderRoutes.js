const express = require('express');
const router = express.Router();
const { createOrder, getUserOrders, getUserOrderHistory } = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// Authenticated users can place orders and view their history
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getUserOrders);
router.get('/history', verifyToken, getUserOrderHistory);

module.exports = router;