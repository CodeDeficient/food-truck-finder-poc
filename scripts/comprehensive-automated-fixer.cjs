#!/usr/bin/env node

/**
 * Comprehensive Automated Fixer
 * Targets multiple high-impact, safe-to-automate ESLint error patterns
 * 
 * AUTOMATION TARGETS (in priority order):
 * 1. ESLint auto-fixable rules (highest safety)
 * 2. Remaining || → ?? conversions  
 * 3. null → undefined conversions
 * 4. Unused import removal
 * 5. Simple type safety improvements
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

class ComprehensiveAutomatedFixer {
  constructor() {
    this.stats = {
      initialErrors: 0,
      finalErrors: 0,
      eslintAutoFixes: 0,
      nullishCoalescingFixes: 0,
      nullUndefinedFixes: 0,
      unusedImportFixes: 0,
      totalFilesProcessed: 0,
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
   * Step 1: Run ESLint auto-fix for safe rules
   */
  runESLintAutoFix() {
    console.log('🔧 Step 1: Running ESLint auto-fix...');
    
    try {
      // Run auto-fix with specific safe rules
      execSync('npx eslint . --fix --quiet', {
        stdio: 'pipe',
        timeout: 120_000
      });
      
      console.log('✅ ESLint auto-fix completed');
      return true;
    } catch {
      console.warn('⚠️  ESLint auto-fix had issues (expected with many errors)');
      return true; // Continue anyway, auto-fix often "fails" but still fixes things
    }
  }

  /**
   * Step 2: Fix remaining || → ?? patterns
   */
  fixRemainingNullishCoalescing() {
    console.log('🔄 Step 2: Fixing remaining || → ?? patterns...');
    
    try {
      // Use our proven nullish coalescing converter
      const result = execSync('node scripts/automated-nullish-coalescing-converter.cjs', {
        encoding: 'utf8',
        timeout: 120_000
      });
      
      // Extract conversion count from output
      const lines = result.split('\n');
      const conversionLine = lines.find(line => line.includes('Total conversions:'));
      if (conversionLine) {
        const match = conversionLine.match(/Total conversions: (\d+)/);
        if (match) {
          this.stats.nullishCoalescingFixes = Number.parseInt(match[1]);
        }
      }
      
      console.log(`✅ Nullish coalescing fixes: ${this.stats.nullishCoalescingFixes}`);
      return true;
    } catch (error) {
      console.warn('⚠️  Nullish coalescing fixes had issues:', error.message);
      return false;
    }
  }

  /**
   * Step 3: Fix null → undefined patterns
   */
  fixNullToUndefined() {
    console.log('🔄 Step 3: Converting null → undefined...');
    
    const files = this.findTSFiles();
    let fixCount = 0;
    
    for (const filePath of files) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        let modified = content;
        
        // Safe null → undefined patterns
        const patterns = [
          // Variable assignments
          { from: /:\s*null(?=\s*[,;}\]])/g, to: ': undefined' },
          // Return statements
          { from: /return\s+null(?=\s*[;}])/g, to: 'return undefined' },
          // Default parameters
          { from: /=\s*null(?=\s*[,)])/g, to: '= undefined' },
          // Object properties
          { from: /:\s*null(?=\s*[,}])/g, to: ': undefined' }
        ];
        
        for (const pattern of patterns) {
          const matches = modified.match(pattern.from);
          if (matches) {
            modified = modified.replace(pattern.from, pattern.to);
            fixCount += matches.length;
          }
        }
        
        if (modified !== content) {
          fs.writeFileSync(filePath, modified);
        }
      } catch (error) {
        console.warn(`Error processing ${filePath}:`, error.message);
      }
    }
    
    this.stats.nullUndefinedFixes = fixCount;
    console.log(`✅ Null → undefined fixes: ${fixCount}`);
    return true;
  }

  /**
   * Step 4: Remove unused imports using ESLint
   */
  removeUnusedImports() {
    console.log('🗑️  Step 4: Removing unused imports...');
    
    try {
      // Target specific unused import rules
      execSync('npx eslint . --fix --rule "sonarjs/unused-import: error" --quiet', {
        stdio: 'pipe',
        timeout: 120_000
      });
      
      console.log('✅ Unused import removal completed');
      return true;
    } catch {
      console.warn('⚠️  Unused import removal had issues (expected)');
      return true; // Continue anyway
    }
  }

  /**
   * Find all TypeScript files
   */
  findTSFiles() {
    const files = [];
    const directories = ['app', 'components', 'lib'];
    
    for (const dir of directories) {
      if (fs.existsSync(dir)) {
        const findFiles = (currentDir) => {
          const items = fs.readdirSync(currentDir);
          for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.')) {
              findFiles(fullPath);
            } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
              files.push(fullPath);
            }
          }
        };
        findFiles(dir);
      }
    }
    
    return files;
  }

  /**
   * Verify TypeScript compilation
   */
  verifyCompilation() {
    console.log('🔍 Verifying TypeScript compilation...');
    
    try {
      execSync('npx tsc --noEmit --strict', {
        stdio: 'pipe',
        timeout: 120_000
      });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch {
      console.warn('⚠️  TypeScript compilation has issues (may be expected)');
      return false;
    }
  }

  /**
   * Run the complete automated fixing process
   */
  async run(options = {}) {
    const { 
      skipESLintFix = false,
      skipNullishCoalescing = false,
      skipNullUndefined = false,
      skipUnusedImports = false,
      verifyCompilation = false
    } = options;

    console.log('🚀 Starting Comprehensive Automated Fixing');
    console.log('==========================================');

    // Get baseline
    this.stats.initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${this.stats.initialErrors}`);

    try {
      // Step 1: ESLint auto-fix
      if (!skipESLintFix) {
        this.runESLintAutoFix();
        const afterESLint = this.getCurrentErrorCount();
        this.stats.eslintAutoFixes = this.stats.initialErrors - afterESLint;
        console.log(`📉 After ESLint auto-fix: ${afterESLint} (${this.stats.eslintAutoFixes} fixed)`);
      }

      // Step 2: Nullish coalescing
      if (!skipNullishCoalescing) {
        this.fixRemainingNullishCoalescing();
        const afterNullish = this.getCurrentErrorCount();
        console.log(`📉 After nullish coalescing: ${afterNullish}`);
      }

      // Step 3: Null → undefined
      if (!skipNullUndefined) {
        this.fixNullToUndefined();
        const afterNull = this.getCurrentErrorCount();
        console.log(`📉 After null → undefined: ${afterNull}`);
      }

      // Step 4: Unused imports
      if (!skipUnusedImports) {
        this.removeUnusedImports();
        const afterImports = this.getCurrentErrorCount();
        console.log(`📉 After unused imports: ${afterImports}`);
      }

      // Final verification
      if (verifyCompilation) {
        this.verifyCompilation();
      }

      // Get final metrics
      this.stats.finalErrors = this.getCurrentErrorCount();
      const totalReduction = this.stats.initialErrors - this.stats.finalErrors;
      const reductionPercentage = ((totalReduction / this.stats.initialErrors) * 100).toFixed(1);

      // Print comprehensive results
      console.log('\n📈 COMPREHENSIVE AUTOMATION RESULTS');
      console.log('===================================');
      console.log(`Initial errors: ${this.stats.initialErrors}`);
      console.log(`Final errors: ${this.stats.finalErrors}`);
      console.log(`Total reduction: ${totalReduction} (${reductionPercentage}%)`);
      console.log('');
      console.log('BREAKDOWN BY AUTOMATION TYPE:');
      console.log(`• ESLint auto-fixes: ${this.stats.eslintAutoFixes}`);
      console.log(`• Nullish coalescing (|| → ??): ${this.stats.nullishCoalescingFixes}`);
      console.log(`• Null → undefined: ${this.stats.nullUndefinedFixes}`);
      console.log(`• Unused imports: estimated from ESLint`);
      
      // Calculate remaining work
      const remainingToTarget = Math.max(0, this.stats.finalErrors - 200); // Phase 1 target
      console.log('');
      console.log(`🎯 PHASE 1 PROGRESS:`);
      console.log(`Target: 200 errors`);
      console.log(`Current: ${this.stats.finalErrors} errors`);
      console.log(`Remaining: ${remainingToTarget} errors to target`);
      
      if (this.stats.finalErrors <= 200) {
        console.log('🎉 PHASE 1 TARGET ACHIEVED!');
      } else {
        const progressPercentage = ((1333 - this.stats.finalErrors) / (1333 - 200) * 100).toFixed(1);
        console.log(`Progress: ${progressPercentage}% toward Phase 1 target`);
      }

      return {
        success: true,
        initialErrors: this.stats.initialErrors,
        finalErrors: this.stats.finalErrors,
        totalReduction,
        reductionPercentage: Number.parseFloat(reductionPercentage),
        phase1Complete: this.stats.finalErrors <= 200
      };

    } catch (error) {
      console.error('\n❌ Comprehensive automation failed:', error.message);
      return {
        success: false,
        error: error.message,
        finalErrors: this.stats.finalErrors || this.stats.initialErrors
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  const options = {};
  
  // Parse command line arguments
  if (args.has('--skip-eslint')) options.skipESLintFix = true;
  if (args.has('--skip-nullish')) options.skipNullishCoalescing = true;
  if (args.has('--skip-null')) options.skipNullUndefined = true;
  if (args.has('--skip-imports')) options.skipUnusedImports = true;
  if (args.has('--verify')) options.verifyCompilation = true;
  
  const fixer = new ComprehensiveAutomatedFixer();
  fixer.run(options).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveAutomatedFixer;
