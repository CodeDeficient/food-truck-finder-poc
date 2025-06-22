const { execSync } = require('node:child_process');
const fs = require('node:fs');

// Get ESLint output
console.log('Running ESLint analysis...');
let eslintOutput;
try {
  // Prefer local eslint binary path
  // This assumes eslint is installed locally, which is typical for npx usage.
  const eslintCLIPath = require.resolve('eslint/bin/eslint.js');
  // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
  eslintOutput = execSync(`node "${eslintCLIPath}" . --format json`, {
    encoding: 'utf8',
    stdio: 'pipe', // Capture stdout
    timeout: 120_000 // 2 minutes timeout
  });
} catch (error) {
  // ESLint returns non-zero exit code when errors are found,
  // but still outputs JSON to stdout.
  if (error.stdout && error.stdout.length > 0) {
    eslintOutput = error.stdout;
  } else {
    // If no stdout, or it's empty, then it's a more serious error
    console.error('Failed to run ESLint or no output received.');
    if (error.stderr) {
      console.error('ESLint stderr:', error.stderr);
    }
    if (error.message) {
      console.error('ESLint error message:', error.message);
    }
    process.exit(1);
  }
}

let results;
try {
  results = JSON.parse(eslintOutput);
} catch (parseError) {
  console.error('Failed to parse ESLint JSON output.');
  console.error('ESLint raw output length:', eslintOutput ? eslintOutput.length : 'undefined');
  // Avoid printing extremely long strings if output is huge and not JSON
  console.error('ESLint raw output (first 1000 chars):', eslintOutput ? eslintOutput.substring(0, 1000) : 'undefined');
  console.error('Parse error:', parseError.message);
  process.exit(1);
}

// Complexity-related rules to look for
const complexityRules = new Set([
  'max-lines-per-function',
  'max-lines',
  'sonarjs/cognitive-complexity',
  'complexity',
  'max-depth',
  'max-params',
  'sonarjs/no-identical-functions'
]);

// Extract components with complexity violations
const complexityViolations = [];

for (const file of results) {
  if (file.messages && file.messages.length > 0) {
    for (const message of file.messages) {
      if (complexityRules.has(message.ruleId)) {
        complexityViolations.push({
          filePath: file.filePath.replace('C:\\AI\\food-truck-finder-poc\\', ''), // Consider making this path replacement more robust or configurable
          ruleId: message.ruleId,
          message: message.message,
          line: message.line,
          endLine: message.endLine,
          severity: message.severity,
          nodeType: message.nodeType
        });
      }
    }
  }
}

// Group by file and calculate severity
const fileViolations = {};
for (const violation of complexityViolations) {
  if (!fileViolations[violation.filePath]) {
    fileViolations[violation.filePath] = [];
  }
  fileViolations[violation.filePath].push(violation);
}

// Calculate severity scores and sort
const prioritizedFiles = Object.entries(fileViolations).map(([filePath, violations]) => {
  let severityScore = 0;
  let maxLinesViolation = null;
  
  for (const violation of violations) {
    switch (violation.ruleId) {
      case 'max-lines-per-function': {
        const match = violation.message.match(/has too many lines \((\d+)\)\. Maximum allowed is (\d+)/);
        if (match) {
          const current = Number.parseInt(match[1]);
          const max = Number.parseInt(match[2]);
          const excess = current - max;
          severityScore += excess * 2;
          maxLinesViolation = { current, max, excess };
        }
        break;
      }
      case 'sonarjs/cognitive-complexity': {
        severityScore += 15;
        break;
      }
      case 'max-depth': {
        severityScore += 10;
        break;
      }
      case 'max-params': {
        severityScore += 8;
        break;
      }
      case 'sonarjs/no-identical-functions': {
        severityScore += 20;
        break;
      }
      default: {
        severityScore += 5;
      }
    }
  }
  
  return {
    filePath,
    violations,
    severityScore,
    maxLinesViolation,
    violationCount: violations.length
  };
}).sort((a, b) => b.severityScore - a.severityScore);

// Generate report
console.log('\n🚨 REACT COMPONENT COMPLEXITY ANALYSIS REPORT 🚨\n');
console.log('=' .repeat(80));

console.log(`\n📊 SUMMARY:`);
console.log(`- Total files with complexity violations: ${prioritizedFiles.length}`);
console.log(`- Total complexity violations: ${complexityViolations.length}`);

if (prioritizedFiles.length === 0) {
  console.log('\n✅ No complexity violations found!');
  process.exit(0);
}

console.log(`\n🎯 PARETO 80/20 PRIORITIZATION (by severity score):`);
console.log('-'.repeat(80));

for (const [index, file] of prioritizedFiles.entries()) {
  const isHighPriority = index < Math.ceil(prioritizedFiles.length * 0.2);
  const priority = isHighPriority ? '🔥 HIGH' : '📋 MEDIUM';
  
  console.log(`\n${index + 1}. ${priority} PRIORITY - Severity Score: ${file.severityScore}`);
  console.log(`   📁 File: ${file.filePath}`);
  
  if (file.maxLinesViolation) {
    console.log(`   📏 Lines: ${file.maxLinesViolation.current} (limit: ${file.maxLinesViolation.max}, excess: ${file.maxLinesViolation.excess})`);
  }
  
  console.log(`   ⚠️  Violations (${file.violationCount}):`);
  for (const violation of file.violations) {
    console.log(`      - ${violation.ruleId}: ${violation.message} (line ${violation.line})`);
  }
}

console.log(`\n🔧 REFACTORING RECOMMENDATIONS:`);
console.log('-'.repeat(80));

const highPriorityFiles = prioritizedFiles.slice(0, Math.ceil(prioritizedFiles.length * 0.2));
console.log(`\n1. Focus on TOP ${highPriorityFiles.length} files first (80/20 rule):`);
for (const [index, file] of highPriorityFiles.entries()) {
  console.log(`   ${index + 1}. ${file.filePath} (Score: ${file.severityScore})`);
}

console.log(`\n2. Common refactoring strategies:`);
console.log(`   - Extract helper functions from large components`);
console.log(`   - Split complex components into smaller sub-components`);
console.log(`   - Move business logic to custom hooks`);
console.log(`   - Use composition over large prop lists`);
console.log(`   - Extract duplicate code into shared utilities`);

console.log(`\n3. Estimated impact:`);
console.log(`   - Fixing top 20% of files could resolve ~80% of complexity issues`);
console.log(`   - Focus on max-lines-per-function violations first (highest impact)`);

// Save detailed report
const reportData = {
  timestamp: new Date().toISOString(),
  summary: {
    totalFiles: prioritizedFiles.length,
    totalViolations: complexityViolations.length,
    highPriorityFiles: highPriorityFiles.length
  },
  prioritizedFiles,
  allViolations: complexityViolations
};

fs.writeFileSync('complexity-analysis-report.json', JSON.stringify(reportData, null, 2));
console.log(`\n💾 Detailed report saved to: complexity-analysis-report.json`);
