const db = require('../config/db');

/**
 * Computes forensic threat analytics and audit log statistics for administrators.
 */
const getForensicAnalytics = async (req, res) => {
  try {
    // 1. Fetch total audit log count
    const totalLogsResult = await db.query('SELECT COUNT(*) FROM audit_logs');
    const totalLogs = parseInt(totalLogsResult.rows.total_count || totalLogsResult.rows[0].count, 10);

    // 2. Aggregate actions by type (e.g., USER_REGISTERED, PRODUCT_CREATED, ORDER_CREATED)
    const actionBreakdownResult = await db.query(
      'SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC'
    );

    // 3. Find the most recent forensic activity timestamp
    const latestLogResult = await db.query(
      'SELECT timestamp FROM audit_logs ORDER BY id DESC LIMIT 1'
    );
    const lastLoggedAt = latestLogResult.rows.length > 0 ? latestLogResult.rows[0].timestamp : null;

    // 4. Construct compliance and threat report payload
    res.status(200).json({
      status: 'SUCCESS',
      system: 'Project Nexus Forensic Intelligence Engine',
      metrics: {
        totalAuditEntries: totalLogs,
        actionDistribution: actionBreakdownResult.rows,
        lastActivityTimestamp: lastLoggedAt,
        integrityStatus: 'CHAIN_MONITORED'
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Failed to generate forensic analytics report',
      error: err.message 
    });
  }
};

module.exports = { getForensicAnalytics };