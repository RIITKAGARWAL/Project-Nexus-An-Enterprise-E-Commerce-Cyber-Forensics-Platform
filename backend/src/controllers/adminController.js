const db = require('../config/db');
const { logAction } = require('../services/auditService');

/**
 * Retrieves all platform users for administrative audit and management.
 */
const getAllUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT id, email, role, created_at FROM users ORDER BY id DESC');
    res.status(200).json({
      status: 'SUCCESS',
      count: result.rows.length,
      users: result.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Updates a user's role and logs the administrative privilege change to the forensic audit trail.
 */
const updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;
  const adminId = req.user.id;

  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role',
      [newRole, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = result.rows[0];

    // Log administrative privilege escalation/de-escalation to the immutable audit chain
    await logAction('USER_ROLE_UPDATED', adminId, {
      targetUserId: userId,
      newRole
    });

    res.status(200).json({
      status: 'SUCCESS',
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAllUsers, updateUserRole };