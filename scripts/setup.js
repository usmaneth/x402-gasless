/**
 * Interactive Setup Script
 * Guide users through x402-gasless setup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

console.log('🚀 Welcome to x402-gasless Setup!\n');

// Check if .env exists
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists');
  console.log('');
  console.log('To reconfigure:');
  console.log('1. Backup current .env: cp .env .env.backup');
  console.log('2. Copy template: cp .env.example .env');
  console.log('3. Edit .env with your values');
  console.log('');
  console.log('Required values:');
  console.log('- ALCHEMY_API_KEY       (from https://dashboard.alchemy.com)');
  console.log('- ALCHEMY_GAS_POLICY_ID (from https://dashboard.alchemy.com/gas-manager)');
  console.log('');
  console.log('Then run: npm run test-connection');
  console.log('');
  process.exit(0);
}

// Create .env from template
if (!fs.existsSync(envExamplePath)) {
  console.error('❌ .env.example not found');
  process.exit(1);
}

console.log('Creating .env file from template...');
fs.copyFileSync(envExamplePath, envPath);
console.log('✅ .env file created!\n');

console.log('📝 Next Steps:\n');
console.log('1. Get your Alchemy API key:');
console.log('   → Visit: https://dashboard.alchemy.com');
console.log('   → Create an account or sign in');
console.log('   → Create a new app');
console.log('   → Copy your API key');
console.log('');

console.log('2. Create a Gas Manager policy:');
console.log('   → Visit: https://dashboard.alchemy.com/gas-manager');
console.log('   → Click "Create Policy"');
console.log('   → Set spending rules (e.g., $100/day)');
console.log('   → Copy the Policy ID (UUID format)');
console.log('');

console.log('3. Edit .env file:');
console.log('   → Open: .env');
console.log('   → Set ALCHEMY_API_KEY=your-api-key');
console.log('   → Set ALCHEMY_GAS_POLICY_ID=your-policy-id');
console.log('   → Save the file');
console.log('');

console.log('4. Test your configuration:');
console.log('   → Run: npm run test-connection');
console.log('');

console.log('5. Start the server:');
console.log('   → Run: npm run dev');
console.log('');

console.log('💡 Need help? Check the documentation:');
console.log('   https://github.com/your-org/x402-gasless\n');
