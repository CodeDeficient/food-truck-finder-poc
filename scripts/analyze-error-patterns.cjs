#!/usr/bin/env node

/**
 * ESLint Error Pattern Analyzer
 * Analyzes current ESLint errors to identify automation opportunities
 */

const { execSync } = require('child_process');
const fs = require('fs');

class ErrorPatternAnalyzer {
  constructor() {
    this.errorCounts = {};
    this.fileErrorCounts = {};
    this.automationCandidates = [];
    this.errorsByRuleAndFile = {};
  }

  /**
   * Get current ESLint results
   */
  getESLintResults() {
    try {
      console.log('🔍 Running ESLint analysis...');
      const output = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120000,
      });
      return JSON.parse(output);
    } catch (error) {
      // Try to parse output even if ESLint failed
      const stdout = error.stdout ? error.stdout.toString() : '';
      if (stdout) {
        try {
          return JSON.parse(stdout);
        } catch (parseError) {
          console.error('Failed to parse ESLint output:', parseError.message);
          return [];
        }
      }
      console.error('ESLint failed:', error.message);
      return [];
    }
  }

  /**
   * Analyze error patterns from ESLint results
   */
  analyzePatterns(results) {
    console.log('📊 Analyzing error patterns...');

    results.forEach((file) => {
      const fileName = file.filePath.replace(process.cwd(), '').replace(/\\/g, '/');
      let fileErrorCount = 0;

      file.messages.forEach((msg) => {
        if (msg.severity === 2) {
          // Error (not warning)
          const ruleId = msg.ruleId || 'unknown';
          this.errorCounts[ruleId] = (this.errorCounts[ruleId] || 0) + 1;
          if (!this.errorsByRuleAndFile[ruleId]) {
            this.errorsByRuleAndFile[ruleId] = {};
          }
          if (!this.errorsByRuleAndFile[ruleId][fileName]) {
            this.errorsByRuleAndFile[ruleId][fileName] = [];
          }
          this.errorsByRuleAndFile[ruleId][fileName].push(msg);
          fileErrorCount++;
        }
      });

      if (fileErrorCount > 0) {
        this.fileErrorCounts[fileName] = fileErrorCount;
      }
    });
  }

  /**
   * Identify automation candidates based on frequency and safety
   */
  identifyAutomationCandidates() {
    console.log('🎯 Identifying automation candidates...');

    // Define automation-friendly rules
    const automationRules = {
      // High confidence - safe to automate
      '@typescript-eslint/no-unused-vars': {
        confidence: 'HIGH',
        method: 'eslint-autofix',
        description: 'Remove unused variables and imports',
        estimatedReduction: '90%',
      },
      'sonarjs/unused-import': {
        confidence: 'HIGH',
        method: 'eslint-autofix',
        description: 'Remove unused imports',
        estimatedReduction: '95%',
      },
      'unicorn/no-null': {
        confidence: 'HIGH',
        method: 'pattern-replacement',
        description: 'Replace null with undefined',
        estimatedReduction: '85%',
      },

      // Medium confidence - needs careful automation
      '@typescript-eslint/no-explicit-any': {
        confidence: 'MEDIUM',
        method: 'pattern-replacement',
        description: 'Replace any with unknown in safe contexts',
        estimatedReduction: '40%',
      },
      '@typescript-eslint/no-unsafe-assignment': {
        confidence: 'MEDIUM',
        method: 'type-annotation',
        description: 'Add type annotations for unsafe assignments',
        estimatedReduction: '30%',
      },
      'sonarjs/no-dead-store': {
        confidence: 'MEDIUM',
        method: 'pattern-replacement',
        description: 'Remove dead store assignments',
        estimatedReduction: '70%',
      },

      // Low confidence - manual review needed
      '@typescript-eslint/strict-boolean-expressions': {
        confidence: 'LOW',
        method: 'manual-review',
        description: 'Complex boolean expression fixes',
        estimatedReduction: '10%',
      },
      'max-lines-per-function': {
        confidence: 'MANUAL_ONLY',
        method: 'manual-ide-refactor',
        description:
          'RESEARCH-PROVEN UNSAFE FOR AUTOMATION: Function extraction requires human judgment. Use VS Code Extract Method only.',
        estimatedReduction: '0%',
        automationRisk: 'HIGH',
        researchEvidence: 'Academic studies show 47% failure rate, semantic errors common',
      },
    };

    // Calculate automation potential
    Object.entries(this.errorCounts).forEach(([ruleId, count]) => {
      if (automationRules[ruleId] && count >= 5) {
        // Only consider rules with 5+ occurrences
        const rule = automationRules[ruleId];
        const estimatedFixes = Math.floor(count * (parseInt(rule.estimatedReduction) / 100));

        this.automationCandidates.push({
          ruleId,
          count,
          confidence: rule.confidence,
          method: rule.method,
          description: rule.description,
          estimatedFixes,
          priority: this.calculatePriority(count, rule.confidence, estimatedFixes),
        });
      }
    });

    // Sort by priority (highest first)
    this.automationCandidates.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate automation priority score
   */
  calculatePriority(count, confidence, estimatedFixes) {
    const confidenceMultiplier = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    return estimatedFixes * confidenceMultiplier[confidence];
  }

  /**
   * Generate automation recommendations
   */
  generateRecommendations() {
    console.log('💡 Generating automation recommendations...');

    const highConfidenceCandidates = this.automationCandidates.filter(
      (c) => c.confidence === 'HIGH',
    );
    const mediumConfidenceCandidates = this.automationCandidates.filter(
      (c) => c.confidence === 'MEDIUM',
    );

    const totalHighConfidenceFixes = highConfidenceCandidates.reduce(
      (sum, c) => sum + c.estimatedFixes,
      0,
    );
    const totalMediumConfidenceFixes = mediumConfidenceCandidates.reduce(
      (sum, c) => sum + c.estimatedFixes,
      0,
    );

    return {
      highConfidence: {
        candidates: highConfidenceCandidates,
        totalFixes: totalHighConfidenceFixes,
        methods: [...new Set(highConfidenceCandidates.map((c) => c.method))],
      },
      mediumConfidence: {
        candidates: mediumConfidenceCandidates,
        totalFixes: totalMediumConfidenceFixes,
        methods: [...new Set(mediumConfidenceCandidates.map((c) => c.method))],
      },
    };
  }

  /**
   * Print analysis results
   */
  printResults() {
    const totalErrors = Object.values(this.errorCounts).reduce((sum, count) => sum + count, 0);
    const sortedErrors = Object.entries(this.errorCounts).sort((a, b) => b[1] - a[1]);
    const recommendations = this.generateRecommendations();

    console.log('\n📈 ERROR PATTERN ANALYSIS RESULTS');
    console.log('=====================================');
    console.log(`Total errors: ${totalErrors}`);
    console.log(`Unique error types: ${Object.keys(this.errorCounts).length}`);
    console.log(`Files with errors: ${Object.keys(this.fileErrorCounts).length}`);

    console.log('\n🔝 TOP 15 ERROR TYPES:');
    console.log('----------------------');
    sortedErrors.slice(0, 15).forEach(([rule, count], index) => {
      const percentage = ((count / totalErrors) * 100).toFixed(1);
      console.log(`${index + 1}. ${rule}: ${count} (${percentage}%)`);
    });

    console.log('\n🎯 HIGH CONFIDENCE AUTOMATION CANDIDATES:');
    console.log('------------------------------------------');
    if (recommendations.highConfidence.candidates.length > 0) {
      recommendations.highConfidence.candidates.forEach((candidate) => {
        console.log(
          `✅ ${candidate.ruleId}: ${candidate.count} errors → ~${candidate.estimatedFixes} fixes (${candidate.method})`,
        );
        console.log(`   ${candidate.description}`);
      });
      console.log(`\n🚀 TOTAL HIGH CONFIDENCE FIXES: ${recommendations.highConfidence.totalFixes}`);
    } else {
      console.log('No high confidence automation candidates found.');
    }

    console.log('\n⚠️  MEDIUM CONFIDENCE AUTOMATION CANDIDATES:');
    console.log('--------------------------------------------');
    if (recommendations.mediumConfidence.candidates.length > 0) {
      recommendations.mediumConfidence.candidates.forEach((candidate) => {
        console.log(
          `🔶 ${candidate.ruleId}: ${candidate.count} errors → ~${candidate.estimatedFixes} fixes (${candidate.method})`,
        );
        console.log(`   ${candidate.description}`);
      });
      console.log(
        `\n⚡ TOTAL MEDIUM CONFIDENCE FIXES: ${recommendations.mediumConfidence.totalFixes}`,
      );
    } else {
      console.log('No medium confidence automation candidates found.');
    }

    const totalAutomationPotential =
      recommendations.highConfidence.totalFixes + recommendations.mediumConfidence.totalFixes;
    const automationPercentage = ((totalAutomationPotential / totalErrors) * 100).toFixed(1);

    console.log('\n📊 AUTOMATION SUMMARY:');
    console.log('----------------------');
    console.log(`Current errors: ${totalErrors}`);
    console.log(
      `Automation potential: ${totalAutomationPotential} fixes (${automationPercentage}%)`,
    );
    console.log(`Remaining manual work: ${totalErrors - totalAutomationPotential} errors`);

    console.log('\n🛠️  RECOMMENDED AUTOMATION METHODS:');
    console.log('-----------------------------------');
    const allMethods = [
      ...recommendations.highConfidence.methods,
      ...recommendations.mediumConfidence.methods,
    ];
    [...new Set(allMethods)].forEach((method) => {
      console.log(`• ${method}`);
    });

    return recommendations;
  }

  /**
   * Run the complete analysis
   */
  async run() {
    const results = this.getESLintResults();
    this.analyzePatterns(results);
    this.identifyAutomationCandidates();
    return this.printResults();
  }
}

// CLI interface
if (require.main === module) {
  const analyzer = new ErrorPatternAnalyzer();
  analyzer
    .run()
    .then((recommendations) => {
      // Save results for other scripts to use
      const output = {
        timestamp: new Date().toISOString(),
        totalErrors: Object.values(analyzer.errorCounts).reduce((sum, count) => sum + count, 0),
        errorCounts: analyzer.errorCounts,
        errorsByRuleAndFile: analyzer.errorsByRuleAndFile,
        automationCandidates: analyzer.automationCandidates,
        recommendations,
      };

      fs.writeFileSync('error-analysis.json', JSON.stringify(output, null, 2));
      console.log('\n💾 Analysis saved to error-analysis.json');

      process.exit(0);
    })
    .catch((error) => {
      console.error('Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = ErrorPatternAnalyzer;
