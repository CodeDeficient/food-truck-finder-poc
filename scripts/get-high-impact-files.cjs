#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('🔍 Getting high-impact files for linting remediation...');
  
  // Get ESLint results
  const output = execSync('npx eslint . --format json', {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
    timeout: 120000
  });
  
  const data = JSON.parse(output);
  
  // Process files and sort by error count
  const files = data
    .filter(f => f.errorCount > 0)
    .map(f => ({
      file: f.filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
      errors: f.errorCount
    }))
    .sort((a, b) => b.errors - a.errors);
  
  console.log('\n🎯 HIGH-IMPACT FILES (20+ errors):');
  console.log('=' .repeat(50));
  const highImpact = files.filter(f => f.errors >= 20);
  if (highImpact.length > 0) {
    highImpact.forEach(f => console.log(`${f.errors} errors: ${f.file}`));
  } else {
    console.log('No files with 20+ errors found.');
  }
  
  console.log('\n📊 MEDIUM-IMPACT FILES (10-19 errors):');
  console.log('=' .repeat(50));
  const mediumImpact = files.filter(f => f.errors >= 10 && f.errors < 20);
  if (mediumImpact.length > 0) {
    mediumImpact.forEach(f => console.log(`${f.errors} errors: ${f.file}`));
  } else {
    console.log('No files with 10-19 errors found.');
  }
  
  console.log('\n📈 LOWER-IMPACT FILES (5-9 errors):');
  console.log('=' .repeat(50));
  const lowerImpact = files.filter(f => f.errors >= 5 && f.errors < 10);
  if (lowerImpact.length > 0) {
    lowerImpact.forEach(f => console.log(`${f.errors} errors: ${f.file}`));
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
  
} catch (error) {
  console.error('Error analyzing files:', error.message);
  process.exit(1);
}
