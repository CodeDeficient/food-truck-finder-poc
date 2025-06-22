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

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

class AsyncFunctionCleaner {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      asyncKeywordsRemoved: 0,
      errors: []
    };
  }

  /**
   * Get current error count
   */
  getCurrentErrorCount() {
    try {
      const countScriptPath = path.join(__dirname, 'count-errors.cjs');
      // Use process.execPath for the current node executable
      // Ensure paths with spaces are quoted for execSync
      const command = `"${process.execPath}" "${countScriptPath}"`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      // Assuming the last line of count-errors.cjs output is the count
      const lastLine = lines.pop();
      return Number.parseInt(lastLine) || 0;
    } catch (error) {
      console.warn('Could not get current error count:');
      if (error.stderr) console.warn('stderr:', error.stderr.toString().trim());
      if (error.stdout) console.warn('stdout:', error.stdout.toString().trim());
      // error.message often includes stdout/stderr, so log it if distinct
      if (error.message && !error.message.includes(error.stdout?.toString()) && !error.message.includes(error.stderr?.toString())) {
        console.warn('message:', error.message);
      }
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
    let fixedContent = content;
    let changesMade = 0;

    // Pattern 1: async function declarations
    // async function foo(...) { ... }
    const functionPattern = /async\s+(function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{(?:[^{}]*|\{[^{}]*\})*\})/g;
    fixedContent = fixedContent.replace(functionPattern, (match, functionDef) => {
      if (!this.hasAwaitExpressions(functionDef)) {
        changesMade++;
        return functionDef; // Remove 'async ' part
      }
      return match; // Keep original
    });

    // Pattern 2: async arrow functions
    // const foo = async (...) => { ... } or async (...) => { ... }
    // Handles: async (params) => { body }, async params => { body } (though less common for block)
    const arrowPattern = /async\s+(?:\(\s*([^)]*?)\s*\)\s*=>|([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>)\s*(\{((?:[^{}]*|\{[^{}]*\})*)\})/g;
    fixedContent = fixedContent.replace(arrowPattern, (match, paramsParen, paramsDirect, bodyWithBraces, bodyContent) => {
      const functionBody = bodyWithBraces || `{${bodyContent}}`; // Reconstruct body if needed
      if (!this.hasAwaitExpressions(functionBody)) {
        changesMade++;
        // Reconstruct without async: (paramsParen || paramsDirect) represents the parameters part
        const paramsPart = paramsParen !== undefined ? `(${paramsParen})` : paramsDirect;
        return `${paramsPart} => ${functionBody}`;
      }
      return match;
    });

    // Pattern 3: async methods in classes/objects
    // async myMethod(...) { ... } or myProp: async function(...) { ... }
    const methodPattern = /async\s+([a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*\{(?:[^{}]*|\{[^{}]*\})*\})/g;
     // Also consider object properties like: myKey: async function() {}
    const objectMethodPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*\s*:\s*)async\s+(function\s*\([^)]*\)\s*\{(?:[^{}]*|\{[^{}]*\})*\})/g;

    fixedContent = fixedContent.replace(methodPattern, (match, methodDef) => {
      if (!this.hasAwaitExpressions(methodDef)) {
        changesMade++;
        return methodDef; // Remove 'async '
      }
      return match;
    });

    fixedContent = fixedContent.replace(objectMethodPattern, (match, keyPart, methodDef) => {
        if (!this.hasAwaitExpressions(methodDef)) {
          changesMade++;
          return keyPart + methodDef; // Remove 'async '
        }
        return match;
      });

    return { fixed: fixedContent, changes: changesMade };
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
        // console.log(`⏭️  No changes: ${filePath}`); // Optional: reduce noise
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
  findTSFiles(directories = ['app', 'components', 'lib', 'hooks']) { // Added hooks
    const files = [];
    const excludedDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build']); // Common exclusions
    
    for (const dir of directories) {
      const rootDir = path.resolve(dir); // Ensure we start from an absolute path
      if (fs.existsSync(rootDir)) {
        const findFilesRecursive = (currentDir) => {
          try {
            const items = fs.readdirSync(currentDir);
            for (const item of items) {
              const fullPath = path.join(currentDir, item);
              if (excludedDirs.has(item) && fs.statSync(fullPath).isDirectory()) {
                continue;
              }
              const stat = fs.statSync(fullPath);

              if (stat.isDirectory()) {
                findFilesRecursive(fullPath);
              } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
                files.push(fullPath.replaceAll('\\', '/'));
              }
            }
          } catch (readDirError) {
            console.warn(`Could not read directory ${currentDir}: ${readDirError.message}`);
          }
        };
        findFilesRecursive(rootDir);
      } else {
        console.warn(`Directory not found: ${rootDir}`);
      }
    }
    
    return files;
  }

  /**
   * Run the async function cleaning process
   */
  async run(options = {}) {
    const { 
      maxFiles = null,
      dryRun = false 
    } = options;

    console.log('🚀 Starting Async Function Cleaning');
    console.log('===================================');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    const initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial @typescript-eslint/require-await error count (estimated): ${initialErrors}`);

    const allFiles = this.findTSFiles();
    const filesToProcess = maxFiles ? allFiles.slice(0, maxFiles) : allFiles;
    
    console.log(`📁 Found ${allFiles.length} TypeScript files (in app, components, lib, hooks)`);
    if (maxFiles) console.log(`🎯 Processing a maximum of ${filesToProcess.length} files`);
    else console.log(`🎯 Processing all ${filesToProcess.length} files`);
    console.log('');

    let filesChangedCount = 0;
    for (const file of filesToProcess) {
      // console.log(`Processing: ${file}`); // Optional: reduce noise
      
      if (dryRun) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const result = this.fixAsyncFunctions(content);
            if (result.changes > 0) {
              console.log(`  [DRY RUN] Would remove ${result.changes} async keyword(s) from ${file}`);
              filesChangedCount++;
              this.stats.asyncKeywordsRemoved += result.changes;
            }
        } catch (dryRunError) {
            console.error(`❌ Error during dry run for ${file}: ${dryRunError.message}`);
        }
      } else {
        const changed = this.processFile(file); // processFile logs changes
        if (changed) filesChangedCount++;
      }
      this.stats.filesProcessed++;
    }

    const finalErrors = dryRun ? initialErrors : this.getCurrentErrorCount();
    const errorReduction = initialErrors > 0 ? initialErrors - finalErrors : 0; // Avoid NaN if initialErrors is 0
    const percentageReduction = initialErrors > 0 ? ((errorReduction / initialErrors) * 100).toFixed(1) : "0.0";


    console.log('');
    console.log('📈 ASYNC FUNCTION CLEANING SUMMARY');
    console.log('==================================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files ${dryRun ? 'that would be' : 'actually'} changed: ${filesChangedCount}`);
    console.log(`Async keywords ${dryRun ? 'that would be' : 'actually'} removed: ${this.stats.asyncKeywordsRemoved}`);
    console.log(`Errors encountered during processing: ${this.stats.errors.length}`);
    console.log('');
    console.log(`Initial @typescript-eslint/require-await errors: ${initialErrors}`);
    console.log(`Final @typescript-eslint/require-await errors: ${finalErrors}`);
    console.log(`Error reduction for @typescript-eslint/require-await: ${errorReduction} (${percentageReduction}%)`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ DETAILED ERRORS DURING PROCESSING:');
      for (const err of this.stats.errors) {
        console.log(`  File: ${err.file}, Error: ${err.error}`);
      }
    }

    return {
      filesChanged: filesChangedCount,
      asyncKeywordsRemoved: this.stats.asyncKeywordsRemoved,
      errorReduction,
      success: this.stats.errors.length === 0
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  if (args.includes('--dry-run')) options.dryRun = true;
  const maxFilesIndex = args.indexOf('--max-files');
  if (maxFilesIndex !== -1 && args[maxFilesIndex + 1]) {
    options.maxFiles = Number.parseInt(args[maxFilesIndex + 1]);
    if (isNaN(options.maxFiles)) {
        console.error("Invalid value for --max-files. Must be a number.");
        process.exit(1);
    }
  }
  
  const cleaner = new AsyncFunctionCleaner();
  cleaner.run(options).then(result => {
    console.log(`\nAsync Function Cleaner ${result.success ? 'completed successfully' : 'completed with errors'}.`);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error during AsyncFunctionCleaner execution:', error);
    process.exit(1);
  });
}

module.exports = AsyncFunctionCleaner;
