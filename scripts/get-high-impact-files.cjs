#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

try {
  console.log('🔍 Getting high-impact files for linting remediation...');

  // Read ESLint results from the pre-generated file
  const lintResultsPath = path.join(process.cwd(), 'test-results', 'lint-results.json');
  const output = fs.readFileSync(lintResultsPath, 'utf8');

  const data = JSON.parse(output);

  // Process files and sort by error count
  const filesWithErrors = data
    .filter((f) => f.errorCount > 0)
    .map((f) => ({
      file: f.filePath.replace(process.cwd(), '').replace(/\\/g, '/'),
      errors: f.errorCount,
      messages: f.messages.map((msg) => ({
        ruleId: msg.ruleId,
        severity: msg.severity === 2 ? 'error' : 'warning',
        line: msg.line,
        column: msg.column,
        message: msg.message,
      })),
    }))
    .sort((a, b) => b.errors - a.errors);

  const reportContent = [];
  const appendToReport = (text) => reportContent.push(text);

  appendToReport('🔍 High-Impact Files for Linting Remediation Report\n');
  appendToReport('===================================================\n');

  appendToReport('\n🎯 HIGH-IMPACT FILES (20+ errors):');
  appendToReport('='.repeat(50));
  const highImpact = filesWithErrors.filter((f) => f.errors >= 20);
  if (highImpact.length > 0) {
    highImpact.forEach((f) => {
      appendToReport(`${f.errors} errors: ${f.file}`);
      f.messages.forEach((msg) => {
        appendToReport(
          `  - [${msg.severity}] ${msg.ruleId} (Line ${msg.line}, Col ${msg.column}): ${msg.message}`,
        );
      });
    });
  } else {
    appendToReport('No files with 20+ errors found.');
  }

  appendToReport('\n📊 MEDIUM-IMPACT FILES (10-19 errors):');
  appendToReport('='.repeat(50));
  const mediumImpact = filesWithErrors.filter((f) => f.errors >= 10 && f.errors < 20);
  if (mediumImpact.length > 0) {
    mediumImpact.forEach((f) => {
      appendToReport(`${f.errors} errors: ${f.file}`);
      f.messages.forEach((msg) => {
        appendToReport(
          `  - [${msg.severity}] ${msg.ruleId} (Line ${msg.line}, Col ${msg.column}): ${msg.message}`,
        );
      });
    });
  } else {
    appendToReport('No files with 10-19 errors found.');
  }

  appendToReport('\n📈 LOWER-IMPACT FILES (5-9 errors):');
  appendToReport('='.repeat(50));
  const lowerImpact = filesWithErrors.filter((f) => f.errors >= 5 && f.errors < 10);
  if (lowerImpact.length > 0) {
    lowerImpact.forEach((f) => {
      appendToReport(`${f.errors} errors: ${f.file}`);
      f.messages.forEach((msg) => {
        appendToReport(
          `  - [${msg.severity}] ${msg.ruleId} (Line ${msg.line}, Col ${msg.column}): ${msg.message}`,
        );
      });
    });
  } else {
    appendToReport('No files with 5-9 errors found.');
  }

  appendToReport('\n📋 SUMMARY:');
  appendToReport('='.repeat(50));
  appendToReport(`Total files with errors: ${filesWithErrors.length}`);
  appendToReport(`High-impact files (20+): ${highImpact.length}`);
  appendToReport(`Medium-impact files (10-19): ${mediumImpact.length}`);
  appendToReport(`Lower-impact files (5-9): ${lowerImpact.length}`);
  appendToReport(`Files with <5 errors: ${filesWithErrors.filter((f) => f.errors < 5).length}`);

  const reportFileName = `high-impact-lint-report-${new Date().toISOString().replace(/:/g, '-')}.txt`;
  const reportFilePath = path.join(process.cwd(), 'test-results', reportFileName);
  fs.writeFileSync(reportFilePath, reportContent.join('\n'), 'utf8');

  console.log('\nReport saved to:');
  console.log(reportFilePath.replace(process.cwd(), '').replace(/\\/g, '/'));
} catch (error) {
  console.error('Error analyzing files:', error.message);
  process.exit(1);
}
