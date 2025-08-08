#!/usr/bin/env node

/**
 * Pre-commit hook to prevent accidental commit of internal/sensitive documents
 * This script is called by Husky before each commit
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Patterns that should NEVER be committed
const FORBIDDEN_PATTERNS = [
  /\.internal\//,
  /_internal\//,
  /\.private\//,
  /_private\//,
  /competitive-analysis/i,
  /pricing-strategy/i,
  /market-research/i,
  /investor-deck/i,
  /financial-projections/i,
  /competitor-weaknesses/i,
  /trade-secrets/i,
  /\.confidential\./,
  /\.internal\./,
  /\.private\./,
  /\.sensitive\./
];

// Get list of staged files
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    return output.split('\n').filter(file => file.length > 0);
  } catch (error) {
    console.error('Error getting staged files:', error.message);
    return [];
  }
}

// Check if any file matches forbidden patterns
function checkForSensitiveFiles() {
  const stagedFiles = getStagedFiles();
  const violations = [];

  for (const file of stagedFiles) {
    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(file)) {
        violations.push({
          file,
          pattern: pattern.toString()
        });
      }
    }
  }

  return violations;
}

// Main execution
function main() {
  console.log('🔍 Checking for internal/sensitive documents...');
  
  const violations = checkForSensitiveFiles();
  
  if (violations.length > 0) {
    console.error('\n❌ SECURITY VIOLATION: Attempting to commit sensitive documents!\n');
    console.error('The following files must NOT be committed:\n');
    
    violations.forEach(({ file, pattern }) => {
      console.error(`  🚫 ${file}`);
      console.error(`     Matched pattern: ${pattern}\n`);
    });
    
    console.error('📋 To fix this issue:');
    console.error('  1. Run: git reset HEAD <file> (for each file above)');
    console.error('  2. Move sensitive files to .internal/ folder');
    console.error('  3. Verify with: git status');
    console.error('  4. Try committing again\n');
    
    console.error('⚠️  If these files contain business intelligence, competitive');
    console.error('   analysis, or strategic information, they MUST be kept private!\n');
    
    process.exit(1);
  }
  
  // Additional check: warn if .internal folder exists but isn't gitignored
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (fs.existsSync(path.join(process.cwd(), '.internal'))) {
    try {
      const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
      if (!gitignore.includes('.internal/')) {
        console.warn('\n⚠️  WARNING: .internal folder exists but may not be properly gitignored!');
        console.warn('   Please verify .gitignore includes: .internal/\n');
      }
    } catch (error) {
      console.warn('\n⚠️  WARNING: Could not verify .gitignore settings');
    }
  }
  
  console.log('✅ No sensitive documents detected in commit\n');
}

// Run the check
if (require.main === module) {
  main();
}
