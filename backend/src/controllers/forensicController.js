const crypto = require('crypto');
const db = require('../config/db');

/**
 * Verifies the integrity of the entire audit log hash chain.
 * Detects if any record in the database has been tampered with.
 */
const verifyAuditChain = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM audit_logs ORDER BY id ASC');
    const logs = result.rows;

    if (logs.length === 0) {
      return res.status(200).json({
        status: 'SECURE',
        message: 'Audit log chain is empty. No anomalies detected.',
        verifiedRecords: 0
      });
    }

    let previousHash = '0000000000000000000000000000000000000000000000000000000000000000';
    let chainIntact = true;
    let compromisedRecordId = null;

    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];

      // Check if previous_hash link matches
      if (log.previous_hash !== previousHash) {
        chainIntact = false;
        compromisedRecordId = log.id;
        break;
      }

      // Ensure timestamp is normalized back to the exact ISO string format used during creation
      const formattedTimestamp = new Date(log.timestamp).toISOString();

      // Recompute the hash to verify current integrity
      const rawStringForHashing = `${log.previous_hash}:${log.action}:${log.actor_id || 'SYSTEM'}:${log.payload_encrypted}:${formattedTimestamp}`;
      const recomputedHash = crypto.createHash('sha256').update(rawStringForHashing).digest('hex');

      if (recomputedHash !== log.current_hash) {
        chainIntact = false;
        compromisedRecordId = log.id;
        break;
      }

      previousHash = log.current_hash;
    }

    if (!chainIntact) {
      return res.status(409).json({
        status: 'COMPROMISED',
        alert: 'Cryptographic chain mismatch detected! Historical forensic records have been altered.',
        compromisedAtId: compromisedRecordId
      });
    }

    res.status(200).json({
      status: 'VERIFIED_SECURE',
      message: 'Forensic audit log chain is 100% intact. No tampering detected.',
      totalRecordsVerified: logs.length,
      latestHash: previousHash
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { verifyAuditChain };