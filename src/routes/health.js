/**
 * Health Route
 * GET /health - Health check endpoint
 */

import express from 'express';
import { testConnection } from '../services/alchemy.js';
import { config } from '../config.js';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', async (req, res) => {
  try {
    // Test Alchemy connection
    const alchemyOk = await testConnection('base-sepolia');

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      alchemy: {
        connected: alchemyOk,
        policyConfigured: !!config.getConfig().alchemy.policyId,
      },
      networks: {
        supported: Object.keys(config.getConfig().networks).length,
        list: Object.keys(config.getConfig().networks),
      },
    };

    res.json(health);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
