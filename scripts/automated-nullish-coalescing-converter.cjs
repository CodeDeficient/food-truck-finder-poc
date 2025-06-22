#!/usr/bin/env node

/**
 * Automated Nullish Coalescing Converter
 * Safely converts || patterns to ?? for @typescript-eslint/prefer-nullish-coalescing fixes
 *
 * SAFE PATTERNS (auto-convert):
 * - value || defaultValue
 * - data?.field || fallback
 * - array || []
 * - object || {}
 * - string || 'default'
 * - number || 0
 *
 * UNSAFE PATTERNS (manual review needed):
 * - if (condition1 || condition2)
 * - error || !user
 * - boolean || boolean
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

class NullishCoalescingConverter {
  constructor() {
    this.safePatterns = [
      // Simple variable || default patterns
      /(\w+(?:\?\.\w+)*)\s*\|\|\s*(\[|\{|'[^']*'|"[^"]*"|\d+|null|undefined)/g,
      // Property access with fallbacks
      /(\w+(?:\?\.\w+)+)\s*\|\|\s*(\w+|\[|\{|'[^']*'|"[^"]*"|\d+|null|undefined)/g,
      // Function call results with defaults
      /(\w+\([^)]*\)(?:\?\.\w+)*)\s*\|\|\s*(\[|\{|'[^']*'|"[^"]*"|\d+|null|undefined)/g,
      // Array/object access with defaults
      /([\w.]+\[[^\]]+\](?:\?\.\w+)*)\s*\|\|\s*(\[|\{|'[^']*'|"[^"]*"|\d+|null|undefined)/g,
      // Complex property chains
      /([\w.]+(?:\?\.\w+)+)\s*\|\|\s*(\w+)/g,
    ];

    this.unsafePatterns = [
      // Boolean conditions in if statements
      /if\s*\([^)]*\|\|[^)]*\)/gi,
      // While/for conditions
      /(while|for)\s*\([^)]*\|\|[^)]*\)/gi,
      // Error handling patterns
      /(error|err)\s*\|\|\s*!/gi,
      // Boolean variables
      /\b(is|has|can|should|will|was|were)\w*\s*\|\|\s*\b(is|has|can|should|will|was|were)/gi,
      // Return statements with boolean logic
      /return\s+\w+\s*\|\|\s*\w+\s*$/gi,
    ];
    
    this.stats = {
      filesProcessed: 0,
      conversionsApplied: 0,
      unsafePatternsSaved: 0,
      errors: []
    };
  }

  /**
   * Check if a line contains unsafe patterns that should not be auto-converted
   */
  containsUnsafePattern(line) {
    return this.unsafePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Convert safe || patterns to ?? in a single line
   */
  convertLine(line, lineNumber) {
    if (this.containsUnsafePattern(line)) {
      this.stats.unsafePatternsSaved++;
      return { converted: line, changed: false, reason: 'Contains unsafe boolean logic' };
    }

    let convertedLine = line;
    let lineChanged = false;
    let lineConversions = 0;

    for (const pattern of this.safePatterns) {
      // Ensure global flag is reset for stateful regexes if exec is used, not an issue for replace
      convertedLine = convertedLine.replace(pattern, (match, left, right) => {
        lineConversions++;
        lineChanged = true;
        return `${left} ?? ${right}`;
      });
    }

    if (lineChanged) {
      this.stats.conversionsApplied += lineConversions; // Accumulate total conversions
    }

    return { converted: convertedLine, changed: lineChanged, conversions: lineConversions };
  }


  /**
   * Process a single TypeScript/TSX file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fileHasChanges = false;
      const newLines = [];
      let fileTotalConversions = 0;

      for (const [index, line] of lines.entries()) {
        const result = this.convertLine(line, index + 1);
        newLines.push(result.converted);
        if (result.changed) {
          fileHasChanges = true;
          fileTotalConversions += result.conversions;
        }
      }

      if (fileHasChanges) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log(`✅ Updated: ${filePath} (${fileTotalConversions} conversion(s))`);
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
   * Find all TypeScript/TSX files in specified directories
   */
  findTSFiles(directories = ['app', 'components', 'lib', 'hooks']) { // Added hooks
    const files = [];
    const excludedDirs = new Set(['node_modules', '.next', '.git', 'dist', 'build']);
    
    for (const dir of directories) {
      const rootDir = path.resolve(dir);
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
        console.warn(`Directory not found for searching TS files: ${rootDir}`);
      }
    }
    return files;
  }

  /**
   * Get current error count for comparison
   */
  getCurrentErrorCount() {
    try {
      const countScriptPath = path.join(__dirname, 'count-errors.cjs');
      const command = `"${process.execPath}" "${countScriptPath}"`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      const lastLine = lines.pop(); // Get the last line which should be the count
      return Number.parseInt(lastLine) || 0;
    } catch (error) {
      console.warn('Could not get current error count for prefer-nullish-coalescing:');
      if (error.stderr) console.warn('stderr:', error.stderr.toString().trim());
      if (error.stdout) console.warn('stdout:', error.stdout.toString().trim());
      if (error.message && !error.message.includes(error.stdout?.toString()) && !error.message.includes(error.stderr?.toString())) {
        console.warn('message:', error.message);
      }
      return 0; // Default to 0 if count fails
    }
  }

  /**
   * Run the conversion process
   */
  async run(options = {}) {
    const { 
      directories = ['app', 'components', 'lib', 'hooks'], // Added hooks
      dryRun = false,
      maxFiles = null 
    } = options;

    console.info('🚀 Starting Automated Nullish Coalescing Converter');
    console.info('================================================');

    if (dryRun) {
      console.info('🔍 DRY RUN MODE - No files will be modified');
    }

    const initialErrors = this.getCurrentErrorCount();
    console.info(`📊 Initial @typescript-eslint/prefer-nullish-coalescing error count (estimated): ${initialErrors}`);

    const allFiles = this.findTSFiles(directories);
    const filesToProcess = maxFiles ? allFiles.slice(0, maxFiles) : allFiles;

    console.info(`📁 Found ${allFiles.length} TypeScript files (in specified directories)`);
    if (maxFiles) console.info(`🎯 Processing a maximum of ${filesToProcess.length} files`);
    else console.info(`🎯 Processing all ${filesToProcess.length} files`);
    console.info('');

    let filesChangedCount = 0;
    for (const file of filesToProcess) {
      // console.log(`Processing: ${file}`); // Optional: reduce noise
      
      if (dryRun) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            let potentialChangesInFile = 0;
            for (const [index, line] of lines.entries()) {
              const result = this.convertLine(line, index + 1);
              if (result.changed) potentialChangesInFile += result.conversions;
            }
            if (potentialChangesInFile > 0) {
              console.info(`  [DRY RUN] Would make ${potentialChangesInFile} conversion(s) in ${file}`);
              filesChangedCount++;
              // this.stats.conversionsApplied is updated by convertLine, so it's fine for dry run
            }
        } catch (dryRunError) {
            console.error(`❌ Error during dry run for ${file}: ${dryRunError.message}`);
        }
      } else {
        const changed = this.processFile(file); // processFile logs changes and updates stats
        if (changed) filesChangedCount++;
      }
      this.stats.filesProcessed++;
    }

    const finalErrors = dryRun ? initialErrors : this.getCurrentErrorCount();
    const errorReduction = initialErrors > 0 ? initialErrors - finalErrors : 0;
    const percentageReduction = initialErrors > 0 ? ((errorReduction / initialErrors) * 100).toFixed(1) : "0.0";

    console.info('');
    console.info('📈 CONVERSION SUMMARY');
    console.info('====================');
    console.info(`Files processed: ${this.stats.filesProcessed}`);
    console.info(`Files ${dryRun ? 'that would be' : 'actually'} changed: ${filesChangedCount}`);
    console.info(`Total conversions ${dryRun ? 'potentially' : 'actually'} applied: ${this.stats.conversionsApplied}`);
    console.info(`Unsafe patterns preserved (not converted): ${this.stats.unsafePatternsSaved}`);
    console.info(`Errors encountered during processing: ${this.stats.errors.length}`);
    console.info('');
    console.info(`Initial @typescript-eslint/prefer-nullish-coalescing errors: ${initialErrors}`);
    console.info(`Final @typescript-eslint/prefer-nullish-coalescing errors: ${finalErrors}`);
    console.info(`Error reduction for @typescript-eslint/prefer-nullish-coalescing: ${errorReduction} (${percentageReduction}%)`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ DETAILED ERRORS DURING PROCESSING:');
      for (const err of this.stats.errors) {
        console.log(`  File: ${err.file}, Error: ${err.error}`);
      }
    }

    return {
      filesChanged: filesChangedCount,
      conversionsApplied: this.stats.conversionsApplied,
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
  
  const converter = new NullishCoalescingConverter();
  converter.run(options).then(result => {
    console.log(`\nNullish Coalescing Converter ${result.success ? 'completed successfully' : 'completed with errors'}.`);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error during NullishCoalescingConverter execution:', error);
    process.exit(1);
  });
}

module.exports = NullishCoalescingConverter;
