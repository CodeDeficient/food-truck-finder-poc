#!/usr/bin/env node

/**
 * Test Setup Script for Food Truck Finder E2E Tests
 *
 * This script helps set up the testing environment for comprehensive
 * end-to-end testing of the data pipeline upscaling scenarios.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Setting up E2E Test Environment...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local from template...');

  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created from .env.example');
    console.log('❗ Please update .env.local with your actual API keys and credentials\n');
  } else {
    console.log('❌ .env.example not found');
    console.log('Please create .env.local manually with the required environment variables\n');
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'FIRECRAWL_API_KEY',
];

console.log('🔍 Checking environment variables...');

// Load environment variables
try {
  require('dotenv').config({ path: envPath });
} catch (error) {
  console.log('⚠️  dotenv not installed, skipping environment variable validation');
}

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:');
  missingVars.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log('\nPlease update .env.local with these values before running full tests\n');
} else {
  console.log('✅ All required environment variables are set\n');
}

// Check Playwright installation
console.log('🎭 Checking Playwright installation...');

try {
  require('@playwright/test');
  console.log('✅ Playwright is installed');
} catch (error) {
  console.log('❌ Playwright not found');
  console.log('Run: pnpm install @playwright/test');
  console.log('Then: pnpm exec playwright install\n');
  process.exit(1);
}

// Check if browsers are installed
const { execSync } = require('child_process');

try {
  execSync('pnpm exec playwright --version', { stdio: 'pipe' });
  console.log('✅ Playwright browsers are ready\n');
} catch (error) {
  console.log('❌ Playwright browsers not installed');
  console.log('Run: pnpm exec playwright install\n');
}

console.log('📋 Test Commands Available:');
console.log('   pnpm test:e2e:basic      - Basic UI tests (working)');
console.log('   pnpm test:e2e:pipeline   - Pipeline endpoint tests (working with mocks)');
console.log('   pnpm test:e2e:upscaling  - Upscaling tests (requires real environment)');
console.log('   pnpm test:e2e:load       - Load tests (requires real environment)');
console.log('   pnpm test:e2e:monitoring - Monitoring tests (requires real environment)');
console.log('   pnpm test:pipeline:all   - All pipeline tests');
console.log('   pnpm test:e2e:all        - All E2E tests');
console.log('   pnpm test:e2e:report     - View test reports\n');

if (missingVars.length === 0) {
  console.log('🚀 Ready to run comprehensive E2E tests!');
  console.log('Start with: pnpm test:e2e:basic');
} else {
  console.log('⚠️  Basic tests are ready, but full pipeline tests need environment setup');
  console.log('Start with: pnpm test:e2e:basic');
}

console.log('\n📚 See tests/TESTING_IMPLEMENTATION_SUMMARY.md for full documentation');
