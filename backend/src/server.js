const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const initializeDatabase = require('./config/initDb');
const setupSwagger = require('./config/swagger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Initialize DB Tables on Boot
initializeDatabase();

// Setup Swagger API Documentation Portal
setupSwagger(app);

app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'ONLINE',
      system: 'Project Nexus Enterprise Core',
      database: 'PostgreSQL Connected & Schema Active',
      dbTime: dbResult.rows[0].now,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      status: 'DEGRADED',
      database: 'Connection Failed',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

const { logAction } = require('./services/auditService');

app.post('/api/test-audit', async (req, res) => {
  try {
    const log = await logAction('TEST_FORENSIC_ACTION', 1, { details: 'System test audit record' });
    res.status(201).json({
      status: 'SUCCESS',
      message: 'Hash-chained audit log created successfully',
      log
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const forensicRoutes = require('./routes/forensicRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/forensics', forensicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`[Nexus Core] Server running on port ${PORT}`);
});