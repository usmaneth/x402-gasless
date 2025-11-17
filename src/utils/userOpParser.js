/**
 * UserOperation Parser
 * Parse and validate ERC-4337 UserOperations from payment headers
 */

import { decodePaymentHeader } from './encoding.js';

/**
 * Parse UserOperation from payment header
 * @param {string} paymentHeader - Base64 encoded UserOp
 * @returns {Object} Parsed UserOperation
 * @throws {Error} If parsing fails or UserOp is invalid
 */
export function parseUserOp(paymentHeader) {
  // Decode from base64
  const userOp = decodePaymentHeader(paymentHeader);

  // Validate UserOp structure
  validateUserOpStructure(userOp);

  return userOp;
}

/**
 * Validate UserOperation structure
 * @param {Object} userOp - UserOperation object
 * @throws {Error} If UserOp structure is invalid
 */
export function validateUserOpStructure(userOp) {
  const requiredFields = [
    'sender',
    'nonce',
    'callData',
    'callGasLimit',
    'verificationGasLimit',
    'preVerificationGas',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
    'signature',
  ];

  for (const field of requiredFields) {
    if (!(field in userOp)) {
      throw new Error(`Invalid UserOp: missing required field '${field}'`);
    }
  }

  // Validate hex strings
  const hexFields = ['sender', 'callData', 'signature'];
  for (const field of hexFields) {
    if (!isHexString(userOp[field])) {
      throw new Error(`Invalid UserOp: '${field}' must be a hex string`);
    }
  }

  // Validate initCode (can be empty or hex string)
  if ('initCode' in userOp && userOp.initCode !== '0x' && !isHexString(userOp.initCode)) {
    throw new Error(`Invalid UserOp: 'initCode' must be a hex string or '0x'`);
  }

  // Validate paymasterAndData (can be empty or hex string)
  if ('paymasterAndData' in userOp && userOp.paymasterAndData !== '0x' && !isHexString(userOp.paymasterAndData)) {
    throw new Error(`Invalid UserOp: 'paymasterAndData' must be a hex string or '0x'`);
  }
}

/**
 * Extract USDC transfer details from UserOp callData
 * @param {Object} userOp - UserOperation
 * @returns {Object} Transfer details { to, amount } or null if not a transfer
 */
export function extractTransferDetails(userOp) {
  const { callData } = userOp;

  // Check if this is a direct USDC transfer
  // ERC20 transfer function selector: 0xa9059cbb (transfer(address,uint256))
  if (callData.startsWith('0xa9059cbb')) {
    // Parse transfer(address to, uint256 amount)
    // Remove function selector (first 4 bytes = 8 hex chars + 0x)
    const params = callData.slice(10);

    // First parameter: to address (32 bytes = 64 hex chars, padded)
    const toAddress = '0x' + params.slice(24, 64);

    // Second parameter: amount (32 bytes = 64 hex chars)
    const amountHex = '0x' + params.slice(64, 128);
    const amount = BigInt(amountHex);

    return {
      to: toAddress.toLowerCase(),
      amount: amount.toString(),
    };
  }

  // Check if this is an execute call (for modular smart accounts)
  // execute(address target, uint256 value, bytes calldata data)
  // Function selector: 0xb61d27f6
  if (callData.startsWith('0xb61d27f6')) {
    // Parse execute call
    const params = callData.slice(10);

    // First parameter: target address (32 bytes, padded)
    const targetAddress = '0x' + params.slice(24, 64);

    // Third parameter: data (offset to bytes data)
    // For simplicity, we'll recursively parse the inner callData
    // In a real implementation, you'd need to properly decode the ABI

    // For now, just return null - we'll handle this in verification
    return null;
  }

  return null;
}

/**
 * Validate USDC transfer in UserOp
 * @param {Object} userOp - UserOperation
 * @param {Object} requirements - Payment requirements
 * @param {string} requirements.payTo - Expected recipient address
 * @param {string} requirements.maxAmountRequired - Minimum amount in USDC smallest units
 * @param {string} requirements.asset - USDC contract address
 * @returns {boolean} True if transfer is valid
 * @throws {Error} If transfer is invalid
 */
export function validateUSDCTransfer(userOp, requirements) {
  const transferDetails = extractTransferDetails(userOp);

  if (!transferDetails) {
    throw new Error('UserOp does not contain a valid USDC transfer');
  }

  const { to, amount } = transferDetails;

  // Validate recipient
  if (to.toLowerCase() !== requirements.payTo.toLowerCase()) {
    throw new Error(
      `Transfer recipient mismatch: expected ${requirements.payTo}, got ${to}`
    );
  }

  // Validate amount (must be >= required amount)
  const requiredAmount = BigInt(requirements.maxAmountRequired);
  const transferAmount = BigInt(amount);

  if (transferAmount < requiredAmount) {
    throw new Error(
      `Transfer amount insufficient: required ${requiredAmount}, got ${transferAmount}`
    );
  }

  return true;
}

/**
 * Check if string is a valid hex string
 * @param {string} str - String to check
 * @returns {boolean}
 */
function isHexString(str) {
  if (typeof str !== 'string') return false;
  if (!str.startsWith('0x')) return false;
  const hex = str.slice(2);
  return /^[0-9a-fA-F]*$/.test(hex);
}

/**
 * Get UserOp hash (for logging/tracking)
 * @param {Object} userOp - UserOperation
 * @returns {string} Simple hash representation
 */
export function getUserOpHash(userOp) {
  // Simple hash for tracking - in production you'd use proper UserOp hash calculation
  return `${userOp.sender.slice(0, 10)}...${userOp.nonce}`;
}
