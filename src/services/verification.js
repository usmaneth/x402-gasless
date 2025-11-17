/**
 * Verification Service
 * Verify UserOperations and payment requirements
 */

import { parseUserOp, validateUSDCTransfer, getUserOpHash } from '../utils/userOpParser.js';
import { config } from '../config.js';
import { logger } from '../logger.js';

/**
 * Verify payment from payment header
 * @param {string} paymentHeader - Base64 encoded UserOp
 * @param {Object} paymentRequirements - Payment requirements
 * @returns {Promise<Object>} Verification result { isValid, invalidReason, userOp }
 */
export async function verifyPayment(paymentHeader, paymentRequirements) {
  try {
    // Step 1: Parse UserOp from payment header
    logger.debug('Parsing UserOp from payment header');
    const userOp = parseUserOp(paymentHeader);
    const userOpHash = getUserOpHash(userOp);

    logger.info({ userOpHash, sender: userOp.sender }, 'UserOp parsed successfully');

    // Step 2: Validate scheme
    if (paymentRequirements.scheme !== 'aa-erc4337') {
      return {
        isValid: false,
        invalidReason: `Unsupported payment scheme: ${paymentRequirements.scheme}`,
        userOp: null,
      };
    }

    // Step 3: Validate network
    const network = paymentRequirements.network;
    if (!config.getConfig().networks[network]) {
      return {
        isValid: false,
        invalidReason: `Unsupported network: ${network}`,
        userOp: null,
      };
    }

    // Step 4: Validate USDC contract matches
    const expectedUSDC = config.getUSDCContract(network);
    if (paymentRequirements.asset.toLowerCase() !== expectedUSDC.toLowerCase()) {
      return {
        isValid: false,
        invalidReason: `USDC contract mismatch: expected ${expectedUSDC}, got ${paymentRequirements.asset}`,
        userOp: null,
      };
    }

    // Step 5: Validate USDC transfer in UserOp callData
    logger.debug('Validating USDC transfer details');
    validateUSDCTransfer(userOp, paymentRequirements);

    logger.info({ userOpHash }, 'Payment verification successful');

    return {
      isValid: true,
      invalidReason: null,
      userOp,
    };
  } catch (error) {
    logger.warn({ error: error.message }, 'Payment verification failed');

    return {
      isValid: false,
      invalidReason: error.message,
      userOp: null,
    };
  }
}

/**
 * Verify UserOp signature (simplified - would use Account Kit in production)
 * @param {Object} userOp - UserOperation
 * @param {string} network - Network ID
 * @returns {Promise<boolean>} True if signature is valid
 */
export async function verifyUserOpSignature(userOp, network) {
  // TODO: Implement proper signature verification using Account Kit
  // For now, we'll do basic validation

  // Check signature exists and is non-empty
  if (!userOp.signature || userOp.signature === '0x' || userOp.signature === '0x00') {
    throw new Error('UserOp signature is empty');
  }

  // Check signature length (should be 65 bytes = 130 hex chars + 0x)
  if (userOp.signature.length < 132) {
    throw new Error('UserOp signature is too short');
  }

  logger.debug({ sender: userOp.sender }, 'UserOp signature validation passed');

  return true;
}

export default {
  verifyPayment,
  verifyUserOpSignature,
};
