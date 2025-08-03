#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Script to inventory interpolated placeholders in .env.local
 * Scans for patterns like ${VARIABLE_NAME} and checks if they exist in process.env
 */

const ENV_FILE_PATH = '.env.local';

function scanForInterpolatedVars() {
  try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      console.log(`❌ File ${ENV_FILE_PATH} not found`);
      return;
    }

    // Read the file content
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const lines = content.split('\n');

    console.log('🔍 Scanning .env.local for interpolated placeholders...\n');
    
    // Regex to match ${VARIABLE_NAME} patterns
    const interpolationRegex = /\$\{[^}]+\}/g;
    const foundPlaceholders = new Set();
    const matchingLines = [];

    lines.forEach((line, index) => {
      const matches = line.match(interpolationRegex);
      if (matches) {
        matchingLines.push({
          lineNumber: index + 1,
          line: line.trim(),
          matches: matches
        });
        
        // Extract variable names from ${VAR_NAME} format
        matches.forEach(match => {
          const varName = match.slice(2, -1); // Remove ${ and }
          foundPlaceholders.add(varName);
        });
      }
    });

    if (matchingLines.length === 0) {
      console.log('✅ No interpolated placeholders found in .env.local');
      return;
    }

    console.log('📋 Lines with interpolated placeholders:');
    console.log('=' .repeat(50));
    matchingLines.forEach(({ lineNumber, line, matches }) => {
      console.log(`Line ${lineNumber}: ${line}`);
      console.log(`  Placeholders: ${matches.join(', ')}`);
    });

    console.log('\n🔍 Variable availability check:');
    console.log('=' .repeat(50));
    
    const missingVars = [];
    const availableVars = [];

    foundPlaceholders.forEach(varName => {
      const exists = process.env[varName] !== undefined;
      const status = exists ? '✅' : '❌';
      const value = exists ? (process.env[varName].length > 0 ? '[SET]' : '[EMPTY]') : '[MISSING]';
      
      console.log(`${status} ${varName}: ${value}`);
      
      if (exists) {
        availableVars.push(varName);
      } else {
        missingVars.push(varName);
      }
    });

    console.log('\n📊 Summary:');
    console.log('=' .repeat(50));
    console.log(`Total placeholders found: ${foundPlaceholders.size}`);
    console.log(`Available in process.env: ${availableVars.length}`);
    console.log(`Missing from process.env: ${missingVars.length}`);

    if (missingVars.length > 0) {
      console.log('\n⚠️  Missing variables:');
      missingVars.forEach(varName => {
        console.log(`  - ${varName}`);
      });
      
      console.log('\n💡 To check these in PowerShell, run:');
      missingVars.forEach(varName => {
        console.log(`  $Env:${varName}`);
      });
    }

    // Output for build-failure doc
    console.log('\n📝 For build-failure documentation:');
    console.log('=' .repeat(50));
    console.log('Interpolated variables found in .env.local:');
    foundPlaceholders.forEach(varName => {
      const exists = process.env[varName] !== undefined;
      const status = exists ? 'AVAILABLE' : 'MISSING';
      console.log(`- ${varName}: ${status}`);
    });

  } catch (error) {
    console.error('❌ Error scanning .env.local:', error.message);
    process.exit(1);
  }
}

// Run the script
scanForInterpolatedVars();
