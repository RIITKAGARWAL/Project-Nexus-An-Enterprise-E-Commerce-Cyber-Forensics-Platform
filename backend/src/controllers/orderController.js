const db = require('../config/db');
const { logAction } = require('../services/auditService');

/**
 * Creates a new customer order with payment status and optional EMI, logging to the forensic chain.
 */
const createOrder = async (req, res) => {
  const { totalAmount, emiSelected } = req.body;
  const userId = req.user.id; // Extracted from verified JWT middleware

  try {
    const insertResult = await db.query(
      `INSERT INTO orders (user_id, total_amount, payment_status, emi_selected) 
       VALUES ($1, $2, 'PAID', $3) RETURNING *`,
      [userId, totalAmount, emiSelected || false]
    );

    const newOrder = insertResult.rows[0];

    // Secure audit log for financial transaction
    await logAction('ORDER_CREATED', userId, {
      orderId: newOrder.id,
      totalAmount: newOrder.total_amount,
      emiSelected: newOrder.emi_selected
    });

    res.status(201).json({
      message: 'Order placed and payment processed successfully',
      order: newOrder
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Retrieves the complete order history for the authenticated user.
 */
const getUserOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY id DESC', 
      [userId]
    );
    res.status(200).json({
      status: 'SUCCESS',
      count: result.rows.length,
      orders: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Export both names to guarantee route compatibility
const getUserOrderHistory = getUserOrders;

module.exports = { createOrder, getUserOrders, getUserOrderHistory };