/**
 * Settlement Service
 * Submit UserOperations with Alchemy Gas Manager sponsorship
 */

import { parseUserOp, getUserOpHash } from '../utils/userOpParser.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Settle payment by submitting UserOp with gas sponsorship
 * @param {string} paymentHeader - Base64 encoded UserOp
 * @param {Object} paymentRequirements - Payment requirements
 * @returns {Promise<Object>} Settlement result { success, txHash, networkId, error }
 */
export async function settlePayment(paymentHeader, paymentRequirements) {
  try {
    // Step 1: Parse UserOp
    const userOp = parseUserOp(paymentHeader);
    const userOpHash = getUserOpHash(userOp);
    const network = paymentRequirements.network;

    logger.info({ userOpHash, network }, 'Starting payment settlement');

    // Step 2: Add Alchemy Gas Manager paymaster data
    const userOpWithPaymaster = await addPaymasterData(userOp, network);

    // Step 3: Submit UserOp to bundler
    const txHash = await submitUserOp(userOpWithPaymaster, network);

    logger.info({ userOpHash, txHash, network }, 'Payment settled successfully');

    return {
      success: true,
      txHash,
      networkId: network,
      error: null,
    };
  } catch (error) {
    logger.error({ error: error.message }, 'Payment settlement failed');

    return {
      success: false,
      txHash: null,
      networkId: paymentRequirements.network,
      error: error.message,
    };
  }
}

/**
 * Add Alchemy Gas Manager paymaster data to UserOp
 * @param {Object} userOp - UserOperation
 * @param {string} network - Network ID
 * @returns {Promise<Object>} UserOp with paymaster data
 */
async function addPaymasterData(userOp, network) {
  const cfg = config.getConfig();
  const policyId = cfg.alchemy.policyId;

  logger.debug({ network, policyId: policyId.slice(0, 8) + '...' }, 'Adding paymaster data');

  // TODO: Integrate with Alchemy Account Kit to get real paymaster data
  // For now, we'll add a placeholder
  //
  // In production, this would call:
  // const paymasterAndData = await alchemyGasManager.getPaymasterAndData({
  //   userOp,
  //   policyId,
  // });

  // Simplified implementation - would use Alchemy SDK in production
  const userOpWithPaymaster = {
    ...userOp,
    paymasterAndData: await getPaymasterAndData(userOp, network, policyId),
  };

  return userOpWithPaymaster;
}

/**
 * Get paymaster and data from Alchemy Gas Manager
 * @param {Object} userOp - UserOperation
 * @param {string} network - Network ID
 * @param {string} policyId - Gas Manager policy ID
 * @returns {Promise<string>} Paymaster and data hex string
 */
async function getPaymasterAndData(userOp, network, policyId) {
  // TODO: Implement real Alchemy Gas Manager integration
  // This would call Alchemy's paymaster API:
  //
  // POST https://base-sepolia.g.alchemy.com/v2/{apiKey}
  // {
  //   "method": "alchemy_requestGasAndPaymasterAndData",
  //   "params": [{
  //     "policyId": policyId,
  //     "entryPoint": "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
  //     "userOperation": userOp
  //   }]
  // }

  logger.debug('Getting paymaster and data from Alchemy Gas Manager');

  const cfg = config.getConfig();
  const networkConfig = cfg.networks[network];
  const apiKey = cfg.alchemy.apiKey;

  try {
    const response = await fetch(networkConfig.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_requestGasAndPaymasterAndData',
        params: [
          {
            policyId,
            entryPoint: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint v0.6
            userOperation: userOp,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Alchemy Gas Manager error: ${data.error.message}`);
    }

    // Response includes paymasterAndData field
    return data.result.paymasterAndData || '0x';
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to get paymaster data');
    throw new Error(`Failed to get paymaster data: ${error.message}`);
  }
}

/**
 * Submit UserOp to bundler
 * @param {Object} userOp - UserOperation with paymaster data
 * @param {string} network - Network ID
 * @returns {Promise<string>} Transaction hash
 */
async function submitUserOp(userOp, network) {
  logger.debug({ network }, 'Submitting UserOp to bundler');

  const cfg = config.getConfig();
  const networkConfig = cfg.networks[network];

  try {
    // Submit to Alchemy bundler
    const response = await fetch(networkConfig.bundlerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_sendUserOperation',
        params: [
          userOp,
          '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789', // EntryPoint v0.6
        ],
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Bundler error: ${data.error.message}`);
    }

    const userOpHash = data.result;

    // Wait for UserOp to be mined and get transaction hash
    const txHash = await waitForUserOpReceipt(userOpHash, network);

    return txHash;
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to submit UserOp');
    throw new Error(`Failed to submit UserOp: ${error.message}`);
  }
}

/**
 * Wait for UserOp receipt and get transaction hash
 * @param {string} userOpHash - UserOperation hash
 * @param {string} network - Network ID
 * @returns {Promise<string>} Transaction hash
 */
async function waitForUserOpReceipt(userOpHash, network) {
  const cfg = config.getConfig();
  const networkConfig = cfg.networks[network];

  logger.debug({ userOpHash }, 'Waiting for UserOp receipt');

  // Poll for receipt (simplified - would use better polling logic in production)
  for (let i = 0; i < 30; i++) {
    // Try for 30 seconds
    try {
      const response = await fetch(networkConfig.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getUserOperationReceipt',
          params: [userOpHash],
        }),
      });

      const data = await response.json();

      if (data.result) {
        const receipt = data.result;
        logger.info({ txHash: receipt.receipt.transactionHash }, 'UserOp receipt received');
        return receipt.receipt.transactionHash;
      }
    } catch (error) {
      // Continue polling
    }

    // Wait 1 second before retry
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error('Timeout waiting for UserOp receipt');
}

export default {
  settlePayment,
};
