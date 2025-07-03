const { execSync } = require('child_process');
const fs = require('fs');

// Get ESLint output
console.log('Running ESLint analysis...');
let eslintOutput;
try {
  eslintOutput = execSync('npx eslint . --format json', {
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 120000,
  });
} catch (error) {
  // ESLint returns non-zero exit code when errors are found
  eslintOutput = error.stdout;
}

const results = JSON.parse(eslintOutput);

// Complexity-related rules to look for
const complexityRules = [
  'max-lines-per-function',
  'max-lines',
  'sonarjs/cognitive-complexity',
  'complexity',
  'max-depth',
  'max-params',
  'sonarjs/no-identical-functions',
];

// Extract components with complexity violations
const complexityViolations = [];

results.forEach((file) => {
  if (file.messages && file.messages.length > 0) {
    file.messages.forEach((message) => {
      if (complexityRules.includes(message.ruleId)) {
        complexityViolations.push({
          filePath: file.filePath.replace('C:\\AI\\food-truck-finder-poc\\', ''),
          ruleId: message.ruleId,
          message: message.message,
          line: message.line,
          endLine: message.endLine,
          severity: message.severity,
          nodeType: message.nodeType,
        });
      }
    });
  }
});

// Group by file and calculate severity
const fileViolations = {};
complexityViolations.forEach((violation) => {
  if (!fileViolations[violation.filePath]) {
    fileViolations[violation.filePath] = [];
  }
  fileViolations[violation.filePath].push(violation);
});

// Calculate severity scores and sort
const prioritizedFiles = Object.entries(fileViolations)
  .map(([filePath, violations]) => {
    let severityScore = 0;
    let maxLinesViolation = null;

    violations.forEach((violation) => {
      switch (violation.ruleId) {
        case 'max-lines-per-function':
          // Extract current and max lines from message
          const match = violation.message.match(
            /has too many lines \((\d+)\)\. Maximum allowed is (\d+)/,
          );
          if (match) {
            const current = parseInt(match[1]);
            const max = parseInt(match[2]);
            const excess = current - max;
            severityScore += excess * 2; // Weight function length heavily
            maxLinesViolation = { current, max, excess };
          }
          break;
        case 'sonarjs/cognitive-complexity':
          severityScore += 15; // High impact
          break;
        case 'max-depth':
          severityScore += 10;
          break;
        case 'max-params':
          severityScore += 8;
          break;
        case 'sonarjs/no-identical-functions':
          severityScore += 20; // Very high impact - duplicate code
          break;
        default:
          severityScore += 5;
      }
    });

    return {
      filePath,
      violations,
      severityScore,
      maxLinesViolation,
      violationCount: violations.length,
    };
  })
  .sort((a, b) => b.severityScore - a.severityScore);

// Generate report
console.log('\n🚨 REACT COMPONENT COMPLEXITY ANALYSIS REPORT 🚨\n');
console.log('='.repeat(80));

console.log(`\n📊 SUMMARY:`);
console.log(`- Total files with complexity violations: ${prioritizedFiles.length}`);
console.log(`- Total complexity violations: ${complexityViolations.length}`);

if (prioritizedFiles.length === 0) {
  console.log('\n✅ No complexity violations found!');
  process.exit(0);
}

console.log(`\n🎯 PARETO 80/20 PRIORITIZATION (by severity score):`);
console.log('-'.repeat(80));

prioritizedFiles.forEach((file, index) => {
  const isHighPriority = index < Math.ceil(prioritizedFiles.length * 0.2);
  const priority = isHighPriority ? '🔥 HIGH' : '📋 MEDIUM';

  console.log(`\n${index + 1}. ${priority} PRIORITY - Severity Score: ${file.severityScore}`);
  console.log(`   📁 File: ${file.filePath}`);

  if (file.maxLinesViolation) {
    console.log(
      `   📏 Lines: ${file.maxLinesViolation.current} (limit: ${file.maxLinesViolation.max}, excess: ${file.maxLinesViolation.excess})`,
    );
  }

  console.log(`   ⚠️  Violations (${file.violationCount}):`);
  file.violations.forEach((violation) => {
    console.log(`      - ${violation.ruleId}: ${violation.message} (line ${violation.line})`);
  });
});

console.log(`\n🔧 REFACTORING RECOMMENDATIONS:`);
console.log('-'.repeat(80));

const highPriorityFiles = prioritizedFiles.slice(0, Math.ceil(prioritizedFiles.length * 0.2));
console.log(`\n1. Focus on TOP ${highPriorityFiles.length} files first (80/20 rule):`);
highPriorityFiles.forEach((file, index) => {
  console.log(`   ${index + 1}. ${file.filePath} (Score: ${file.severityScore})`);
});

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
    highPriorityFiles: highPriorityFiles.length,
  },
  prioritizedFiles,
  allViolations: complexityViolations,
};

fs.writeFileSync('complexity-analysis-report.json', JSON.stringify(reportData, null, 2));
console.log(`\n💾 Detailed report saved to: complexity-analysis-report.json`);
