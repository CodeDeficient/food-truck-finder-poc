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

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

    let converted = line;
    let changed = false;
    let conversions = 0;

    // Apply safe pattern conversions
    this.safePatterns.forEach(pattern => {
      const matches = converted.match(pattern);
      if (matches) {
        converted = converted.replace(pattern, (match, left, right) => {
          conversions++;
          return `${left} ?? ${right}`;
        });
        changed = true;
      }
    });

    if (changed) {
      this.stats.conversionsApplied += conversions;
    }

    return { converted, changed, conversions };
  }

  /**
   * Process a single TypeScript/TSX file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let hasChanges = false;
      const results = [];

      lines.forEach((line, index) => {
        const result = this.convertLine(line, index + 1);
        results.push(result.converted);
        if (result.changed) {
          hasChanges = true;
          console.log(`  Line ${index + 1}: ${result.conversions} conversion(s)`);
        }
      });

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
   * Find all TypeScript/TSX files in specified directories
   */
  findTSFiles(directories = ['app', 'components', 'lib']) {
    const files = [];
    
    directories.forEach(dir => {
      if (fs.existsSync(dir)) {
        const findFiles = (currentDir) => {
          const items = fs.readdirSync(currentDir);
          items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
              findFiles(fullPath);
            } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
              files.push(fullPath);
            }
          });
        };
        findFiles(dir);
      }
    });
    
    return files;
  }

  /**
   * Get current error count for comparison
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
   * Run the conversion process
   */
  async run(options = {}) {
    const { 
      directories = ['app', 'components', 'lib'],
      dryRun = false,
      maxFiles = null 
    } = options;

    console.log('🚀 Starting Automated Nullish Coalescing Converter');
    console.log('================================================');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be modified');
    }

    // Get baseline error count
    const initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${initialErrors}`);

    // Find files to process
    const files = this.findTSFiles(directories);
    const filesToProcess = maxFiles ? files.slice(0, maxFiles) : files;
    
    console.log(`📁 Found ${files.length} TypeScript files`);
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
        const lines = content.split('\n');
        let potentialChanges = 0;
        
        lines.forEach((line, index) => {
          const result = this.convertLine(line, index + 1);
          if (result.changed) potentialChanges += result.conversions;
        });
        
        if (potentialChanges > 0) {
          console.log(`  Would make ${potentialChanges} conversion(s)`);
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
    console.log('📈 CONVERSION SUMMARY');
    console.log('====================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files changed: ${filesChanged}`);
    console.log(`Total conversions: ${this.stats.conversionsApplied}`);
    console.log(`Unsafe patterns preserved: ${this.stats.unsafePatternsSaved}`);
    console.log(`Errors encountered: ${this.stats.errors.length}`);
    console.log('');
    console.log(`Initial errors: ${initialErrors}`);
    console.log(`Final errors: ${finalErrors}`);
    console.log(`Error reduction: ${errorReduction} (${((errorReduction/initialErrors)*100).toFixed(1)}%)`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ ERRORS:');
      this.stats.errors.forEach(err => {
        console.log(`  ${err.file}: ${err.error}`);
      });
    }

    return {
      filesChanged,
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
  
  // Parse command line arguments
  if (args.includes('--dry-run')) options.dryRun = true;
  if (args.includes('--max-files')) {
    const maxIndex = args.indexOf('--max-files');
    options.maxFiles = parseInt(args[maxIndex + 1]) || 10;
  }
  
  const converter = new NullishCoalescingConverter();
  converter.run(options).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = NullishCoalescingConverter;
