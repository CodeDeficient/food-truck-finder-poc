# Node.js Configuration Management: Best Practices for Consistent Environments

## Executive Summary

This document outlines comprehensive best practices for managing Node.js application configurations to ensure consistency between local development and remote deployment environments. Proper configuration management is crucial for resolving the environment-specific issues that have plagued the GitHub Actions deployment.

## Core Principles

### 1. Environment-Aware Configuration
Configuration should adapt seamlessly to different environments (development, testing, staging, production) without requiring code changes.

### 2. Security First
Sensitive information must never be hardcoded or committed to version control systems.

### 3. Hierarchical Structure
Configuration should follow a clear hierarchy with sensible defaults and environment-specific overrides.

### 4. Validation and Type Safety
All configuration values should be validated at application startup to prevent runtime errors.

## Configuration Management Strategies

### 1. Environment Variable Management

#### Naming Conventions
```bash
# Use consistent UPPER_CASE naming
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
NODE_ENV=production
PORT=3000
```

#### Local Development (.env.local)
```bash
# .env.local (gitignored)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NODE_ENV=development
DEBUG=true
```

#### Production Environment
```bash
# GitHub Actions / Render / etc.
NEXT_PUBLIC_SUPABASE_URL=${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
NODE_ENV=production
DEBUG=false
```

### 2. Centralized Configuration Management

#### Using node-config Library
```javascript
// config/default.js
module.exports = {
  app: {
    name: 'Food Truck Finder',
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.DEBUG === 'true'
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  scraping: {
    interval: '0 */3 * * *',
    maxRetries: 3,
    timeout: 30000
  }
};

// config/production.js
module.exports = {
  app: {
    debug: false
  },
  scraping: {
    maxRetries: 5,
    timeout: 60000
  }
};

// config/development.js
module.exports = {
  app: {
    debug: true
  },
  scraping: {
    maxRetries: 1,
    timeout: 10000
  }
};
```

#### Configuration Usage
```javascript
// lib/config.js
const config = require('config');

class AppConfig {
  static get supabase() {
    return {
      url: this.getRequired('supabase.url'),
      anonKey: this.getRequired('supabase.anonKey'),
      serviceKey: this.getRequired('supabase.serviceKey')
    };
  }

  static get app() {
    return config.get('app');
  }

  static get scraping() {
    return config.get('scraping');
  }

  static getRequired(key) {
    if (!config.has(key) || !config.get(key)) {
      throw new Error(`Missing required configuration: ${key}`);
    }
    return config.get(key);
  }

  static validate() {
    const required = [
      'supabase.url',
      'supabase.anonKey',
      'supabase.serviceKey'
    ];

    for (const key of required) {
      this.getRequired(key);
    }

    console.log('✅ Configuration validation passed');
  }
}

module.exports = AppConfig;
```

### 3. Environment Loading and Validation

#### Early Environment Loading
```javascript
// scripts/github-action-scraper.js
// Load environment variables FIRST, before any other imports
require('dotenv').config({ path: '.env.local' });

// Validate configuration immediately
const AppConfig = require('../lib/config');
AppConfig.validate();

// Now safe to import other modules
const { FoodTruckService } = require('../dist/lib/supabase/services/foodTruckService');
const { APIUsageService } = require('../dist/lib/supabase/services/apiUsageService');

async function main() {
  try {
    console.log('🚀 Starting food truck scraping process...');
    
    // Use validated configuration
    const scrapingConfig = AppConfig.scraping;
    console.log(`🔧 Scraping configuration:`, scrapingConfig);
    
    // Proceed with scraping logic
    await processScraping();
    
  } catch (error) {
    console.error('💥 Fatal error in scraping process:', error);
    process.exit(1);
  }
}
```

#### Dynamic Import Pattern for Environment-Dependent Modules
```javascript
// lib/supabase.js
class SupabaseManager {
  static async initialize() {
    try {
      // Load environment variables first
      const dotenv = await import('dotenv');
      dotenv.config({ path: '.env.local' });
      
      // Validate configuration
      const AppConfig = require('./config');
      AppConfig.validate();
      
      // Use dynamic imports for modules that depend on environment variables
      const { createClient } = await import('@supabase/supabase-js');
      
      // Create clients with validated configuration
      const config = AppConfig.supabase;
      
      this.supabase = createClient(config.url, config.anonKey);
      this.adminSupabase = createClient(config.url, config.serviceKey);
      
      console.log('✅ Supabase clients initialized successfully');
      return this;
      
    } catch (error) {
      console.error('❌ Failed to initialize Supabase:', error);
      throw error;
    }
  }
}

module.exports = SupabaseManager;
```

## TypeScript Configuration Best Practices

### 1. Consistent Module Resolution
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "outDir": "./dist",
    "rootDir": "./",
    "baseUrl": "./",
    "paths": {
      "@/*": ["*"],
      "@/lib/*": ["lib/*"],
      "@/components/*": ["components/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### 2. Action-Specific Configuration
```json
// tsconfig.action.json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./"
  },
  "include": [
    "scripts/**/*.ts",
    "lib/**/*.ts"
  ]
}
```

## Error Handling and Debugging

### 1. Comprehensive Error Logging
```javascript
// lib/errorHandler.js
class ConfigErrorHandler {
  static logEnvironmentInfo() {
    console.log('🔍 Environment Information:');
    console.log(`  Node Version: ${process.version}`);
    console.log(`  Platform: ${process.platform}`);
    console.log(`  Architecture: ${process.arch}`);
    console.log(`  Current Directory: ${process.cwd()}`);
    console.log(`  Environment Variables:`);
    console.log(`    NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
    console.log(`    NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '[SET]' : '[NOT SET]'}`);
    console.log(`    SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]'}`);
  }

  static handleConfigError(error, context = 'Unknown') {
    console.error(`❌ Configuration Error in ${context}:`, error.message);
    this.logEnvironmentInfo();
    
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('🔧 This might be due to missing dependencies. Run: npm install');
    } else if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.error('🔧 This might be due to missing file extensions in imports.');
    } else if (error.code === 'ERR_UNSUPPORTED_DIR_IMPORT') {
      console.error('🔧 This is due to directory imports. Use explicit file paths.');
    }
    
    process.exit(1);
  }
}

module.exports = ConfigErrorHandler;
```

### 2. Configuration Testing
```javascript
// test-env.js
async function testEnvironment() {
  console.log('🧪 Testing Environment Configuration...');
  
  try {
    // Test 1: Environment variable loading
    console.log('1. Testing environment variable loading...');
    require('dotenv').config({ path: '.env.local' });
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
      console.log(`  ✅ ${envVar}: [SET]`);
    }
    
    // Test 2: Module imports
    console.log('2. Testing module imports...');
    const { FoodTruckService } = await import('./dist/lib/supabase/services/foodTruckService.js');
    const { APIUsageService } = await import('./dist/lib/supabase/services/apiUsageService.js');
    console.log('  ✅ All modules imported successfully');
    
    // Test 3: Supabase connection
    console.log('3. Testing Supabase connection...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    const { data, error } = await supabase.from('food_trucks').select('count').single();
    if (error) throw error;
    console.log(`  ✅ Supabase connection successful. Found ${data.count} food trucks.`);
    
    console.log('🎉 All environment tests passed!');
    
  } catch (error) {
    console.error('💥 Environment test failed:', error);
    process.exit(1);
  }
}

testEnvironment();
```

## Best Practices Implementation

### 1. Configuration Hierarchy
```
config/
├── default.js          # Default configuration
├── development.js      # Development overrides
├── production.js       # Production overrides
├── test.js            # Test overrides
└── custom-environment.js  # Custom environment overrides
```

### 2. Environment Variable Validation
```javascript
// lib/validators.js
class ConfigValidators {
  static validateUrl(url, fieldName) {
    try {
      new URL(url);
      return true;
    } catch (error) {
      throw new Error(`${fieldName} is not a valid URL: ${url}`);
    }
  }

  static validateApiKey(key, fieldName) {
    if (!key || key.length < 10) {
      throw new Error(`${fieldName} appears to be invalid or too short`);
    }
    return true;
  }

  static validatePort(port, fieldName) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      throw new Error(`${fieldName} must be a valid port number (1-65535)`);
    }
    return true;
  }
}

module.exports = ConfigValidators;
```

### 3. Configuration Loading Pattern
```javascript
// lib/app.js
class Application {
  static async initialize() {
    try {
      console.log('🚀 Initializing Food Truck Finder Application...');
      
      // Step 1: Load environment variables
      this.loadEnvironment();
      
      // Step 2: Validate configuration
      this.validateConfiguration();
      
      // Step 3: Initialize services
      await this.initializeServices();
      
      // Step 4: Start application
      this.start();
      
    } catch (error) {
      console.error('❌ Application initialization failed:', error);
      process.exit(1);
    }
  }

  static loadEnvironment() {
    console.log('🔧 Loading environment variables...');
    require('dotenv').config({ path: '.env.local' });
  }

  static validateConfiguration() {
    console.log('🔍 Validating configuration...');
    const AppConfig = require('./config');
    AppConfig.validate();
  }

  static async initializeServices() {
    console.log('🔌 Initializing services...');
    const SupabaseManager = require('./supabase');
    await SupabaseManager.initialize();
  }

  static start() {
    const AppConfig = require('./config');
    console.log(`✅ Application started on port ${AppConfig.app.port}`);
  }
}

module.exports = Application;
```

## Common Pitfalls and Solutions

### 1. Missing Environment Variables
**Problem:** Application crashes due to missing environment variables
**Solution:** Implement comprehensive validation at startup

### 2. Inconsistent Naming
**Problem:** Different environment variable names between local and remote
**Solution:** Use consistent naming conventions and document them

### 3. Hardcoded Values
**Problem:** Sensitive data committed to version control
**Solution:** Use environment variables and gitignore files

### 4. Module Resolution Issues
**Problem:** ESM import errors in different environments
**Solution:** Use explicit file extensions and dynamic imports

## Monitoring and Maintenance

### 1. Configuration Health Checks
```javascript
// scripts/check-config.js
async function checkConfiguration() {
  console.log('📋 Configuration Health Check');
  
  // Check environment variables
  const AppConfig = require('../lib/config');
  AppConfig.validate();
  
  // Check file permissions
  const fs = require('fs');
  try {
    fs.accessSync('.env.local', fs.constants.R_OK);
    console.log('✅ .env.local file is readable');
  } catch (error) {
    console.warn('⚠️  .env.local file not readable:', error.message);
  }
  
  // Check required directories
  const requiredDirs = ['dist', 'scripts', 'lib'];
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      console.log(`✅ Directory ${dir} exists`);
    } else {
      console.error(`❌ Directory ${dir} missing`);
    }
  }
}

checkConfiguration();
```

### 2. Automated Configuration Updates
```bash
# scripts/update-config.sh
#!/bin/bash
echo "🔄 Updating configuration files..."

# Backup current configuration
cp .env.local .env.local.backup

# Update dependencies
npm install

# Rebuild TypeScript files
npm run build

# Validate configuration
node scripts/check-config.js

echo "✅ Configuration update completed"
```

## Conclusion

Proper configuration management is essential for maintaining consistent behavior between local development and remote deployment environments. By implementing these best practices:

1. **Use consistent environment variable naming** with `NEXT_PUBLIC_` prefix for client-side variables
2. **Implement centralized configuration management** using libraries like `node-config`
3. **Validate all configuration at startup** to catch issues early
4. **Use dynamic imports** for environment-dependent modules
5. **Maintain comprehensive error logging** for debugging
6. **Test configurations regularly** to ensure consistency

These practices will eliminate the environment-specific issues that have been causing problems with GitHub Actions and ensure reliable deployment across all platforms.
