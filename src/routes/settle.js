/**
 * Settle Route
 * POST /settle - Settle UserOperation payment with gas sponsorship
 */

import express from 'express';
import { settlePayment } from '../services/settlement.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * POST /settle
 * Settle a verified payment by submitting to blockchain
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

    // Settle payment
    const result = await settlePayment(paymentHeader, paymentRequirements);

    // Return settlement result
    res.json({
      success: result.success,
      txHash: result.txHash,
      networkId: result.networkId,
      error: result.error,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
