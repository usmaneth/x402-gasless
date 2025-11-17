#!/usr/bin/env node

/**
 * x402-gasless CLI
 * Run the facilitator from command line or npx
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const indexPath = join(rootDir, 'src', 'index.js');

// Parse command line arguments
const args = process.argv.slice(2);

// Show help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                     x402-gasless                          ║
║   Gasless x402 facilitator using Alchemy Account AA      ║
╚═══════════════════════════════════════════════════════════╝

Usage:
  x402-gasless [command] [options]

Commands:
  start              Start the facilitator (production mode)
  dev                Start with auto-reload (development mode)
  setup              Interactive setup wizard
  test-connection    Test Alchemy connection
  --version, -v      Show version
  --help, -h         Show this help

Examples:
  npx x402-gasless start
  npx x402-gasless dev
  npx x402-gasless setup

Environment Variables:
  ALCHEMY_API_KEY         Your Alchemy API key (required)
  ALCHEMY_GAS_POLICY_ID   Your Gas Manager policy ID (required)
  PORT                    Server port (default: 3000)
  NODE_ENV                Environment (default: development)

Documentation:
  https://github.com/usmaneth/x402-gasless#readme

Report Issues:
  https://github.com/usmaneth/x402-gasless/issues
`);
  process.exit(0);
}

// Show version
if (args.includes('--version') || args.includes('-v')) {
  const pkg = await import(join(rootDir, 'package.json'), {
    with: { type: 'json' }
  });
  console.log(`x402-gasless v${pkg.default.version}`);
  process.exit(0);
}

// Handle commands
const command = args[0] || 'start';

let scriptPath;
let nodeArgs = [];

switch (command) {
  case 'start':
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    scriptPath = indexPath;
    break;

  case 'dev':
    process.env.NODE_ENV = 'development';
    scriptPath = indexPath;
    nodeArgs = ['--watch'];
    break;

  case 'setup':
    scriptPath = join(rootDir, 'scripts', 'setup.js');
    break;

  case 'test-connection':
    scriptPath = join(rootDir, 'scripts', 'test-connection.js');
    break;

  default:
    console.error(`Unknown command: ${command}`);
    console.error('Run "x402-gasless --help" for usage information');
    process.exit(1);
}

// Run the command
const child = spawn('node', [...nodeArgs, scriptPath], {
  stdio: 'inherit',
  cwd: rootDir,
  env: process.env,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

child.on('error', (err) => {
  console.error('Failed to start x402-gasless:', err.message);
  process.exit(1);
});
