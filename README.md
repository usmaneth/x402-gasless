# x402-gasless

> **Gasless transactions for x402 payments using Alchemy's Account Abstraction**

Enable your users to pay with USDC without worrying about gas fees. Fork this repo, add your Alchemy API key, and deploy in 5 minutes.

---

> ⚠️ **Beta Software** - Core functionality is tested and working with real Alchemy Account Abstraction integration. The demo client demonstrates actual gasless transactions. Test thoroughly in your environment before production use. [Report issues →](https://github.com/usmaneth/x402-gasless/issues)

---

## Features

- **Gasless for users** - No ETH needed, just USDC
- **Pay Alchemy directly** - No middleman, no markup
- **Fork & deploy in 5 min** - Batteries included
- **Multi-chain support** - Base, Ethereum, Polygon, Arbitrum, Optimism
- **Plug-and-play** - Works with Vend and any x402 resource server
- **Free tier available** - Alchemy offers free gas sponsorship tier

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/your-org/x402-gasless
cd x402-gasless

# 2. Install dependencies
npm install

# 3. Setup (interactive wizard)
npm run setup
# Prompts for Alchemy API key and creates Gas Manager policy

# 4. Start the facilitator
npm run dev
# Server running at http://localhost:3000 ✅
```

## Costs & Economics

**Understanding "Gasless":**

  **Gasless ≠ Free** — Here's what it means:

- ✅ **Gas fees: $0** (Alchemy sponsors transaction gas)
- ❌ **USDC payment: Required** (users pay for the resource/API access)

Think of it like Amazon Prime:
- **Shipping is free** (gas) = No ETH needed
- **Product costs money** (USDC) = Payment for the resource

**Example Transaction:**
```
User wants blockchain data from Vend (costs 0.01 USDC)

Traditional:
  - 0.01 USDC for data ✓
  - ~$0.02 ETH for gas ✗ (user needs ETH!)

With x402-gasless:
  - 0.01 USDC for data ✓
  - $0.00 ETH for gas ✓ (Alchemy sponsors it!)
```

**Your Costs (Platform Operator):**
- **Gas sponsorship:** ~$0.01/transaction (you pay Alchemy)
- **Free tier:** Alchemy offers gas sponsorship credits
- **No markup:** Direct Alchemy pricing
- **Users pay you:** USDC for resources (you set the price)

[View Alchemy Pricing →](https://www.alchemy.com/pricing)

## 📖 How It Works

```
Client (Smart Wallet) → Resource Server (Vend) → x402-gasless Facilitator → Alchemy Gas Manager → Blockchain
```

1. **Client** creates a UserOperation (signed USDC transfer) using Alchemy smart wallet
2. **Resource Server** (like Vend) forwards the UserOp to x402-gasless for verification
3. **x402-gasless** verifies the signature and adds Alchemy Gas Manager paymaster data
4. **Alchemy** sponsors the gas and submits the transaction
5. **User pays 0 gas** - only the USDC for the resource

##  Try the Demo Client

Test the complete gasless flow with our ready-to-run demo:

```bash
cd examples/demo-client
npm install
cp .env.example .env
# Edit .env with your Alchemy API key and private key
npm start
```

The demo shows:
-  Creating Alchemy smart wallet
-  Building UserOperations for USDC transfers
-  Verifying payments with facilitator
-  Settling with gas sponsorship
-  Monitoring gasless transactions

**[See full demo documentation →](./examples/demo-client/README.md)**

## 🎯 API Endpoints

### `POST /verify`
Verify a UserOperation signature and payment details.

```bash
curl -X POST http://localhost:3000/verify \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": 1,
    "paymentHeader": "base64-encoded-userop",
    "paymentRequirements": {
      "scheme": "aa-erc4337",
      "network": "base-sepolia",
      "maxAmountRequired": "10000",
      "payTo": "0x...",
      "asset": "0x..."
    }
  }'
```

### `POST /settle`
Settle a verified payment by submitting to blockchain with gas sponsorship.

### `GET /supported`
Get list of supported payment schemes and networks.

### `GET /health`
Health check endpoint.

## 🌐 Supported Networks

Auto-configured out of the box:
- Base Sepolia (testnet)
- Base Mainnet
- Ethereum Sepolia (testnet)
- Ethereum Mainnet
- Polygon Mainnet
- Arbitrum Mainnet
- Optimism Mainnet

All USDC contracts pre-configured!

## Project Structure

```
x402-gasless/
├── src/
│   ├── index.js              # Express app entry point
│   ├── config.js             # Smart configuration
│   ├── logger.js             # Logging setup
│   ├── routes/               # API endpoints
│   ├── services/             # Core business logic
│   ├── middleware/           # Express middleware
│   └── utils/                # Utilities
├── scripts/
│   ├── setup.js              # Interactive setup
│   ├── create-policy.js      # Create Alchemy Gas Manager policy
│   └── test-connection.js    # Test Alchemy connection
├── docs/                     # Documentation
├── examples/                 # Integration examples
└── tests/                    # Test suite
```

## Development

```bash
# Run in development mode (auto-reload)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Test Alchemy connection
npm run test-connection

# Create Gas Manager policy
npm run create-policy
```

## Deployment

### Railway (Recommended)
```bash
npm run deploy:railway
```

Or click: [![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/x402-gasless)

### Docker
```bash
docker build -t x402-gasless .
docker run -p 3000:3000 --env-file .env x402-gasless
```

### Environment Variables for Production
Make sure to set these in your deployment platform:
- `ALCHEMY_API_KEY`
- `ALCHEMY_GAS_POLICY_ID`
- `NODE_ENV=production`
- `PORT=3000` (or your preferred port)

##  Documentation

- [Quick Start Guide](./docs/quickstart.md)
- [API Reference](./docs/api-reference.md)
- [Integration Guide](./docs/integration-guide.md)
- [Deployment Guide](./docs/deployment.md)
- [FAQ](./docs/faq.md)

##  Use Cases

- **Data APIs:** Sell blockchain data with USDC payments (like Vend)
- **AI Agents:** Enable autonomous payments without gas complexity
- **Gaming:** In-game purchases without users holding ETH
- **DeFi:** Onboard users without requiring gas tokens
- **Paywalls:** Monetize content with microtransactions

##  Contributing

Contributions welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) first.

##  License

MIT - Fork freely!

##  Links

- [Alchemy Account Kit Docs](https://accountkit.alchemy.com/)
- [x402 Protocol](https://x402.org)
- [Vend - Example Resource Server](https://github.com/usmaneth/Vend)

---

**Built with ❤️ for the x402 community**
