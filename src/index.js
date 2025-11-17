/**
 * x402-gasless - Main Application
 * Gasless x402 facilitator using Alchemy Account Abstraction
 */

import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { logger, logStartupInfo } from './logger.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Import routes
import verifyRoute from './routes/verify.js';
import settleRoute from './routes/settle.js';
import supportedRoute from './routes/supported.js';
import healthRoute from './routes/health.js';

/**
 * Create Express app
 */
const app = express();

// Get configuration
const cfg = config.getConfig();

// Middleware
app.use(cors(cfg.cors));
app.use(express.json());
app.use(requestLogger);

// API Routes
app.use('/verify', verifyRoute);
app.use('/settle', settleRoute);
app.use('/supported', supportedRoute);
app.use('/health', healthRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'x402-gasless',
    version: '1.0.0',
    description: 'Gasless x402 facilitator using Alchemy Account Abstraction',
    endpoints: {
      verify: 'POST /verify',
      settle: 'POST /settle',
      supported: 'GET /supported',
      health: 'GET /health',
    },
    documentation: 'https://github.com/your-org/x402-gasless',
  });
});

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Start server
 */
async function start() {
  try {
    // Log startup information
    logStartupInfo();

    // Start listening
    app.listen(cfg.server.port, cfg.server.host, () => {
      logger.info(`✅ Server running at http://${cfg.server.host}:${cfg.server.port}`);
      logger.info('');
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to start server');
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error({ error: error.message, stack: error.stack }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// Start the server
start();

export default app;
