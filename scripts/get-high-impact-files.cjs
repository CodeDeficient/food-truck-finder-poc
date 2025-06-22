#!/usr/bin/env node

const { execSync } = require('node:child_process');
const path = require('node:path'); // Not strictly needed here but good practice if manipulating paths

let eslintCLIPath;
try {
  eslintCLIPath = require.resolve('eslint/bin/eslint.js');
} catch (e) {
  console.error("ESLint CLI path not found. Make sure 'eslint' is installed locally.");
  process.exit(1);
}
const nodeExecutablePath = process.execPath;

try {
  console.log('🔍 Getting high-impact files for linting remediation...');
  
  let eslintOutput;
  try {
    const command = `"${nodeExecutablePath}" "${eslintCLIPath}" . --format json`;
    // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
    eslintOutput = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe', // Capture stdout, stderr will go to console by default if not piped
      timeout: 180_000, // Increased timeout
      maxBuffer: 1024 * 1024 * 20 // Increased buffer
    });
  } catch (error) {
    if (error.stdout && error.stdout.length > 0) {
      eslintOutput = error.stdout.toString();
      console.warn('ESLint found errors or exited with non-zero, but output was captured.');
    } else {
      console.error('ESLint execution failed and no output was captured:');
      if (error.stderr) console.error("Stderr:", error.stderr.toString());
      if (error.message && !error.message.includes(error.stderr?.toString())) console.error(error.message);
      process.exit(1);
    }
  }
  
  let data;
  try {
    data = JSON.parse(eslintOutput);
  } catch (parseError) {
    console.error('Failed to parse ESLint output as JSON:', parseError.message);
    console.error('ESLint output snippet (first 1000 chars):', eslintOutput.substring(0, 1000));
    process.exit(1);
  }
  
  const files = data
    .filter(f => f.errorCount > 0)
    .map(f => ({
      // Normalize path and remove CWD prefix for cleaner output
      file: f.filePath.startsWith(process.cwd())
            ? path.relative(process.cwd(), f.filePath).replaceAll('\\', '/')
            : f.filePath.replaceAll('\\', '/'),
      errors: f.errorCount,
      warnings: f.warningCount // Also capture warnings for more info
    }))
    .sort((a, b) => b.errors - a.errors); // Sort by error count descending
  
  console.log('\n🎯 HIGH-IMPACT FILES (20+ errors):');
  console.log('=' .repeat(50));
  const highImpact = files.filter(f => f.errors >= 20);
  if (highImpact.length > 0) {
    for (const f of highImpact) console.log(`${f.errors} errors, ${f.warnings} warnings: ${f.file}`);
  } else {
    console.log('No files with 20+ errors found.');
  }
  
  console.log('\n📊 MEDIUM-IMPACT FILES (10-19 errors):');
  console.log('=' .repeat(50));
  const mediumImpact = files.filter(f => f.errors >= 10 && f.errors < 20);
  if (mediumImpact.length > 0) {
    for (const f of mediumImpact) console.log(`${f.errors} errors, ${f.warnings} warnings: ${f.file}`);
  } else {
    console.log('No files with 10-19 errors found.');
  }
  
  console.log('\n📈 LOWER-IMPACT FILES (5-9 errors):');
  console.log('=' .repeat(50));
  const lowerImpact = files.filter(f => f.errors >= 5 && f.errors < 10);
  if (lowerImpact.length > 0) {
    for (const f of lowerImpact) console.log(`${f.errors} errors, ${f.warnings} warnings: ${f.file}`);
  } else {
    console.log('No files with 5-9 errors found.');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('=' .repeat(50));
  console.log(`Total files with errors: ${files.length}`);
  console.log(`High-impact files (20+): ${highImpact.length}`);
  console.log(`Medium-impact files (10-19): ${mediumImpact.length}`);
  console.log(`Lower-impact files (5-9): ${lowerImpact.length}`);
  const veryLowImpactCount = files.filter(f => f.errors > 0 && f.errors < 5).length;
  console.log(`Files with <5 errors: ${veryLowImpactCount}`);
  
} catch (error) {
  console.error('Error in get-high-impact-files script:', error.message);
  if (error.stack) console.error(error.stack);
  process.exit(1);
}
