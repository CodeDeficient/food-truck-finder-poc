#!/usr/bin/env node

/**
 * Google OAuth Setup Verification Script
 *
 * This script verifies that Google OAuth is properly configured for the Food Truck Finder application.
 * It checks Supabase configuration, environment variables, and provides setup guidance.
 *
 * Usage: node scripts/verify-oauth-setup.js
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\u001B[0m',
  bright: '\u001B[1m',
  red: '\u001B[31m',
  green: '\u001B[32m',
  yellow: '\u001B[33m',
  blue: '\u001B[34m',
  magenta: '\u001B[35m',
  cyan: '\u001B[36m'
};

// Configuration
const SUPABASE_PROJECT_ID = 'zkwliyjjkdnigizidlln';
const PRODUCTION_URL = 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app';

class OAuthVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.loadEnvironment();
  }

  loadEnvironment() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key] = value.replaceAll('"', '');
        }
      }
    }
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logSection(title) {
    this.log(`\n${'='.repeat(60)}`, 'cyan');
    this.log(`${title}`, 'cyan');
    this.log(`${'='.repeat(60)}`, 'cyan');
  }

  logSuccess(message) {
    this.successes.push(message);
    this.log(`✅ ${message}`, 'green');
  }

  logWarning(message) {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, 'yellow');
  }

  logError(message) {
    this.errors.push(message);
    this.log(`❌ ${message}`, 'red');
  }

  logInfo(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  async checkEnvironmentVariables() {
    this.logSection('ENVIRONMENT VARIABLES CHECK');

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        this.logSuccess(`${varName} is configured`);
      } else {
        this.logError(`${varName} is missing`);
      }
    }

    // Check Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.includes(SUPABASE_PROJECT_ID)) {
      this.logSuccess('Supabase URL matches expected project ID');
    } else if (supabaseUrl) {
      this.logWarning('Supabase URL does not match expected project ID');
    }
  }

  async checkSupabaseAuthSettings() {
    this.logSection('SUPABASE AUTH CONFIGURATION CHECK');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      this.logError('Cannot check Supabase settings - URL not configured');
      return;
    }

    try {
      const settingsUrl = `${supabaseUrl}/auth/v1/settings`;
      const response = await this.makeHttpRequest(settingsUrl);
      const settings = JSON.parse(response);

      if (settings.external && settings.external.google !== undefined) {
        if (settings.external.google) {
          this.logSuccess('Google OAuth provider is enabled in Supabase');
        } else {
          this.logError('Google OAuth provider is disabled in Supabase');
          this.logInfo('Enable it in: Supabase Dashboard > Authentication > Providers > Google');
        }
      } else {
        this.logWarning('Unable to determine Google OAuth status from Supabase settings');
      }

      // Check other relevant settings
      if (settings.disable_signup === false) {
        this.logSuccess('User signup is enabled');
      } else {
        this.logWarning('User signup is disabled');
      }

    } catch (error) {
      this.logWarning(`Unable to fetch Supabase auth settings: ${error.message}`);
      this.logInfo('This is normal if the endpoint requires authentication');
    }
  }

  async checkRedirectUrls() {
    this.logSection('REDIRECT URL CONFIGURATION CHECK');

    const expectedUrls = [
      `${PRODUCTION_URL}/auth/callback`,
      'http://localhost:3000/auth/callback',
      'http://localhost:3001/auth/callback'
    ];

    this.logInfo('Expected redirect URLs for Google Cloud Console:');
    for (const url of expectedUrls) {
      this.log(`  • ${url}`, 'blue');
    }

    this.logInfo('\nExpected authorized origins:');
    this.log(`  • ${PRODUCTION_URL}`, 'blue');
    this.log(`  • http://localhost:3000`, 'blue');
    this.log(`  • http://localhost:3001`, 'blue');
  }

  async checkOAuthFlow() {
    this.logSection('OAUTH FLOW VERIFICATION');

    // Check if login page exists
    const loginPagePath = path.join(process.cwd(), 'app', 'login', 'page.tsx');
    if (fs.existsSync(loginPagePath)) {
      this.logSuccess('Login page exists');
      
      // Check if Google OAuth is implemented
      const loginContent = fs.readFileSync(loginPagePath, 'utf8');
      if (loginContent.includes('signInWithOAuth') && loginContent.includes('google')) {
        this.logSuccess('Google OAuth login implementation found');
      } else {
        this.logError('Google OAuth login implementation not found');
      }
    } else {
      this.logError('Login page not found');
    }

    // Check auth callback route
    const callbackPath = path.join(process.cwd(), 'app', 'auth', 'callback', 'route.ts');
    if (fs.existsSync(callbackPath)) {
      this.logSuccess('Auth callback route exists');
    } else {
      this.logError('Auth callback route not found');
    }
  }

  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
      });

      request.on('error', reject);
      request.setTimeout(10_000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  generateSetupInstructions() {
    this.logSection('SETUP INSTRUCTIONS');

    if (this.errors.length === 0) {
      this.logSuccess('All automated checks passed! 🎉');
      this.logInfo('Manual configuration steps:');
    } else {
      this.logError('Issues found that need to be resolved:');
    }

    this.log('\n📋 MANUAL SETUP CHECKLIST:', 'bright');
    this.log('1. Google Cloud Console Setup:', 'yellow');
    this.log('   • Create OAuth 2.0 credentials', 'blue');
    this.log('   • Configure authorized redirect URIs', 'blue');
    this.log('   • Copy Client ID and Client Secret', 'blue');
    
    this.log('\n2. Supabase Configuration:', 'yellow');
    this.log('   • Go to Authentication > Providers > Google', 'blue');
    this.log('   • Enable Google provider', 'blue');
    this.log('   • Add Client ID and Client Secret', 'blue');
    
    this.log('\n3. Testing:', 'yellow');
    this.log('   • Test login flow in development', 'blue');
    this.log('   • Test login flow in production', 'blue');
    this.log('   • Verify admin role assignment', 'blue');

    this.log('\n📖 Detailed instructions: docs/GOOGLE_OAUTH_SETUP_GUIDE.md', 'cyan');
  }

  generateSummary() {
    this.logSection('VERIFICATION SUMMARY');

    this.log(`✅ Successes: ${this.successes.length}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n🎉 All checks passed! OAuth setup appears to be ready.', 'green');
    } else if (this.errors.length === 0) {
      this.log('\n✅ No critical errors found. Review warnings above.', 'yellow');
    } else {
      this.log('\n❌ Critical errors found. Please resolve them before proceeding.', 'red');
    }

    this.log('\n🚀 Next steps:', 'cyan');
    this.log('1. Complete manual configuration steps above', 'blue');
    this.log('2. Run: npm run dev', 'blue');
    this.log('3. Test OAuth flow at: http://localhost:3000/login', 'blue');
  }

  async run() {
    this.log('🔍 Google OAuth Setup Verification', 'bright');
    this.log('Food Truck Finder Application\n', 'bright');

    await this.checkEnvironmentVariables();
    await this.checkSupabaseAuthSettings();
    await this.checkRedirectUrls();
    await this.checkOAuthFlow();
    this.generateSetupInstructions();
    this.generateSummary();
  }
}

// Run the verification
const verifier = new OAuthVerifier();
verifier.run().catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});

export default OAuthVerifier;
