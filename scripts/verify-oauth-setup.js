#!/usr/bin/env node

/**
 * Google OAuth Setup Verification Script
 *
 * This script verifies that Google OAuth is properly configured for the Food Truck Finder application.
 * It checks Supabase configuration, environment variables, and provides setup guidance.
 *
 * Usage: node scripts/verify-oauth-setup.js
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Configuration
const SUPABASE_PROJECT_ID = 'zkwliyjjkdnigizidlln';
const PRODUCTION_URL =
  'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app';

class OAuthVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.successes = [];
    this.loadEnvironment();
  }

  /**
  * Loads environment variables from a local .env file into process.env
  * @example
  * loadEnvironment()
  * No undefined check is needed for process.env variables after this function call
  * @param {void} No arguments are required.
  * @returns {void} This function does not return any value.
  * @description
  *   - Reads from the '.env.local' file located at the current working directory.
  *   - The function checks for the existence of the .env.local file before proceeding.
  *   - Sets each environment variable in 'process.env', removing any double quotes from the value.
  *   - Only assigns values when both key and value are present for a line.
  */
  loadEnvironment() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key] = value.replace(/"/g, '');
        }
      });
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

  /**
   * Checks if required environment variables for Supabase integration are configured correctly.
   * @example
   * checkEnvironmentVariables()
   * // Outputs log messages indicating the status of each required environment variable.
   * @param {void} No arguments are required for this function.
   * @returns {void} This function returns no value, it logs messages to the console.
   * @description
   *   - Logs whether each necessary environment variable is configured or missing.
   *   - Validates if the Supabase URL contains the expected project ID and logs the result.
   */
  async checkEnvironmentVariables() {
    this.logSection('ENVIRONMENT VARIABLES CHECK');

    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
    ];

    requiredVars.forEach((varName) => {
      if (process.env[varName]) {
        this.logSuccess(`${varName} is configured`);
      } else {
        this.logError(`${varName} is missing`);
      }
    });

    // Check Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.includes(SUPABASE_PROJECT_ID)) {
      this.logSuccess('Supabase URL matches expected project ID');
    } else if (supabaseUrl) {
      this.logWarning('Supabase URL does not match expected project ID');
    }
  }

  /**
   * Checks the Supabase authentication settings and logs their configuration status.
   * @example
   * checkSupabaseAuthSettings()
   * // Logs configuration status about Supabase settings including Google OAuth and signup options.
   * @param {void} - This function does not take any arguments.
   * @returns {void} This function does not return anything, it logs information regarding Supabase auth settings status.
   * @description
   *   - Retrieves settings from Supabase via HTTP request using the configured URL.
   *   - Logs success, error, or warning messages based on the configuration status.
   *   - Provides additional information if Google OAuth provider is disabled, indicating where to enable it in Supabase Dashboard.
   *   - Handles cases when fetching settings fail, offering clarification if authentication is required.
   */
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

  /**
   * Logs the expected redirect URLs and authorized origins for Google Cloud Console configuration.
   * @example
   * checkRedirectUrls()
   * No return value, only logs information.
   * @param {void} - This function does not accept any parameters.
   * @returns {void} This function does not return any value.
   * @description
   *   - Logs the expected URLs and origins using 'logInfo' and 'log' methods for visualization.
   *   - Uses 'blue' color for logging the URLs to differentiate from regular log entries.
   *   - 'expectedUrls' includes both production and localhost URLs for development and testing purposes.
   */
  async checkRedirectUrls() {
    this.logSection('REDIRECT URL CONFIGURATION CHECK');

    const expectedUrls = [
      `${PRODUCTION_URL}/auth/callback`,
      'http://localhost:3000/auth/callback',
      'http://localhost:3001/auth/callback',
    ];

    this.logInfo('Expected redirect URLs for Google Cloud Console:');
    expectedUrls.forEach((url) => {
      this.log(`  • ${url}`, 'blue');
    });

    this.logInfo('\nExpected authorized origins:');
    this.log(`  • ${PRODUCTION_URL}`, 'blue');
    this.log(`  • http://localhost:3000`, 'blue');
    this.log(`  • http://localhost:3001`, 'blue');
  }

  /**
  * Verify the existence of Google OAuth implementation within the project's login page and auth callback route.
  * @example
  * checkOAuthFlow()
  * Logs success or error messages based on verification results.
  * @returns {void} Logs messages indicating the presence or absence of critical OAuth implementation files and configurations.
  * @description
  *   - Verifies that the login page exists and checks for Google OAuth login code.
  *   - Inspects the auth callback route to ensure it exists.
  *   - Uses file system operations to perform these checks.
  *   - Relies on logging utility methods to report status.
  */
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

  /**
   * Makes an HTTP GET request to a specified URL and returns the response data.
   * @example
   * makeHttpRequest('https://example.com')
   * Promise resolving with response data or rejecting with an error
   * @param {string} url - The URL to send the HTTP GET request to.
   * @returns {Promise<string>} A promise that resolves with the response data as a string if the request is successful, or rejects with an error if the request fails.
   * @description
   *   - Uses Node.js https module to perform the HTTP request.
   *   - Handles request errors and timeouts to ensure robust error management.
   *   - The promise resolves only on successful status codes (2xx range).
   */
  makeHttpRequest(url) {
    return new Promise((resolve, reject) => {
      const request = https.get(url, (response) => {
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
          }
        });
      });

      request.on('error', reject);
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  /**
  * Generates setup instructions for configuring Google OAuth and Supabase.
  * @example
  * generateSetupInstructions()
  * undefined
  * @returns {void} No return value.
  * @description
  *   - Logs setup instructions for different stages including Google Cloud and Supabase configuration.
  *   - Provides a checklist and indicates if automated checks have passed or if issues need resolution.
  *   - References an external guide for detailed setup instructions.
  */
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

  /**
   * Generates a summary of the OAuth setup verification process, detailing successes, warnings, and errors.
   * @example
   * generateSummary()
   * // Outputs a summary of the verification process and next steps if needed.
   * @returns {void} No return value.
   * @description
   *   - Categorizes the results into successes, warnings, and errors, and outputs them in corresponding colors.
   *   - Provides guidance on next steps based on the presence of warnings or errors.
   *   - Offers a motivational message if no issues are found to encourage continued progress.
   */
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
verifier.run().catch((error) => {
  console.error('Verification failed:', error);
  process.exit(1);
});

export default OAuthVerifier;
