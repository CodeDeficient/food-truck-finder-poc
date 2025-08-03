#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

/**
 * Regression guard script that prevents environment variable interpolation from slipping back in
 * Exits with non-zero code if .env.local contains ${...} tokens
 * Used in CI prebuild step to fail builds when interpolation is detected
 */

const ENV_FILE_PATH = '.env.local';

function checkEnvInterpolation() {
  try {
    // Check if .env.local exists
    if (!fs.existsSync(ENV_FILE_PATH)) {
      console.log(`✅ File ${ENV_FILE_PATH} not found - no interpolation to check`);
      process.exit(0);
    }

    // Read the file content
    const content = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const lines = content.split('\n');

    // Regex to match ${VARIABLE_NAME} patterns
    const interpolationRegex = /\$\{[^}]+\}/g;
    const foundInterpolations = [];

    lines.forEach((line, index) => {
      const matches = line.match(interpolationRegex);
      if (matches) {
        foundInterpolations.push({
          lineNumber: index + 1,
          line: line.trim(),
          matches: matches
        });
      }
    });

    if (foundInterpolations.length === 0) {
      console.log('✅ PASS: No environment variable interpolation found in .env.local');
      process.exit(0);
    }

    // Interpolation found - fail the check
    console.error('❌ FAIL: Environment variable interpolation detected in .env.local');
    console.error('');
    console.error('The following lines contain interpolation tokens that should be replaced with actual values:');
    console.error('='.repeat(80));
    
    foundInterpolations.forEach(({ lineNumber, line, matches }) => {
      console.error(`Line ${lineNumber}: ${line}`);
      console.error(`  → Interpolation tokens: ${matches.join(', ')}`);
    });

    console.error('');
    console.error('💡 To fix this issue:');
    console.error('  1. Replace ${VARIABLE_NAME} tokens with actual secret values');
    console.error('  2. Ensure all environment variables are properly set');
    console.error('  3. Re-run the build after fixing the interpolation');
    console.error('');
    console.error('⚠️  This check prevents builds with unresolved environment variable placeholders');
    
    process.exit(1);

  } catch (error) {
    console.error('❌ ERROR: Failed to check .env.local for interpolation:', error.message);
    process.exit(1);
  }
}

// Run the regression guard
checkEnvInterpolation();
