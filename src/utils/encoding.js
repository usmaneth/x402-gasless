/**
 * Encoding Utilities
 * Base64 encoding/decoding for payment headers
 */

/**
 * Encode payment data to base64
 * @param {Object} data - Payment data object
 * @returns {string} Base64 encoded string
 */
export function encodePaymentData(data) {
  const jsonString = JSON.stringify(data);
  return Buffer.from(jsonString, 'utf-8').toString('base64');
}

/**
 * Decode payment header from base64
 * @param {string} encoded - Base64 encoded payment header
 * @returns {Object} Decoded payment data
 * @throws {Error} If decoding fails
 */
export function decodePaymentHeader(encoded) {
  try {
    const jsonString = Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to decode payment header: ${error.message}`);
  }
}

/**
 * Validate payment header format
 * @param {string} encoded - Base64 encoded payment header
 * @returns {boolean} True if valid base64
 */
export function isValidBase64(encoded) {
  if (typeof encoded !== 'string') {
    return false;
  }

  // Check if string is valid base64
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(encoded) && encoded.length % 4 === 0;
}
