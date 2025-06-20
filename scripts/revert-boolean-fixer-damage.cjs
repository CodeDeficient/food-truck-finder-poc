#!/usr/bin/env node

/**
 * Revert Boolean Fixer Damage
 * Fixes the malformed expressions created by the targeted-boolean-expression-fixer.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

class BooleanFixerReverter {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      fixesApplied: 0,
      errors: []
    };
  }

  /**
   * Get current error count
   */
  getCurrentErrorCount() {
    try {
      const output = execSync('node scripts/count-errors.cjs', { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      return Number.parseInt(lines.at(-1)) || 0;
    } catch (error) {
      console.warn('Could not get current error count:', error.message);
      return 0;
    }
  }

  /**
   * Fix malformed boolean expressions in a line
   */
  fixMalformedExpressions(line) {
    let fixed = line;
    let changes = 0;

    // Pattern 1: Fix instanceof expressions
    // "error instanceof Error != null" → "error instanceof Error"
    const instanceofPattern = /(\w+\s+instanceof\s+\w+)\s*!=\s*null/g;
    fixed = fixed.replaceAll(instanceofPattern, (match, instanceofExpr) => {
      changes++;
      return instanceofExpr;
    });

    // Pattern 2: Fix boolean ternary expressions
    // "booleanVar != null ? a : b" → "booleanVar ? a : b" (for known boolean patterns)
    const booleanTernaryPattern = /(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*\?\s*([^:]+)\s*:\s*([^;,}]+)/g;
    fixed = fixed.replaceAll(booleanTernaryPattern, (match, booleanVar, trueExpr, falseExpr) => {
      changes++;
      return `${booleanVar} ? ${trueExpr} : ${falseExpr}`;
    });

    // Pattern 3: Fix boolean if conditions
    // "if (booleanVar != null)" → "if (booleanVar)"
    const booleanIfPattern = /if\s*\(\s*(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*\)/g;
    fixed = fixed.replaceAll(booleanIfPattern, (match, booleanVar) => {
      changes++;
      return `if (${booleanVar})`;
    });

    // Pattern 4: Fix boolean && expressions
    // "booleanVar != null &&" → "booleanVar &&"
    const booleanAndPattern = /(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*&&/g;
    fixed = fixed.replaceAll(booleanAndPattern, (match, booleanVar) => {
      changes++;
      return `${booleanVar} &&`;
    });

    // Pattern 5: Fix specific known patterns that should be nullable checks
    // Keep these as != null for actual nullable values like dates, objects, etc.
    // But fix the malformed ones where the property access was broken

    return { fixed, changes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let hasChanges = false;
      const results = [];

      for (const [index, line] of lines.entries()) {
        const result = this.fixMalformedExpressions(line);
        results.push(result.fixed);
        if (result.changes > 0) {
          hasChanges = true;
          this.stats.fixesApplied += result.changes;
          console.log(`  Line ${index + 1}: ${result.changes} fix(es)`);
        }
      }

      if (hasChanges) {
        fs.writeFileSync(filePath, results.join('\n'));
        console.log(`✅ Updated: ${filePath}`);
        return true;
      } else {
        console.log(`⏭️  No changes: ${filePath}`);
        return false;
      }
    } catch (error) {
      this.stats.errors.push({ file: filePath, error: error.message });
      console.error(`❌ Error processing ${filePath}: ${error.message}`);
      return false;
    }
  }

  /**
   * Find files with malformed patterns
   */
  findFilesWithMalformedPatterns() {
    try {
      // Use PowerShell to find files with the malformed patterns
      const output = execSync(String.raw`Get-ChildItem -Path . -Include "*.ts", "*.tsx" -Recurse | Select-String "!= null \?" | Select-Object -ExpandProperty Filename | Sort-Object | Get-Unique`, {
        encoding: 'utf8',
        shell: 'powershell'
      });
      
      return output.trim().split('\n').filter(file => file.trim()).map(file => file.trim());
    } catch {
      console.warn('Could not find files with malformed patterns, using fallback');
      // Fallback to known affected files
      return [
        'app/admin/auto-scraping/page.tsx',
        'app/admin/events/page.tsx', 
        'app/admin/food-trucks/[id]/page.tsx',
        'app/admin/pipeline/page.tsx',
        'app/admin/test-pipeline/page.tsx',
        'app/api/admin/automated-cleanup/route.ts',
        'app/api/admin/data-cleanup/route.ts',
        'app/api/admin/data-quality/route.ts'
      ];
    }
  }

  /**
   * Run the reversion process
   */
  async run() {
    console.log('🔄 Starting Boolean Fixer Damage Reversion');
    console.log('==========================================');

    // Get baseline error count
    const initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${initialErrors}`);

    // Find files to process
    const filesToProcess = this.findFilesWithMalformedPatterns();
    
    console.log(`📁 Found ${filesToProcess.length} files to check`);
    console.log('');

    // Process files
    let filesChanged = 0;
    for (const file of filesToProcess) {
      if (fs.existsSync(file)) {
        console.log(`Processing: ${file}`);
        const changed = this.processFile(file);
        if (changed) filesChanged++;
        this.stats.filesProcessed++;
      }
    }

    // Get final error count
    const finalErrors = this.getCurrentErrorCount();
    const errorReduction = initialErrors - finalErrors;

    // Print summary
    console.log('');
    console.log('📈 REVERSION SUMMARY');
    console.log('===================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files changed: ${filesChanged}`);
    console.log(`Fixes applied: ${this.stats.fixesApplied}`);
    console.log(`Errors encountered: ${this.stats.errors.length}`);
    console.log('');
    console.log(`Initial errors: ${initialErrors}`);
    console.log(`Final errors: ${finalErrors}`);
    console.log(`Error reduction: ${errorReduction} (${((errorReduction/initialErrors)*100).toFixed(1)}%)`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ ERRORS:');
      for (const err of this.stats.errors) {
        console.log(`  ${err.file}: ${err.error}`);
      }
    }

    return {
      filesChanged,
      fixesApplied: this.stats.fixesApplied,
      errorReduction,
      success: this.stats.errors.length === 0
    };
  }
}

// CLI interface
if (require.main === module) {
  const reverter = new BooleanFixerReverter();
  reverter.run().then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = BooleanFixerReverter;
