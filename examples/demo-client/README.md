# x402-gasless Demo Client

> **Test gasless USDC payments end-to-end with Alchemy Account Abstraction**

This demo client shows the complete flow of gasless x402 payments:
1. ✅ Create Alchemy smart wallet (counterfactual)
2. ✅ Build UserOperation for USDC transfer
3. ✅ Verify payment with facilitator
4. ✅ Settle payment with Alchemy Gas Manager sponsorship
5. ✅ Monitor gasless transaction on-chain

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- x402-gasless facilitator running (see main README)
- Alchemy API key
- Test wallet with USDC on testnet

### 1. Install Dependencies

```bash
cd examples/demo-client
npm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env
```

**Required configuration:**

```bash
# Your Alchemy API Key (same as facilitator)
ALCHEMY_API_KEY=your-alchemy-api-key

# Private key for test wallet
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
PRIVATE_KEY=your-private-key-here

# Facilitator URL
FACILITATOR_URL=http://localhost:3000

# Recipient address (where to send USDC)
RECIPIENT_ADDRESS=0xd4323fC00E85E8353c7662808BBc3075f0D5BAa9

# Network (base-sepolia or eth-sepolia)
NETWORK=base-sepolia

# Amount in USDC
AMOUNT=0.01
```

### 3. Fund Your Smart Wallet

```bash
# Run the demo to see your smart wallet address
npm start
```

The demo will create a smart wallet and display its address. **Fund this address with testnet USDC** before continuing.

**💡 GASLESS = FREE GAS, NOT FREE PAYMENT!**

Understanding what you need:
- ✅ **ETH for gas:** $0.00 (Alchemy sponsors this - gasless!)
- ❌ **USDC for payment:** 0.01 USDC (you pay this for the resource)

You only need USDC in your wallet. No ETH required!

**Get testnet USDC:**
- Base Sepolia: Use [Alchemy faucet](https://www.alchemy.com/faucets/base-sepolia) or bridge from Ethereum Sepolia
- Ethereum Sepolia: Use [Circle faucet](https://faucet.circle.com/) or [Aave faucet](https://staging.aave.com/faucet/)

### 4. Run the Demo

```bash
npm start
```

---

## 📋 What the Demo Does

### Step 1: Create Smart Wallet

```
✅ Signer created from private key
✅ Smart wallet created (counterfactual)
   Address: 0x1234...5678
   Network: base-sepolia
   Is Deployed: Will deploy on first transaction
```

The wallet is **counterfactual** - it has a deterministic address but isn't deployed yet. It will deploy automatically on the first transaction.

### Step 2: Build UserOperation

```
✅ USDC transfer callData encoded
   USDC Contract: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
   CallData: 0xa9059cbb...

✅ UserOperation built
   Sender: 0x1234...5678
   Nonce: 0
   CallGasLimit: 100000
```

Creates a UserOperation that encodes the USDC transfer.

### Step 3: Verify Payment

```
Calling POST /verify
   Facilitator URL: http://localhost:3000/verify

✅ Payment verified!
   isValid: true
   invalidReason: null
```

The facilitator validates:
- UserOp structure
- USDC transfer details
- Recipient address
- Payment amount

### Step 4: Settle Payment

```
Calling POST /settle
   Facilitator URL: http://localhost:3000/settle

✅ Payment settled!
   success: true
   txHash: 0xabc123...
   network: base-sepolia
```

The facilitator:
1. Adds Alchemy Gas Manager paymaster data
2. Submits UserOp to bundler
3. Alchemy pays gas
4. Returns transaction hash

### Step 5: Monitor Transaction

```
✅ Transaction submitted!
   TxHash: 0xabc123...
   Explorer: https://sepolia.basescan.org/tx/0xabc123...
   Note: Gas was paid by Alchemy Gas Manager - user paid $0 in ETH!

🎉 Gasless transaction complete!
```

Check the transaction on block explorer to confirm:
- ✅ USDC transferred
- ✅ Gas paid by Alchemy paymaster
- ✅ User wallet paid $0 in ETH

---

## 🎯 Use Cases

### For Developers

Fork this demo to:
- Test your own x402 facilitator
- Integrate gasless payments into your app
- Build AI agents that pay autonomously
- Create payment flows without gas complexity

### For Resource Servers

Use this flow to:
- Accept USDC payments without users needing ETH
- Sponsor gas for your users
- Build better UX for blockchain apps

---

## 🔧 Customization

### Change Networks

Edit `.env`:

```bash
# Use Ethereum Sepolia instead
NETWORK=eth-sepolia
```

Supported networks:
- `base-sepolia` (recommended for testing)
- `eth-sepolia`

### Change Amount

```bash
AMOUNT=0.05  # Send 0.05 USDC instead
```

### Use Different Recipient

```bash
RECIPIENT_ADDRESS=0xYourAddress...
```

---

## 🐛 Troubleshooting

### "Missing required environment variables"

Make sure `.env` file exists and contains:
- `ALCHEMY_API_KEY`
- `PRIVATE_KEY`
- `RECIPIENT_ADDRESS`

### "Verification failed: UserOp does not contain a valid USDC transfer"

The UserOp structure might be incorrect. Check:
- USDC contract address matches network
- CallData is properly encoded
- Amount is in correct units (6 decimals for USDC)

### "Settlement failed: Insufficient balance in smart wallet"

Your smart wallet doesn't have enough USDC. Fund it with:
- At least the amount you're trying to send
- Plus a small buffer (e.g., 0.01 extra)

### "Settlement failed: Policy validation error"

Alchemy Gas Manager policy issue. Check:
- Policy ID is correct in facilitator .env
- Policy has sufficient spending allowance
- Policy allows the network you're using

---

## 📚 Learn More

- [x402 Protocol](https://x402.org)
- [Alchemy Account Kit Docs](https://accountkit.alchemy.com/)
- [ERC-4337 Account Abstraction](https://eips.ethereum.org/EIPS/eip-4337)
- [x402-gasless Main README](../../README.md)

---

## 🤝 Contributing

Found a bug or want to improve the demo? PRs welcome!

---

## 📄 License

MIT - Fork freely!
