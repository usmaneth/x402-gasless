/**
 * Request Logging Middleware
 * Log incoming HTTP requests
 */

import { logger } from '../logger.js';

/**
 * Request logging middleware
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function requestLogger(req, res, next) {
  const start = Date.now();

  // Log request
  logger.info(
    {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
    },
    'Incoming request'
  );

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
      },
      'Request completed'
    );
  });

  next();
}

export default requestLogger;
