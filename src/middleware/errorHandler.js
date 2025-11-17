/**
 * Error Handling Middleware
 * Global error handler for Express
 */

import { logger } from '../logger.js';
import { config } from '../config.js';

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Next middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error(
    {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    },
    'Request error'
  );

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build error response
  const errorResponse = {
    error: err.message || 'Internal Server Error',
    status: statusCode,
  };

  // Include stack trace in development
  if (config.isDevelopment()) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * 404 handler for unknown routes
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    status: 404,
    message: `Route ${req.method} ${req.path} not found`,
  });
}

export default errorHandler;
