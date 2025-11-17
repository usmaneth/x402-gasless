/**
 * Test Alchemy Connection
 * Validate API key and test connection to Alchemy
 */

import { Alchemy, Network } from 'alchemy-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Alchemy connection...\n');

  // Check if API key exists
  if (!process.env.ALCHEMY_API_KEY) {
    console.error('❌ ALCHEMY_API_KEY not found in environment');
    console.error('💡 Add your API key to .env file\n');
    process.exit(1);
  }

  const apiKey = process.env.ALCHEMY_API_KEY;

  // Test connection on Base Sepolia
  try {
    console.log('Testing connection to Base Sepolia...');

    const alchemy = new Alchemy({
      apiKey,
      network: Network.BASE_SEPOLIA,
    });

    const blockNumber = await alchemy.core.getBlockNumber();

    console.log(`✅ Connected successfully!`);
    console.log(`   Current block number: ${blockNumber}`);
    console.log('');

    // Test Gas Manager policy if provided
    if (process.env.ALCHEMY_GAS_POLICY_ID) {
      console.log('✅ Gas Manager Policy ID found');
      console.log(`   Policy ID: ${process.env.ALCHEMY_GAS_POLICY_ID}`);
      console.log('   Note: Policy will be validated on first settlement attempt');
      console.log('');
    } else {
      console.log('⚠️  ALCHEMY_GAS_POLICY_ID not found');
      console.log('   Run: npm run create-policy');
      console.log('   Or create manually at: https://dashboard.alchemy.com/gas-manager');
      console.log('');
    }

    console.log('✅ All checks passed! Ready to run x402-gasless');
    console.log('');
    console.log('Next steps:');
    console.log('1. npm run dev        # Start server');
    console.log('2. npm test           # Run tests');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('');
    console.error('Troubleshooting:');
    console.error('1. Verify API key at: https://dashboard.alchemy.com');
    console.error('2. Check network access and firewall');
    console.error('3. Ensure API key has access to Base Sepolia network');
    console.error('');
    process.exit(1);
  }
}

testConnection();
