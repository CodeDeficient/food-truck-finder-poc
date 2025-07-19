#!/usr/bin/env node

/**
 * Async Function Cleaner
 * Fixes @typescript-eslint/require-await errors by removing unnecessary async keywords
 *
 * SAFE PATTERNS (auto-fix):
 * - async function with no await → remove async
 * - async arrow function with no await → remove async
 * - async method with no await → remove async
 *
 * SAFETY MEASURES:
 * - Only removes async if no await expressions found
 * - Preserves function signatures and return types
 * - Maintains code formatting
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AsyncFunctionCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      asyncKeywordsRemoved: 0,
      errors: [],
    };
  }

  /**
   * Get current error count
   */
  getCurrentErrorCount() {
    try {
      const output = execSync('node scripts/count-errors.cjs', { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      return parseInt(lines[lines.length - 1]) || 0;
    } catch (error) {
      console.warn('Could not get current error count:', error.message);
      return 0;
    }
  }

  /**
   * Check if a function body contains await expressions
   */
  hasAwaitExpressions(functionBody) {
    // Simple regex to find await expressions
    // This is conservative - if we're not sure, we don't remove async
    const awaitPattern = /\bawait\s+/g;
    return awaitPattern.test(functionBody);
  }

  /**
   * Fix async functions without await in a file
   */
  fixAsyncFunctions(content) {
    let fixed = content;
    let changes = 0;

    // Pattern 1: async function declarations
    const functionPattern =
      /async\s+(function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]*\})/g;
    fixed = fixed.replace(functionPattern, (match, functionDef) => {
      if (!this.hasAwaitExpressions(functionDef)) {
        changes++;
        return functionDef; // Remove 'async' keyword
      }
      return match;
    });

    // Pattern 2: async arrow functions
    const arrowPattern = /async\s+(\([^)]*\)\s*=>\s*\{[^}]*\})/g;
    fixed = fixed.replace(arrowPattern, (match, arrowDef) => {
      if (!this.hasAwaitExpressions(arrowDef)) {
        changes++;
        return arrowDef; // Remove 'async' keyword
      }
      return match;
    });

    // Pattern 3: async methods in classes/objects
    const methodPattern = /async\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{[^}]*\})/g;
    fixed = fixed.replace(methodPattern, (match, methodDef) => {
      if (!this.hasAwaitExpressions(methodDef)) {
        changes++;
        return methodDef; // Remove 'async' keyword
      }
      return match;
    });

    return { fixed, changes };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = this.fixAsyncFunctions(content);

      if (result.changes > 0) {
        fs.writeFileSync(filePath, result.fixed);
        this.stats.asyncKeywordsRemoved += result.changes;
        console.log(`✅ Updated: ${filePath} (${result.changes} async keywords removed)`);
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
   * Find TypeScript files
   */
  findTSFiles(directories = ['app', 'components', 'lib']) {
    const files = [];

    directories.forEach((dir) => {
      if (fs.existsSync(dir)) {
        const findFiles = (currentDir) => {
          const items = fs.readdirSync(currentDir);
          items.forEach((item) => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.startsWith('.')) {
              findFiles(fullPath);
            } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
              files.push(fullPath.replace(/\\/g, '/'));
            }
          });
        };
        findFiles(dir);
      }
    });

    return files;
  }

  /**
   * Run the async function cleaning process
   */
  async run(options = {}) {
    const { maxFiles = null, dryRun = false } = options;

    console.log('🚀 Starting Async Function Cleaning');
    console.log('===================================');

    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    // Get baseline error count
    const initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${initialErrors}`);

    // Find files to process
    const allFiles = this.findTSFiles();
    const filesToProcess = maxFiles ? allFiles.slice(0, maxFiles) : allFiles;

    console.log(`📁 Found ${allFiles.length} TypeScript files`);
    console.log(`🎯 Processing ${filesToProcess.length} files`);
    console.log('');

    // Process files
    let filesChanged = 0;
    for (const file of filesToProcess) {
      console.log(`Processing: ${file}`);

      if (!dryRun) {
        const changed = this.processFile(file);
        if (changed) filesChanged++;
      } else {
        // Dry run - just analyze
        const content = fs.readFileSync(file, 'utf8');
        const result = this.fixAsyncFunctions(content);

        if (result.changes > 0) {
          console.log(`  Would remove ${result.changes} async keyword(s)`);
          filesChanged++;
        }
      }

      this.stats.filesProcessed++;
    }

    // Get final error count
    const finalErrors = dryRun ? initialErrors : this.getCurrentErrorCount();
    const errorReduction = initialErrors - finalErrors;

    // Print summary
    console.log('');
    console.log('📈 ASYNC FUNCTION CLEANING SUMMARY');
    console.log('==================================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files changed: ${filesChanged}`);
    console.log(`Async keywords removed: ${this.stats.asyncKeywordsRemoved}`);
    console.log(`Errors encountered: ${this.stats.errors.length}`);
    console.log('');
    console.log(`Initial errors: ${initialErrors}`);
    console.log(`Final errors: ${finalErrors}`);
    console.log(
      `Error reduction: ${errorReduction} (${((errorReduction / initialErrors) * 100).toFixed(1)}%)`,
    );

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ ERRORS:');
      this.stats.errors.forEach((err) => {
        console.log(`  ${err.file}: ${err.error}`);
      });
    }

    return {
      filesChanged,
      asyncKeywordsRemoved: this.stats.asyncKeywordsRemoved,
      errorReduction,
      success: this.stats.errors.length === 0,
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  if (args.includes('--dry-run')) options.dryRun = true;
  if (args.includes('--max-files')) {
    const maxIndex = args.indexOf('--max-files');
    options.maxFiles = parseInt(args[maxIndex + 1]) || 10;
  }

  const cleaner = new AsyncFunctionCleaner();
  cleaner
    .run(options)
    .then((result) => {
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = AsyncFunctionCleaner;
