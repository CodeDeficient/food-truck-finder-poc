#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Starting secrets scan...');

// Use pattern-based scanning (reliable across all environments)
async function scanSecrets() {
  console.log('🔎 Using built-in pattern-based secrets detection...');
  return runFallbackScan();
}

// Fallback secrets detection using pattern matching
function runFallbackScan() {
  console.log('🔎 Running pattern-based secrets detection...');
  
  const secretPatterns = [
    // API Keys
    { name: 'Generic API Key', pattern: /[a-zA-Z0-9_-]{20,}/ },
    { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/ },
    { name: 'AWS Secret Key', pattern: /[A-Za-z0-9/+=]{40}/ },
    { name: 'GitHub Token', pattern: /ghp_[A-Za-z0-9]{36}/ },
    { name: 'Google API Key', pattern: /AIza[0-9A-Za-z\\-_]{35}/ },
    { name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9]{48}/ },
    { name: 'Supabase Anon Key', pattern: /eyJ[A-Za-z0-9_-]*\\.eyJ[A-Za-z0-9_-]*\\.[A-Za-z0-9_-]*/ },
    { name: 'JWT Token', pattern: /eyJ[A-Za-z0-9_\/+-]*={0,2}/ },
    // Database URLs
    { name: 'Database URL', pattern: /(postgresql|mysql|mongodb):\/\/[^\\s]+/ },
    // Private Keys
    { name: 'Private Key', pattern: /-----BEGIN [A-Z ]+-----[\\s\\S]*-----END [A-Z ]+-----/ },
    // Generic secrets
    { name: 'Password in URL', pattern: /[a-zA-Z]{3,}:\/\/[^:\/\\s]*:[^@\/\\s]*@[^\/\\s]*/ },
  ];

  const excludePatterns = [
    /node_modules/,
    /\.next/,
    /dist/,
    /build/,
    /coverage/,
    /\.git/,
    /\.log$/,
    /\.tmp$/,
    /package-lock\.json$/,
    /yarn\.lock$/,
  ];

  const extensions = ['.js', '.ts', '.jsx', '.tsx', '.json', '.env', '.yml', '.yaml', '.toml', '.md'];
  
  let foundSecrets = false;
  const projectRoot = path.resolve(__dirname, '..');

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(projectRoot, filePath);
      
      // Skip excluded paths
      if (excludePatterns.some(pattern => pattern.test(relativePath))) {
        continue;
      }
      
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (extensions.some(ext => file.endsWith(ext))) {
        scanFile(filePath, relativePath);
      }
    }
  }

  function scanFile(filePath, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, lineNumber) => {
        secretPatterns.forEach(({ name, pattern }) => {
          const matches = line.match(pattern);
          if (matches) {
            // Skip common false positives
            if (isLikelyFalsePositive(line, matches[0])) {
              return;
            }
            
            console.error(`❌ Potential ${name} found:`);
            console.error(`   File: ${relativePath}:${lineNumber + 1}`);
            console.error(`   Line: ${line.trim()}`);
            console.error(`   Match: ${matches[0].substring(0, 20)}${'*'.repeat(Math.max(0, matches[0].length - 20))}`);
            console.error('');
            foundSecrets = true;
          }
        });
      });
    } catch (error) {
      // Skip files that can't be read
    }
  }

  function isLikelyFalsePositive(line, match) {
    // Skip comments and documentation
    if (/^\s*(\/\/|#|\*|<!--)/.test(line.trim())) {
      return true;
    }
    
    // Skip example/placeholder values
    if (/example|placeholder|dummy|test|fake|sample|your_|your-|xxx|yyy|zzz/i.test(match)) {
      return true;
    }
    
    // Skip common non-secret patterns
    if (/console\.log|logger|debug|print/i.test(line)) {
      return true;
    }
    
    return false;
  }

  scanDirectory(projectRoot);
  
  if (foundSecrets) {
    console.error('❌ Potential secrets detected!');
    console.error('Please review and remove any actual secrets before proceeding.');
    console.error('If these are false positives, consider adding them to the exclusion patterns.');
    return false;
  } else {
    console.log('✅ No secrets detected by pattern matching');
    return true;
  }
}

// Main execution
scanSecrets()
  .then(success => {
    if (success) {
      console.log('✅ Secrets scan passed');
      process.exit(0);
    } else {
      console.error('❌ Secrets scan failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('❌ Secrets scan error:', error.message);
    process.exit(1);
  });
