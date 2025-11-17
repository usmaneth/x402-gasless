# x402-gasless Demo Video Script

## 🎬 Setup Before Recording

### Terminal Setup
- Terminal 1: For facilitator
- Terminal 2: For demo client
- Browser: Block explorer (BaseScan Sepolia)
- Browser: Alchemy dashboard (optional)

### Pre-flight Checklist
- [ ] Clean terminal windows (clear history)
- [ ] Zoom terminal font to 16-18pt for readability
- [ ] Have .env files ready
- [ ] Have testnet USDC ready to send
- [ ] Test run once before recording

---

## 🎙️ Script

### Part 1: Introduction (0:00 - 0:30)

**[Screen: GitHub repo page]**

> "Hi! Today I'm showing you x402-gasless, a facilitator that enables gasless transactions for x402 payments using Alchemy's Account Abstraction.
>
> The problem: Users typically need both USDC for payment AND ETH for gas fees. This creates friction.
>
> The solution: x402-gasless sponsors the gas using Alchemy Gas Manager, so users only need USDC. No ETH required!"

**[Show README features section]**

> "Let's see it in action."

---

### Part 2: Facilitator Setup (0:30 - 2:00)

**[Screen: Terminal]**

> "First, let's clone the repo and set it up. Notice how simple this is - just 2 environment variables."

```bash
# Clone
git clone https://github.com/usmaneth/x402-gasless.git
cd x402-gasless

# Install
npm install

# Setup
npm run setup
```

**[Screen: .env file in editor]**

> "I'm adding two things to the .env file:
> 1. My Alchemy API key
> 2. My Gas Manager Policy ID
>
> That's it! Everything else is auto-configured."

**[Show .env with keys filled in]**

```env
ALCHEMY_API_KEY=your-key-here
ALCHEMY_GAS_POLICY_ID=your-policy-here
```

**[Back to terminal]**

> "Let's start the facilitator."

```bash
npm run dev
```

**[Show facilitator logs]**

> "Perfect! The facilitator is running. Look at this - it's auto-configured for 7 networks:
> - Base Sepolia and Mainnet
> - Ethereum Sepolia and Mainnet
> - Polygon, Arbitrum, Optimism
>
> All USDC contracts pre-configured. All endpoints ready."

**[Show logged endpoints]**

---

### Part 3: Demo Client - The Gasless Flow (2:00 - 5:30)

**[Screen: New terminal window, split screen with facilitator logs]**

> "Now for the exciting part - let's run the demo client to see a real gasless transaction."

```bash
cd examples/demo-client
npm install
```

**[Screen: .env file in editor]**

> "Same simple setup - Alchemy API key, a private key for testing, and where to send the payment."

```env
ALCHEMY_API_KEY=same-as-facilitator
PRIVATE_KEY=test-wallet-key
RECIPIENT_ADDRESS=0xRecipient...
NETWORK=base-sepolia
AMOUNT=0.01
```

**[Back to terminal]**

> "Let's run it!"

```bash
npm start
```

**[Show Step 1: Signer Creation]**

> "Step 1: Creating a signer from the private key using Alchemy's Account Kit."

**[Show Step 2: Smart Wallet Creation]**

> "Step 2: Creating a counterfactual smart wallet. Look at this address - this is a real smart wallet that will deploy on the first transaction."

**[Highlight the smart wallet address]**

> "And here's the key message - **GASLESS = FREE GAS, NOT FREE PAYMENT**
>
> - ETH for gas: $0.00 (Alchemy sponsors this)
> - USDC for payment: 0.01 USDC (user pays for the resource)
>
> This is like Amazon Prime - shipping is free, but you still pay for the product."

**[Show funding requirement]**

> "The demo tells us to fund this wallet with USDC. Notice - we don't need ETH! Let me send some testnet USDC to this address."

**[Screen: Browser - show sending USDC from faucet or another wallet]**

**[Back to terminal - run demo again]**

```bash
npm start
```

**[Show Step 3: Building UserOperation]**

> "Step 3: Building a real UserOperation. This isn't mock data - it's using actual Alchemy Account Kit APIs.
>
> The demo encodes a USDC transfer into the UserOp."

**[Show Step 4: Verification]**

> "Step 4: Verifying the payment with our facilitator. The facilitator validates:
> - UserOp structure is correct
> - USDC transfer details match
> - Recipient and amount are right"

**[Show facilitator logs in split screen]**

> "See the facilitator logs? It received the verification request and validated everything."

**[Show Step 5: Settlement]**

> "Step 5: Settlement. This is where the magic happens.
>
> The facilitator:
> 1. Adds Alchemy Gas Manager paymaster data
> 2. Submits to the bundler
> 3. Alchemy pays the gas
> 4. Returns the transaction hash"

**[Show success message with transaction hash]**

> "Success! Look at this transaction hash. Let's check it on the block explorer."

---

### Part 4: Block Explorer Verification (5:30 - 6:30)

**[Screen: BaseScan Sepolia with transaction]**

> "Here's the transaction on BaseScan. Let me point out the important details:"

**[Highlight key parts]**

1. **Transaction Type**
   > "This is a UserOperation - account abstraction in action."

2. **Gas Paid By**
   > "Look at the 'From' address - this is the Alchemy Gas Manager paymaster. Not the user's wallet!"

3. **USDC Transfer**
   > "And here's the USDC transfer - 0.01 USDC to the recipient."

4. **User's Wallet**
   > "The user's smart wallet only had USDC. Zero ETH. The transaction still went through!"

**[Show wallet balance - 0 ETH, reduced USDC]**

> "Perfect. The user paid 0.01 USDC for the resource, and $0 in ETH for gas."

---

### Part 5: Wrap-up (6:30 - 7:00)

**[Screen: GitHub repo README]**

> "So there you have it - x402-gasless in action!
>
> **What we just saw:**
> - 2 env variables to set up
> - Real smart wallet creation
> - Actual UserOperation with Alchemy Account Kit
> - Gasless transaction - user paid 0 ETH
> - Complete x402 payment flow
>
> **Why this matters:**
> - Better UX - users don't need ETH
> - Lower friction - onboard users with just USDC
> - You control costs - you sponsor gas via Alchemy
> - Works with any x402 resource server like Vend
>
> **Get started:**
> - Fork the repo: github.com/usmaneth/x402-gasless
> - Add your Alchemy keys
> - Deploy in 5 minutes
>
> It's MIT licensed, open source, ready to customize.
>
> Questions? Open an issue on GitHub. Thanks for watching!"

**[End screen: Repo URL + your contact]**

---

## 🎨 Visual Tips

### Terminal Aesthetics
```bash
# Make terminal readable
# Increase font size to 16-18pt
# Use high contrast theme
# Clear screen before each section: clear
```

### Split Screen Layout
```
┌─────────────────────────────────┬─────────────────────────────────┐
│                                 │                                 │
│   Terminal 1: Facilitator       │   Terminal 2: Demo Client       │
│   (npm run dev)                 │   (npm start)                   │
│                                 │                                 │
│   Shows incoming requests       │   Shows step-by-step flow       │
│                                 │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

### Cursor Highlighting
- Use a cursor highlighter tool to show where you're clicking
- Mac: Use built-in accessibility features (System Preferences → Accessibility → Display → Cursor → Shake to locate)
- Windows: Use PowerToys Mouse Utilities

### Text Overlay
Add text overlays for key moments:
- "Step 1: Smart Wallet Created"
- "Step 2: Building UserOp"
- "🎯 Gas Sponsored by Alchemy!"
- "✅ $0 ETH Paid by User"

---

## ⏱️ Timing Guide

| Section | Duration | Purpose |
|---------|----------|---------|
| Intro | 0:00-0:30 | Hook viewers, state problem |
| Setup | 0:30-2:00 | Show simplicity (2 env vars) |
| Demo Flow | 2:00-5:30 | Core demo, gasless explained |
| Block Explorer | 5:30-6:30 | Proof it worked |
| Wrap-up | 6:30-7:00 | Call to action |

**Total: ~7 minutes** (ideal length for technical demos)

---

## 🎯 Key Messages to Emphasize

1. **"Just 2 Environment Variables"**
   - Show .env.example
   - Emphasize simplicity

2. **"Gasless ≠ Free"**
   - Show the clear message in terminal
   - Explain Amazon Prime analogy

3. **"Real Account Kit, Not Mocks"**
   - Show actual smart wallet address
   - Show real UserOp structure

4. **"User Pays $0 in ETH"**
   - Show wallet has 0 ETH
   - Transaction still succeeds
   - Gas paid by Alchemy

5. **"Fork and Deploy in 5 Minutes"**
   - Show GitHub repo
   - Emphasize ease of use

---

## 🔧 Technical Setup

### Before Recording

```bash
# Clean setup
rm -rf node_modules package-lock.json
npm install

# Test run
npm run dev
# In another terminal
cd examples/demo-client
npm install
npm start

# Verify everything works
```

### Environment Variables

**Facilitator .env:**
```env
ALCHEMY_API_KEY=your-key
ALCHEMY_GAS_POLICY_ID=your-policy
```

**Demo Client .env:**
```env
ALCHEMY_API_KEY=same-key
PRIVATE_KEY=test-key
FACILITATOR_URL=http://localhost:3000
RECIPIENT_ADDRESS=your-address
NETWORK=base-sepolia
AMOUNT=0.01
```

### Fund Test Wallet

Make sure smart wallet has testnet USDC:
- Base Sepolia faucet: https://www.alchemy.com/faucets/base-sepolia
- Or bridge from Ethereum Sepolia

---

## 📹 Recording Checklist

### Before Recording
- [ ] Close unnecessary applications
- [ ] Silence notifications (Do Not Disturb mode)
- [ ] Clean desktop/browser bookmarks
- [ ] Test microphone
- [ ] Increase terminal font size
- [ ] Test full flow once
- [ ] Have script/notes ready

### During Recording
- [ ] Speak clearly and not too fast
- [ ] Pause between sections
- [ ] Highlight important text/commands
- [ ] Show, don't just tell
- [ ] Keep cursor movements smooth

### After Recording
- [ ] Add intro/outro cards
- [ ] Add text overlays for key steps
- [ ] Add background music (optional, subtle)
- [ ] Export in 1080p
- [ ] Add captions/subtitles

---

## 🎬 Video Hosting

**Upload to:**
1. **YouTube** - Main platform
   - Title: "x402-gasless Demo: Gasless USDC Payments with Alchemy Account Abstraction"
   - Tags: ethereum, blockchain, web3, alchemy, account abstraction, gasless, x402, base

2. **Loom** - Quick sharing
   - Embed in README
   - Share in Discord/forums

3. **Twitter** - Short clip (1 min)
   - Show the gasless message + transaction success
   - Link to full video

---

## 📝 Video Description Template

```markdown
🚀 x402-gasless Demo: Enable Gasless USDC Payments

Watch me demonstrate x402-gasless, a facilitator that enables gasless transactions for x402 payments using Alchemy's Account Abstraction.

⏱️ Timestamps:
0:00 - Introduction
0:30 - Setup (2 env variables!)
2:00 - Demo Client Flow
5:30 - Block Explorer Verification
6:30 - Wrap-up

✨ Key Features:
- Users pay $0 in ETH for gas (Alchemy sponsors)
- Users only need USDC (no ETH required)
- Real Account Kit integration (not mocks)
- 7 networks pre-configured
- Fork & deploy in 5 minutes

🔗 Links:
- GitHub: https://github.com/usmaneth/x402-gasless
- Documentation: https://github.com/usmaneth/x402-gasless#readme
- Demo Client Guide: https://github.com/usmaneth/x402-gasless/tree/main/examples/demo-client

💬 Questions? Drop them in the comments or open an issue on GitHub!

#Ethereum #Web3 #Alchemy #AccountAbstraction #Gasless #Base
```

---

## 🎯 Pro Tips

1. **Show, Don't Tell**: Let the terminal output speak
2. **Slow Down**: Pause after important messages appear
3. **Highlight**: Use cursor to point at important text
4. **Split Screen**: Show facilitator + client simultaneously
5. **Real Transaction**: Use actual testnet, show on explorer
6. **Keep It Simple**: Don't dive too deep into code
7. **End with CTA**: "Fork it, try it, let me know what you think"

---

Good luck with your demo video! 🎬
