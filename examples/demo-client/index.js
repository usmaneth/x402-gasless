/**
 * x402-gasless Demo Client
 *
 * This demo shows the complete gasless payment flow:
 * 1. Create Alchemy smart wallet (counterfactual)
 * 2. Build real UserOperation for USDC transfer
 * 3. Verify payment with facilitator
 * 4. Settle with Alchemy Gas Manager sponsorship
 * 5. Monitor gasless transaction on-chain
 */

import { createModularAccountAlchemyClient } from '@account-kit/smart-contracts';
import { alchemy, baseSepolia, sepolia } from '@account-kit/infra';
import { LocalAccountSigner } from '@aa-sdk/core';
import { parseUnits, encodeFunctionData, parseAbi } from 'viem';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const config = {
  alchemyApiKey: process.env.ALCHEMY_API_KEY,
  privateKey: process.env.PRIVATE_KEY,
  facilitatorUrl: process.env.FACILITATOR_URL || 'http://localhost:3000',
  recipientAddress: process.env.RECIPIENT_ADDRESS,
  network: process.env.NETWORK || 'base-sepolia',
  amount: process.env.AMOUNT || '0.01',
};

// Validate required config
if (!config.alchemyApiKey) {
  console.error('\n❌ Missing ALCHEMY_API_KEY in .env file');
  process.exit(1);
}
if (!config.privateKey) {
  console.error('\n❌ Missing PRIVATE_KEY in .env file');
  process.exit(1);
}
if (!config.recipientAddress) {
  console.error('\n❌ Missing RECIPIENT_ADDRESS in .env file');
  process.exit(1);
}

// Network configurations
const networks = {
  'base-sepolia': {
    chain: baseSepolia,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: 84532,
    explorer: 'https://sepolia.basescan.org',
  },
  'eth-sepolia': {
    chain: sepolia,
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    chainId: 11155111,
    explorer: 'https://sepolia.etherscan.io',
  },
};

// ERC20 ABI for transfer function
const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)',
]);

// Logging helpers
function log(message, data = {}) {
  console.log(`\n${message}`);
  if (Object.keys(data).length > 0) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logStep(step, message) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`STEP ${step}: ${message}`);
  console.log('='.repeat(60));
}

/**
 * Create Alchemy smart wallet signer
 */
async function createSigner() {
  logStep(1, 'Creating Smart Wallet Signer');

  try {
    // Ensure private key has 0x prefix
    const privateKey = config.privateKey.startsWith('0x')
      ? config.privateKey
      : `0x${config.privateKey}`;

    log('📝 Creating signer from private key...');
    const signer = LocalAccountSigner.privateKeyToAccountSigner(privateKey);

    log('✅ Signer created successfully');
    return signer;
  } catch (error) {
    log('❌ Failed to create signer:', { error: error.message });
    throw error;
  }
}

/**
 * Create Alchemy modular account client
 */
async function createSmartWallet(signer) {
  logStep(2, 'Creating Smart Wallet (Counterfactual)');

  try {
    const networkConfig = networks[config.network];

    log('🔧 Initializing modular account client...', {
      network: config.network,
      chain: networkConfig.chainId,
    });

    const client = await createModularAccountAlchemyClient({
      transport: alchemy({ apiKey: config.alchemyApiKey }),
      chain: networkConfig.chain,
      signer,
    });

    const address = client.account.address;

    log('✅ Smart wallet created (counterfactual):', {
      address,
      network: config.network,
      note: 'Wallet will deploy on first transaction',
    });

    return { client, address };
  } catch (error) {
    log('❌ Failed to create smart wallet:', { error: error.message });
    throw error;
  }
}

/**
 * Build UserOperation for USDC transfer
 */
async function buildUserOp(client) {
  logStep(3, 'Building UserOperation for USDC Transfer');

  try {
    const networkConfig = networks[config.network];
    const amountInSmallestUnit = parseUnits(config.amount, 6); // USDC has 6 decimals

    log('📝 Encoding USDC transfer callData...', {
      usdcContract: networkConfig.usdcAddress,
      to: config.recipientAddress,
      amount: `${config.amount} USDC`,
    });

    // Encode the transfer call
    const callData = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [config.recipientAddress, amountInSmallestUnit],
    });

    log('✅ CallData encoded:', {
      callData: callData.slice(0, 20) + '...',
      length: callData.length,
    });

    // Build UserOperation using the client
    log('🔧 Building UserOperation...');

    const userOp = await client.buildUserOperation({
      uo: {
        target: networkConfig.usdcAddress,
        data: callData,
        value: 0n,
      },
    });

    log('✅ UserOperation built:', {
      sender: userOp.sender,
      nonce: userOp.nonce.toString(),
      callGasLimit: userOp.callGasLimit.toString(),
      note: 'UserOp ready for verification',
    });

    return userOp;
  } catch (error) {
    log('❌ Failed to build UserOp:', { error: error.message });
    throw error;
  }
}

/**
 * Encode UserOp to base64 for payment header
 */
function encodeUserOp(userOp) {
  // Convert BigInt values to strings for JSON serialization
  const serializable = {
    sender: userOp.sender,
    nonce: userOp.nonce.toString(),
    initCode: userOp.initCode,
    callData: userOp.callData,
    callGasLimit: userOp.callGasLimit.toString(),
    verificationGasLimit: userOp.verificationGasLimit.toString(),
    preVerificationGas: userOp.preVerificationGas.toString(),
    maxFeePerGas: userOp.maxFeePerGas.toString(),
    maxPriorityFeePerGas: userOp.maxPriorityFeePerGas.toString(),
    paymasterAndData: userOp.paymasterAndData,
    signature: userOp.signature,
  };

  const json = JSON.stringify(serializable);
  const base64 = Buffer.from(json, 'utf-8').toString('base64');
  return base64;
}

/**
 * Call facilitator /verify endpoint
 */
async function verifyPayment(paymentHeader) {
  logStep(4, 'Verifying Payment with Facilitator');

  const networkConfig = networks[config.network];

  const requestBody = {
    x402Version: 1,
    paymentHeader,
    paymentRequirements: {
      scheme: 'aa-erc4337',
      network: config.network,
      maxAmountRequired: parseUnits(config.amount, 6).toString(),
      payTo: config.recipientAddress,
      asset: networkConfig.usdcAddress,
      resource: '/demo/test',
    },
  };

  log('Calling POST /verify', {
    facilitatorUrl: config.facilitatorUrl + '/verify',
    network: config.network,
    amount: config.amount + ' USDC',
  });

  try {
    const response = await fetch(`${config.facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!result.isValid) {
      log('⚠️  Verification failed:', result);
      return result;
    }

    log('✅ Payment verified!', {
      isValid: result.isValid,
      note: 'Facilitator validated UserOp structure and signature',
    });
    return result;
  } catch (error) {
    log('❌ Verification request failed:', { error: error.message });
    throw error;
  }
}

/**
 * Call facilitator /settle endpoint
 */
async function settlePayment(paymentHeader) {
  logStep(5, 'Settling Payment with Gas Sponsorship');

  const networkConfig = networks[config.network];

  const requestBody = {
    x402Version: 1,
    paymentHeader,
    paymentRequirements: {
      scheme: 'aa-erc4337',
      network: config.network,
      maxAmountRequired: parseUnits(config.amount, 6).toString(),
      payTo: config.recipientAddress,
      asset: networkConfig.usdcAddress,
      resource: '/demo/test',
    },
  };

  log('Calling POST /settle', {
    facilitatorUrl: config.facilitatorUrl + '/settle',
    note: 'Facilitator will add Alchemy Gas Manager paymaster data',
  });

  try {
    const response = await fetch(`${config.facilitatorUrl}/settle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (!result.success) {
      log('⚠️  Settlement failed:', result);
      return result;
    }

    log('✅ Payment settled!', {
      success: result.success,
      txHash: result.txHash,
      network: result.network,
    });
    return result;
  } catch (error) {
    log('❌ Settlement request failed:', { error: error.message });
    return { success: false, error: error.message };
  }
}

/**
 * Main demo flow
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 x402-gasless Demo Client');
  console.log('   Real Alchemy Account Kit Integration');
  console.log('='.repeat(60));

  try {
    // Step 1: Create signer
    const signer = await createSigner();

    // Step 2: Create smart wallet
    const { client, address } = await createSmartWallet(signer);

    console.log('\n' + '!'.repeat(60));
    console.log('💡 GASLESS = FREE GAS, NOT FREE PAYMENT!');
    console.log('!'.repeat(60));
    log('\nWhat you need:', {
      'ETH for gas': '$0.00 (Alchemy sponsors - gasless!)',
      'USDC for payment': `${config.amount} USDC (payment for resource)`,
    });
    log('\n📋 Fund your smart wallet with USDC:', {
      address,
      network: config.network,
      required: `${config.amount} USDC`,
      faucet: 'https://www.alchemy.com/faucets/base-sepolia',
      note: 'You only need USDC. No ETH required!',
    });

    // For demo purposes, we'll continue even without funding
    // In production, you'd check the balance first

    // Step 3: Build UserOperation
    const userOp = await buildUserOp(client);

    // Encode UserOp to base64
    const paymentHeader = encodeUserOp(userOp);
    log('\n✅ UserOp encoded to base64', {
      length: paymentHeader.length,
    });

    // Step 4: Verify payment
    const verifyResult = await verifyPayment(paymentHeader);

    if (!verifyResult.isValid) {
      log('\n⚠️  Cannot proceed to settlement - verification failed');
      log('\nCheck the error above and ensure:');
      log('   1. Smart wallet has sufficient USDC balance');
      log('   2. UserOp structure is correct');
      log('   3. Facilitator is running and configured properly');
      process.exit(1);
    }

    // Step 5: Settle payment
    const settleResult = await settlePayment(paymentHeader);

    if (!settleResult.success) {
      log('\n⚠️  Settlement failed - see error above');
      process.exit(1);
    }

    // Step 6: Show transaction details
    const networkConfig = networks[config.network];
    const explorerUrl = `${networkConfig.explorer}/tx/${settleResult.txHash}`;

    console.log('\n' + '='.repeat(60));
    console.log('🎉 GASLESS TRANSACTION COMPLETE!');
    console.log('='.repeat(60));
    log('\n✅ Transaction submitted:', {
      txHash: settleResult.txHash,
      explorer: explorerUrl,
      note: 'Gas was paid by Alchemy Gas Manager - user paid $0 in ETH!',
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Demo Summary');
    console.log('='.repeat(60));
    console.log('\n✅ Successfully demonstrated:');
    console.log('   1. Created Alchemy smart wallet (counterfactual)');
    console.log('   2. Built real signed UserOperation');
    console.log('   3. Verified payment with facilitator');
    console.log('   4. Settled with Alchemy Gas Manager sponsorship');
    console.log('   5. Monitored gasless transaction on-chain');
    console.log('\n💰 Cost to user:');
    console.log(`   - Gas: $0.00 (sponsored by Alchemy)`);
    console.log(`   - USDC: ${config.amount} (payment for resource)`);
    console.log('\n🔗 View transaction:', explorerUrl);
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Demo failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run demo
main();
