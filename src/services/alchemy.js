/**
 * Alchemy Service
 * Wrapper around Alchemy SDK for Account Abstraction operations
 */

import { Alchemy, Network } from 'alchemy-sdk';
import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Network mapping to Alchemy SDK Network enum
 */
const NETWORK_MAP = {
  'base-sepolia': Network.BASE_SEPOLIA,
  'base-mainnet': Network.BASE_MAINNET,
  'eth-sepolia': Network.ETH_SEPOLIA,
  'eth-mainnet': Network.ETH_MAINNET,
  'polygon-mainnet': Network.MATIC_MAINNET,
  'arbitrum-mainnet': Network.ARB_MAINNET,
  'optimism-mainnet': Network.OPT_MAINNET,
};

/**
 * Alchemy SDK instances cache
 */
const alchemyInstances = {};

/**
 * Get Alchemy SDK instance for a network
 * @param {string} network - Network ID
 * @returns {Alchemy} Alchemy SDK instance
 */
export function getAlchemyInstance(network) {
  // Return cached instance if exists
  if (alchemyInstances[network]) {
    return alchemyInstances[network];
  }

  // Get network config
  const networkConfig = config.getNetwork(network);
  const alchemyNetwork = NETWORK_MAP[network];

  if (!alchemyNetwork) {
    throw new Error(`Alchemy SDK network not configured for: ${network}`);
  }

  // Create new instance
  const instance = new Alchemy({
    apiKey: config.getConfig().alchemy.apiKey,
    network: alchemyNetwork,
  });

  // Cache for future use
  alchemyInstances[network] = instance;

  logger.debug({ network, chainId: networkConfig.chainId }, 'Created Alchemy SDK instance');

  return instance;
}

/**
 * Test Alchemy connection
 * @param {string} network - Network ID (default: base-sepolia)
 * @returns {Promise<boolean>} True if connection successful
 */
export async function testConnection(network = 'base-sepolia') {
  try {
    const alchemy = getAlchemyInstance(network);
    const blockNumber = await alchemy.core.getBlockNumber();
    logger.debug({ network, blockNumber }, 'Alchemy connection test successful');
    return true;
  } catch (error) {
    logger.error({ network, error: error.message }, 'Alchemy connection test failed');
    return false;
  }
}

/**
 * Get transaction receipt
 * @param {string} network - Network ID
 * @param {string} txHash - Transaction hash
 * @returns {Promise<Object>} Transaction receipt
 */
export async function getTransactionReceipt(network, txHash) {
  const alchemy = getAlchemyInstance(network);
  return await alchemy.core.getTransactionReceipt(txHash);
}

/**
 * Get current gas prices for network
 * @param {string} network - Network ID
 * @returns {Promise<Object>} Gas price information
 */
export async function getGasPrice(network) {
  const alchemy = getAlchemyInstance(network);
  const feeData = await alchemy.core.getFeeData();
  return {
    maxFeePerGas: feeData.maxFeePerGas?.toString(),
    maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
    gasPrice: feeData.gasPrice?.toString(),
  };
}

export default {
  getAlchemyInstance,
  testConnection,
  getTransactionReceipt,
  getGasPrice,
};
