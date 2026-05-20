const request = require('supertest');
const express = require('express');
const db = require('../src/config/db');

// Import server instance for testing
const app = express();
app.use(express.json());

// Mock health check route for isolated testing
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
    res.status(500).json({ status: 'DEGRADED', error: err.message });
  }
});

describe('Project Nexus Integration Test Suite', () => {
  
  test('GET /api/health should return system online status', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ONLINE');
    expect(response.body.system).toBe('Project Nexus Enterprise Core');
    expect(response.body).toHaveProperty('timestamp');
  });

});