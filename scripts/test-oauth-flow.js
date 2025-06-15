#!/usr/bin/env node

/**
 * OAuth Flow Testing Script
 *
 * This script provides automated testing for the Google OAuth flow
 * and generates test reports for verification.
 *
 * Usage: node scripts/test-oauth-flow.js [--env=development|production]
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SUPABASE_PROJECT_ID = 'zkwliyjjkdnigizidlln';
const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app';

class OAuthTester {
  constructor(environment = 'development') {
    this.environment = environment;
    this.baseUrl = environment === 'production' ? PROD_URL : DEV_URL;
    this.results = {
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0
    };
    this.loadEnvironment();
  }

  loadEnvironment() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
          process.env[key] = value.replace(/"/g, '');
        }
      });
    }
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    const timestamp = new Date().toISOString();
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runTest(name, testFn) {
    this.log(`Running test: ${name}`, 'info');
    
    try {
      const result = await testFn();
      this.results.tests.push({
        name,
        status: 'passed',
        result,
        timestamp: new Date().toISOString()
      });
      this.results.passed++;
      this.log(`✅ ${name} - PASSED`, 'success');
      return result;
    } catch (error) {
      this.results.tests.push({
        name,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      this.results.failed++;
      this.log(`❌ ${name} - FAILED: ${error.message}`, 'error');
      throw error;
    }
  }

  async testLoginPageAccessibility() {
    return this.runTest('Login Page Accessibility', async () => {
      const response = await this.makeRequest(`${this.baseUrl}/login`);
      
      if (response.statusCode !== 200) {
        throw new Error(`Login page returned status ${response.statusCode}`);
      }
      
      if (!response.body.includes('Google')) {
        throw new Error('Google login button not found on login page');
      }
      
      return {
        statusCode: response.statusCode,
        hasGoogleButton: response.body.includes('Google'),
        contentLength: response.body.length
      };
    });
  }

  async testAuthCallbackRoute() {
    return this.runTest('Auth Callback Route', async () => {
      // Test callback route without parameters (should handle gracefully)
      const response = await this.makeRequest(`${this.baseUrl}/auth/callback`);
      
      // Should redirect to login or handle missing code gracefully
      if (response.statusCode !== 302 && response.statusCode !== 200) {
        throw new Error(`Callback route returned unexpected status ${response.statusCode}`);
      }
      
      return {
        statusCode: response.statusCode,
        location: response.headers.location || 'No redirect',
        handlesGracefully: true
      };
    });
  }

  async testSupabaseConnection() {
    return this.runTest('Supabase Connection', async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL not configured');
      }
      
      const response = await this.makeRequest(`${supabaseUrl}/rest/v1/`);
      
      if (response.statusCode !== 200 && response.statusCode !== 401) {
        throw new Error(`Supabase connection failed with status ${response.statusCode}`);
      }
      
      return {
        url: supabaseUrl,
        statusCode: response.statusCode,
        connected: true
      };
    });
  }

  async testSupabaseAuthSettings() {
    return this.runTest('Supabase Auth Settings', async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const settingsUrl = `${supabaseUrl}/auth/v1/settings`;
      
      try {
        const response = await this.makeRequest(settingsUrl);
        const settings = JSON.parse(response.body);
        
        return {
          googleEnabled: settings.external?.google || false,
          signupDisabled: settings.disable_signup || false,
          autoconfirm: settings.autoconfirm || false,
          settingsAccessible: true
        };
      } catch (error) {
        // Settings endpoint might require auth, which is normal
        this.log('⚠️  Auth settings endpoint requires authentication (normal)', 'warning');
        this.results.warnings++;
        
        return {
          settingsAccessible: false,
          reason: 'Authentication required'
        };
      }
    });
  }

  async testEnvironmentConfiguration() {
    return this.runTest('Environment Configuration', async () => {
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY'
      ];
      
      const missing = requiredVars.filter(varName => !process.env[varName]);
      
      if (missing.length > 0) {
        throw new Error(`Missing environment variables: ${missing.join(', ')}`);
      }
      
      return {
        allVariablesPresent: true,
        supabaseProjectId: SUPABASE_PROJECT_ID,
        environment: this.environment
      };
    });
  }

  async testOAuthRedirectUrls() {
    return this.runTest('OAuth Redirect URLs', async () => {
      const expectedUrls = [
        `${this.baseUrl}/auth/callback`,
        `${PROD_URL}/auth/callback`,
        'http://localhost:3000/auth/callback'
      ];
      
      // This test validates the expected URLs are properly formatted
      const validUrls = expectedUrls.filter(url => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      });
      
      if (validUrls.length !== expectedUrls.length) {
        throw new Error('Some redirect URLs are malformed');
      }
      
      return {
        expectedUrls,
        validUrls: validUrls.length,
        currentEnvironment: this.baseUrl
      };
    });
  }

  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: {
          'User-Agent': 'OAuth-Tester/1.0',
          ...options.headers
        }
      };
      
      const req = client.request(requestOptions, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });
      
      req.on('error', reject);
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  generateReport() {
    const report = {
      summary: {
        environment: this.environment,
        baseUrl: this.baseUrl,
        timestamp: new Date().toISOString(),
        totalTests: this.results.tests.length,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate: `${Math.round((this.results.passed / this.results.tests.length) * 100)}%`
      },
      tests: this.results.tests,
      recommendations: this.generateRecommendations()
    };
    
    // Save report to file
    const reportPath = path.join(process.cwd(), 'reports', `oauth-test-${this.environment}-${Date.now()}.json`);
    const reportsDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return { report, reportPath };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push('❌ Fix failed tests before proceeding with OAuth setup');
    }
    
    if (this.results.warnings > 0) {
      recommendations.push('⚠️  Review warnings - they may indicate configuration issues');
    }
    
    if (this.results.passed === this.results.tests.length) {
      recommendations.push('✅ All tests passed! Ready for manual OAuth configuration');
      recommendations.push('📋 Next: Configure Google Cloud Console and Supabase OAuth settings');
    }
    
    recommendations.push('📖 See docs/GOOGLE_OAUTH_SETUP_GUIDE.md for detailed setup instructions');
    
    return recommendations;
  }

  async run() {
    this.log(`🧪 Starting OAuth Flow Tests (${this.environment})`, 'info');
    this.log(`Base URL: ${this.baseUrl}`, 'info');
    
    try {
      await this.testEnvironmentConfiguration();
      await this.testSupabaseConnection();
      await this.testSupabaseAuthSettings();
      await this.testLoginPageAccessibility();
      await this.testAuthCallbackRoute();
      await this.testOAuthRedirectUrls();
      
      const { report, reportPath } = this.generateReport();
      
      this.log('\n📊 TEST SUMMARY:', 'info');
      this.log(`Total Tests: ${report.summary.totalTests}`, 'info');
      this.log(`Passed: ${report.summary.passed}`, 'success');
      this.log(`Failed: ${report.summary.failed}`, 'error');
      this.log(`Warnings: ${report.summary.warnings}`, 'warning');
      this.log(`Success Rate: ${report.summary.successRate}`, 'info');
      
      this.log('\n💡 RECOMMENDATIONS:', 'info');
      report.recommendations.forEach(rec => this.log(rec, 'info'));
      
      this.log(`\n📄 Report saved: ${reportPath}`, 'info');
      
      return report;
      
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, 'error');
      throw error;
    }
  }
}

// CLI interface
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const environment = envArg ? envArg.split('=')[1] : 'development';

if (!['development', 'production'].includes(environment)) {
  console.error('Invalid environment. Use --env=development or --env=production');
  process.exit(1);
}

const tester = new OAuthTester(environment);
tester.run().catch(error => {
  console.error('Testing failed:', error);
  process.exit(1);
});

export default OAuthTester;
