/**
 * Smart Configuration System
 * Auto-configures everything from just 2 environment variables
 */

import dotenv from 'dotenv';
import { getSupportedNetworks, getNetworkConfig, USDC_CONTRACTS } from './utils/chainConfig.js';

// Load environment variables
dotenv.config();

class SmartConfig {
  constructor() {
    // Validate required environment variables
    this.validateRequired();

    // Build configuration with smart defaults
    this.buildConfig();
  }

  /**
   * Validate required environment variables
   * @throws {Error} If required variables are missing
   */
  validateRequired() {
    const required = ['ALCHEMY_API_KEY', 'ALCHEMY_GAS_POLICY_ID'];
    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach((key) => console.error(`   - ${key}`));
      console.error('\n💡 Copy .env.example to .env and fill in your values');
      console.error('💡 Run: npm run setup\n');
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    // Validate API key format (basic check)
    if (!process.env.ALCHEMY_API_KEY || process.env.ALCHEMY_API_KEY.length < 20) {
      throw new Error('ALCHEMY_API_KEY appears to be invalid (too short)');
    }

    // Validate policy ID format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(process.env.ALCHEMY_GAS_POLICY_ID)) {
      console.warn('⚠️  ALCHEMY_GAS_POLICY_ID does not appear to be a valid UUID');
      console.warn('   Policy validation will occur on first transaction attempt\n');
    }
  }

  /**
   * Build configuration with smart defaults
   */
  buildConfig() {
    const apiKey = process.env.ALCHEMY_API_KEY;

    this.config = {
      // Server settings
      server: {
        port: parseInt(process.env.PORT) || 3000,
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development',
      },

      // Alchemy settings
      alchemy: {
        apiKey,
        policyId: process.env.ALCHEMY_GAS_POLICY_ID,
      },

      // Auto-configure all supported networks
      networks: this.configureNetworks(apiKey),

      // USDC contracts (pre-configured)
      usdcContracts: USDC_CONTRACTS,

      // Logging
      logging: {
        level: process.env.LOG_LEVEL || 'info',
        pretty: process.env.NODE_ENV === 'development',
      },

      // CORS
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
      },

      // Rate limiting (optional)
      rateLimit: {
        enabled: process.env.RATE_LIMIT_ENABLED !== 'false',
        max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
      },
    };
  }

  /**
   * Configure all supported networks
   * @param {string} apiKey - Alchemy API key
   * @returns {Object} Network configurations
   */
  configureNetworks(apiKey) {
    const networks = {};
    const supportedNetworks = getSupportedNetworks();

    for (const network of supportedNetworks) {
      networks[network] = getNetworkConfig(network, apiKey);
    }

    return networks;
  }

  /**
   * Get network configuration
   * @param {string} networkId - Network ID
   * @returns {Object} Network configuration
   * @throws {Error} If network not supported
   */
  getNetwork(networkId) {
    const network = this.config.networks[networkId];
    if (!network) {
      throw new Error(`Unsupported network: ${networkId}`);
    }
    return network;
  }

  /**
   * Get USDC contract for network
   * @param {string} networkId - Network ID
   * @returns {string} USDC contract address
   */
  getUSDCContract(networkId) {
    const contract = this.config.usdcContracts[networkId];
    if (!contract) {
      throw new Error(`USDC contract not configured for network: ${networkId}`);
    }
    return contract;
  }

  /**
   * Get all supported payment schemes
   * @returns {Array<Object>} Array of supported schemes
   */
  getSupportedSchemes() {
    return Object.keys(this.config.networks).map((network) => ({
      scheme: 'aa-erc4337',
      network,
    }));
  }

  /**
   * Get full configuration
   * @returns {Object} Configuration object
   */
  getConfig() {
    return this.config;
  }

  /**
   * Check if running in development mode
   * @returns {boolean}
   */
  isDevelopment() {
    return this.config.server.env === 'development';
  }

  /**
   * Check if running in production mode
   * @returns {boolean}
   */
  isProduction() {
    return this.config.server.env === 'production';
  }
}

// Export singleton instance
export const config = new SmartConfig();

// Export config object for convenience
export default config.getConfig();
