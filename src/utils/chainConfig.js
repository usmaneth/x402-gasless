/**
 * Chain Configuration
 * Pre-configured network settings and USDC contracts for all supported chains
 */

/**
 * USDC contract addresses by network
 */
export const USDC_CONTRACTS = {
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'base-mainnet': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'eth-sepolia': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  'eth-mainnet': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'polygon-mainnet': '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
  'arbitrum-mainnet': '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  'optimism-mainnet': '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
};

/**
 * Network configurations
 * Includes chain ID, name, RPC/bundler URLs
 */
export const NETWORK_CONFIGS = {
  'base-sepolia': {
    chainId: 84532,
    name: 'Base Sepolia',
    isTestnet: true,
    getRpcUrl: (apiKey) => `https://base-sepolia.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://base-sepolia.g.alchemy.com/v2/${apiKey}`,
  },
  'base-mainnet': {
    chainId: 8453,
    name: 'Base',
    isTestnet: false,
    getRpcUrl: (apiKey) => `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
  },
  'eth-sepolia': {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    isTestnet: true,
    getRpcUrl: (apiKey) => `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`,
  },
  'eth-mainnet': {
    chainId: 1,
    name: 'Ethereum',
    isTestnet: false,
    getRpcUrl: (apiKey) => `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
  },
  'polygon-mainnet': {
    chainId: 137,
    name: 'Polygon',
    isTestnet: false,
    getRpcUrl: (apiKey) => `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
  },
  'arbitrum-mainnet': {
    chainId: 42161,
    name: 'Arbitrum',
    isTestnet: false,
    getRpcUrl: (apiKey) => `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://arb-mainnet.g.alchemy.com/v2/${apiKey}`,
  },
  'optimism-mainnet': {
    chainId: 10,
    name: 'Optimism',
    isTestnet: false,
    getRpcUrl: (apiKey) => `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`,
    getBundlerUrl: (apiKey) => `https://opt-mainnet.g.alchemy.com/v2/${apiKey}`,
  },
};

/**
 * Get USDC contract address for a network
 * @param {string} network - Network ID
 * @returns {string} USDC contract address
 * @throws {Error} If network not supported
 */
export function getUSDCContract(network) {
  const address = USDC_CONTRACTS[network];
  if (!address) {
    throw new Error(`USDC contract not configured for network: ${network}`);
  }
  return address;
}

/**
 * Get network configuration
 * @param {string} network - Network ID
 * @param {string} apiKey - Alchemy API key
 * @returns {Object} Network configuration with URLs
 * @throws {Error} If network not supported
 */
export function getNetworkConfig(network, apiKey) {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unsupported network: ${network}`);
  }

  return {
    ...config,
    rpcUrl: config.getRpcUrl(apiKey),
    bundlerUrl: config.getBundlerUrl(apiKey),
    usdcContract: getUSDCContract(network),
  };
}

/**
 * Get all supported networks
 * @returns {string[]} Array of network IDs
 */
export function getSupportedNetworks() {
  return Object.keys(NETWORK_CONFIGS);
}

/**
 * Check if a network is supported
 * @param {string} network - Network ID
 * @returns {boolean}
 */
export function isNetworkSupported(network) {
  return network in NETWORK_CONFIGS;
}

/**
 * Get chain ID for network
 * @param {string} network - Network ID
 * @returns {number} Chain ID
 */
export function getChainId(network) {
  const config = NETWORK_CONFIGS[network];
  if (!config) {
    throw new Error(`Unknown network: ${network}`);
  }
  return config.chainId;
}

/**
 * Get network by chain ID
 * @param {number} chainId - Chain ID
 * @returns {string|null} Network ID or null if not found
 */
export function getNetworkByChainId(chainId) {
  for (const [network, config] of Object.entries(NETWORK_CONFIGS)) {
    if (config.chainId === chainId) {
      return network;
    }
  }
  return null;
}
