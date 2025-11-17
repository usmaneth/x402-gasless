# x402-gasless Quick Start Guide

Get your gasless x402 facilitator running in 5 minutes!

## Prerequisites

- Node.js 20+ installed
- Alchemy account (free tier available)
- 5 minutes of your time

## Step 1: Setup

```bash
# Clone the repository
git clone https://github.com/your-org/x402-gasless
cd x402-gasless

# Install dependencies
npm install

# Run setup wizard
npm run setup
```

The setup script will create a `.env` file from the template.

## Step 2: Get Alchemy Credentials

### 2.1 Get API Key

1. Visit [dashboard.alchemy.com](https://dashboard.alchemy.com)
2. Sign in or create a free account
3. Click "Create App"
4. Select "Base Sepolia" network (or your preferred network)
5. Copy your API key

### 2.2 Create Gas Manager Policy

1. Visit [Gas Manager](https://dashboard.alchemy.com/gas-manager)
2. Click "Create Policy"
3. Configure spending rules:
   - Name: "x402-gasless Production"
   - Spending limit: $100/day (adjust as needed)
   - Networks: Base Sepolia, Base Mainnet, etc.
4. Copy the Policy ID (UUID format)

## Step 3: Configure Environment

Edit `.env` file:

```bash
# Required
ALCHEMY_API_KEY=your-api-key-here
ALCHEMY_GAS_POLICY_ID=your-policy-id-here

# Optional (has defaults)
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Step 4: Test Configuration

```bash
npm run test-connection
```

You should see:
```
✅ Connected successfully!
   Current block number: 12345678
✅ Gas Manager Policy ID found
✅ All checks passed! Ready to run x402-gasless
```

## Step 5: Start the Server

```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
🚀 x402-gasless starting...

✅ Configuration loaded
   • API Key: abcd...5678
   • Gas Policy: 12345678...9abc
   • Environment: development

🌐 Supported Networks (7):
   ✅ base-sepolia (chain: 84532)
   ✅ base-mainnet (chain: 8453)
   ...

🎯 Server running on http://0.0.0.0:3000

Ready to sponsor gasless transactions! 🎉
```

## Step 6: Test the API

```bash
# Health check
curl http://localhost:3000/health

# Get supported networks
curl http://localhost:3000/supported
```

## Next Steps

### Integrate with Vend

See [Vend Integration Guide](./vend-integration.md)

### Deploy to Production

See [Deployment Guide](./deployment.md)

### Use Client Library

See [Client Library Guide](./client-library.md)

## Troubleshooting

### "Missing required environment variables"

Make sure `.env` file exists and contains:
- `ALCHEMY_API_KEY`
- `ALCHEMY_GAS_POLICY_ID`

### "Connection failed"

1. Verify API key at dashboard.alchemy.com
2. Check network access
3. Ensure API key has access to networks

### "Invalid Gas Policy ID format"

Policy ID should be a UUID like:
`12345678-1234-1234-1234-123456789abc`

## Support

- [GitHub Issues](https://github.com/your-org/x402-gasless/issues)
- [Documentation](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)

---

**Congratulations!** 🎉 You now have a running x402-gasless facilitator!
