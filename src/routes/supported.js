/**
 * Supported Route
 * GET /supported - Get supported payment schemes and networks
 */

import express from 'express';
import { config } from '../config.js';

const router = express.Router();

/**
 * GET /supported
 * Return list of supported payment schemes and networks
 */
router.get('/', (req, res) => {
  const supported = config.getSupportedSchemes();

  res.json({
    kinds: supported,
  });
});

export default router;
