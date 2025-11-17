/**
 * Verify Route
 * POST /verify - Verify UserOperation payment
 */

import express from 'express';
import { verifyPayment } from '../services/verification.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * POST /verify
 * Verify a UserOperation without executing it
 */
router.post('/', async (req, res, next) => {
  try {
    const { x402Version, paymentHeader, paymentRequirements } = req.body;

    // Validate request body
    if (!paymentHeader || !paymentRequirements) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: paymentHeader, paymentRequirements',
      });
    }

    // Validate x402 version
    if (x402Version !== 1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `Unsupported x402 version: ${x402Version}`,
      });
    }

    // Verify payment
    const result = await verifyPayment(paymentHeader, paymentRequirements);

    // Return verification result
    res.json({
      isValid: result.isValid,
      invalidReason: result.invalidReason,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
