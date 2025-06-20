#!/usr/bin/env node

const { execSync } = require('node:child_process');

try {
  console.log('🔍 Getting high-impact files for linting remediation...');
  
  let eslintOutput;
  try {
    eslintOutput = execSync('npx eslint . --format json', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stdout, stderr, and stdin
      timeout: 120_000
    });
  } catch (error) {
    // If ESLint exits with a non-zero code (e.g., errors found), execSync throws an error.
    // However, the JSON output might still be available in error.stdout.
    if (error.stdout) {
      eslintOutput = error.stdout.toString();
      console.warn('ESLint found errors, but output was captured.');
    } else {
      console.error('ESLint execution failed and no output was captured:', error.message);
      process.exit(1);
    }
  }
  
  let data;
  try {
    data = JSON.parse(eslintOutput);
  } catch (parseError) {
    console.error('Failed to parse ESLint output as JSON:', parseError.message);
    console.error('ESLint output was:', eslintOutput); // Log the problematic output
    process.exit(1);
  }
  
  // Process files and sort by error count
  const files = data
    .filter(f => f.errorCount > 0)
    .map(f => ({
      file: f.filePath.replace(process.cwd(), '').replaceAll('\\', '/'),
      errors: f.errorCount
    }))
    .sort((a, b) => b.errors - a.errors);
  
  console.log('\n🎯 HIGH-IMPACT FILES (20+ errors):');
  console.log('=' .repeat(50));
  const highImpact = files.filter(f => f.errors >= 20);
  if (highImpact.length > 0) {
    for (const f of highImpact) console.log(`${f.errors} errors: ${f.file}`);
  } else {
    console.log('No files with 20+ errors found.');
  }
  
  console.log('\n📊 MEDIUM-IMPACT FILES (10-19 errors):');
  console.log('=' .repeat(50));
  const mediumImpact = files.filter(f => f.errors >= 10 && f.errors < 20);
  if (mediumImpact.length > 0) {
    for (const f of mediumImpact) console.log(`${f.errors} errors: ${f.file}`);
  } else {
    console.log('No files with 10-19 errors found.');
  }
  
  console.log('\n📈 LOWER-IMPACT FILES (5-9 errors):');
  console.log('=' .repeat(50));
  const lowerImpact = files.filter(f => f.errors >= 5 && f.errors < 10);
  if (lowerImpact.length > 0) {
    for (const f of lowerImpact) console.log(`${f.errors} errors: ${f.file}`);
  } else {
    console.log('No files with 5-9 errors found.');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`Total files with errors: ${files.length}`);
  console.log(`High-impact files (20+): ${highImpact.length}`);
  console.log(`Medium-impact files (10-19): ${mediumImpact.length}`);
  console.log(`Lower-impact files (5-9): ${lowerImpact.length}`);
  console.log(`Files with <5 errors: ${files.filter(f => f.errors < 5).length}`);
  
} catch (error) { // Catch any other unexpected errors during processing
  console.error('Error processing ESLint data:', error.message);
  process.exit(1);
}
