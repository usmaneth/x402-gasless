/**
 * Logger Configuration
 * Using Pino for structured logging
 */

import pino from 'pino';
import { config } from './config.js';

const logConfig = config.getConfig().logging;

/**
 * Create Pino logger instance
 */
export const logger = pino({
  level: logConfig.level,
  transport: logConfig.pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

/**
 * Log startup information
 */
export function logStartupInfo() {
  const cfg = config.getConfig();

  logger.info('');
  logger.info('🚀 x402-gasless starting...');
  logger.info('');

  logger.info('✅ Configuration loaded');
  logger.info(`   • API Key: ${maskApiKey(cfg.alchemy.apiKey)}`);
  logger.info(`   • Gas Policy: ${maskPolicyId(cfg.alchemy.policyId)}`);
  logger.info(`   • Environment: ${cfg.server.env}`);
  logger.info('');

  logger.info(`🌐 Supported Networks (${Object.keys(cfg.networks).length}):`);
  Object.entries(cfg.networks).forEach(([id, net]) => {
    const testnetBadge = net.isTestnet ? ' [testnet]' : '';
    logger.info(`   ✅ ${id} (chain: ${net.chainId})${testnetBadge}`);
  });
  logger.info('');

  logger.info('💳 USDC Contracts:');
  Object.entries(cfg.usdcContracts).forEach(([network, address]) => {
    logger.info(`   ✅ ${network}: ${address}`);
  });
  logger.info('');

  logger.info('🔌 API Endpoints:');
  logger.info('   • POST   /verify');
  logger.info('   • POST   /settle');
  logger.info('   • GET    /supported');
  logger.info('   • GET    /health');
  logger.info('');

  logger.info(`🎯 Server starting on http://${cfg.server.host}:${cfg.server.port}`);
  logger.info('');
  logger.info('📚 Documentation: https://github.com/your-org/x402-gasless');
  logger.info('💡 Test health: curl http://localhost:' + cfg.server.port + '/health');
  logger.info('');
  logger.info('Ready to sponsor gasless transactions! 🎉');
  logger.info('');
}

/**
 * Mask API key for logging
 * @param {string} apiKey - API key
 * @returns {string} Masked API key
 */
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 8) return '****';
  return `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`;
}

/**
 * Mask policy ID for logging
 * @param {string} policyId - Policy ID
 * @returns {string} Masked policy ID
 */
function maskPolicyId(policyId) {
  if (!policyId || policyId.length < 8) return '****';
  return `${policyId.slice(0, 8)}...${policyId.slice(-4)}`;
}

export default logger;
