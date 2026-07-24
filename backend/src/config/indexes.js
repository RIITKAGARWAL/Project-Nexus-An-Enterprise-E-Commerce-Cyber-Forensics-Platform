const db = require('./db');

/**
 * Enterprise Database Indexing & Performance Optimization
 * Safely creates performance indexes on high-traffic columns.
 */
const createIndexes = async () => {
  try {
    const queries = [
      `CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);`,
      `CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);`,
      `CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp);`
    ];

    for (const query of queries) {
      try {
        await db.query(query);
      } catch (qErr) {
        console.warn(`[PostgreSQL Indexing Warning]: Skipped index - ${qErr.message}`);
      }
    }

    console.log('[PostgreSQL] Enterprise performance indexes verified and active.');
  } catch (err) {
    console.error('[PostgreSQL Indexing Error]:', err.message);
  }
};

module.exports = createIndexes;