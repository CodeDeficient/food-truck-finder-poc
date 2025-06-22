#!/usr/bin/env node

/**
 * Comprehensive Automated Fixer
 * Targets multiple high-impact, safe-to-automate ESLint error patterns
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

// Resolve paths to CLI tools upfront
let eslintCLIPath;
try {
  eslintCLIPath = require.resolve('eslint/bin/eslint.js');
} catch (e) {
  console.error("ESLint CLI path not found. Make sure 'eslint' is installed locally.");
  process.exit(1);
}

let tscCLIPath;
try {
  tscCLIPath = require.resolve('typescript/bin/tsc');
} catch (e) {
  console.error("TypeScript CLI path not found. Make sure 'typescript' is installed locally.");
  process.exit(1);
}
const nodeExecutablePath = process.execPath;

class ComprehensiveAutomatedFixer {
  constructor() {
    this.stats = {
      initialErrors: 0,
      finalErrors: 0,
      eslintAutoFixes: 0,
      nullishCoalescingFixes: 0,
      nullUndefinedFixes: 0,
      unusedImportFixes: 0, // This will be estimated based on error count change
      totalFilesProcessed: 0, // TODO: Implement tracking if needed
      errors: []
    };
  }

  /**
   * Get current error count
   */
  getCurrentErrorCount() {
    try {
      const countScriptPath = path.join(__dirname, 'count-errors.cjs');
      const command = `"${nodeExecutablePath}" "${countScriptPath}"`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
      const lines = output.trim().split('\n');
      const lastLine = lines.pop();
      return Number.parseInt(lastLine) || 0;
    } catch (error) {
      console.warn('Could not get current error count:');
      if (error.stderr) console.warn('stderr:', error.stderr.toString().trim());
      // error.message often includes stdout/stderr, so log it if distinct
      if (error.message && !error.message.includes(error.stdout?.toString()) && !error.message.includes(error.stderr?.toString())) {
        console.warn('message:', error.message);
      }
      return 0;
    }
  }

  /**
   * Step 1: Run ESLint auto-fix for safe rules
   */
  runESLintAutoFix() {
    console.log('🔧 Step 1: Running ESLint auto-fix (general)...');
    try {
      const command = `"${nodeExecutablePath}" "${eslintCLIPath}" . --fix --quiet`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(command, { stdio: 'pipe', timeout: 300_000 }); // Increased timeout
      console.log('✅ ESLint auto-fix (general) completed');
      return true;
    } catch (error) {
      // ESLint exits with non-zero if it finds errors, even if it fixes some.
      // So, we don't treat exit code 1 as a fatal error for the auto-fixer itself.
      console.warn('⚠️  ESLint auto-fix (general) finished. May have had issues or found lint errors (expected).');
      if (error.stderr) console.warn("Stderr:", error.stderr.toString().substring(0, 500));
      return true;
    }
  }

  /**
   * Step 2: Fix remaining || → ?? patterns
   */
  fixRemainingNullishCoalescing() {
    console.log('🔄 Step 2: Fixing remaining || → ?? patterns...');
    try {
      const converterScriptPath = path.join(__dirname, 'automated-nullish-coalescing-converter.cjs');
      const command = `"${nodeExecutablePath}" "${converterScriptPath}"`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      const result = execSync(command, { encoding: 'utf8', timeout: 180_000 }); // Increased timeout
      
      const lines = result.split('\n');
      const conversionLine = lines.find(line => line.includes('Total conversions actually applied:')); // Adjusted to match new output
      if (conversionLine) {
        const match = conversionLine.match(/Total conversions actually applied: (\d+)/);
        if (match) this.stats.nullishCoalescingFixes = Number.parseInt(match[1]);
      } else {
         // Fallback if the exact line is not found, check for the other dry-run type line
        const dryRunConversionLine = lines.find(line => line.includes('Total conversions potentially applied:'));
        if (dryRunConversionLine) {
            const match = dryRunConversionLine.match(/Total conversions potentially applied: (\d+)/);
            if (match) this.stats.nullishCoalescingFixes = Number.parseInt(match[1]); // Store it even if it was dry-run like
        }
      }
      console.log(`✅ Nullish coalescing fixes reported by script: ${this.stats.nullishCoalescingFixes}`);
      return true;
    } catch (error) {
      console.warn('⚠️  Nullish coalescing script execution had issues:');
      if (error.stderr) console.warn("Stderr:", error.stderr.toString().substring(0, 500));
      if (error.stdout) console.warn("Stdout:", error.stdout.toString().substring(0, 500));
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
        
        const patterns = [
          { from: /:\s*null(?=\s*[,;}\]])/g, to: ': undefined' },
          { from: /return\s+null(?=\s*[;}])/g, to: 'return undefined' },
          { from: /=\s*null(?=\s*[,)])/g, to: '= undefined' },
          { from: /:\s*null(?=\s*[,}])/g, to: ': undefined' } // Already covered by first one
        ];
        
        for (const pattern of patterns) {
          const matches = Array.from(modified.matchAll(pattern.from));
          if (matches.length > 0) {
            modified = modified.replace(pattern.from, pattern.to);
            fixCount += matches.length;
          }
        }
        
        if (modified !== content) {
          fs.writeFileSync(filePath, modified);
        }
      } catch (error) {
        console.warn(`Error processing ${filePath} for null->undefined: ${error.message}`);
        this.stats.errors.push({file: filePath, step: 'fixNullToUndefined', message: error.message});
      }
    }
    this.stats.nullUndefinedFixes = fixCount;
    console.log(`✅ Null → undefined fixes applied: ${fixCount}`);
    return true;
  }

  /**
   * Step 4: Remove unused imports using ESLint
   */
  removeUnusedImports() {
    console.log('🗑️  Step 4: Removing unused imports (sonarjs/unused-import)...');
    try {
      const command = `"${nodeExecutablePath}" "${eslintCLIPath}" . --fix --rule "sonarjs/unused-import:error" --quiet`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(command, { stdio: 'pipe', timeout: 180_000 }); // Increased timeout
      console.log('✅ Unused import removal (sonarjs/unused-import) completed');
      return true;
    } catch (error) {
      console.warn('⚠️  Unused import removal (sonarjs/unused-import) finished. May have had issues or found lint errors.');
      if (error.stderr) console.warn("Stderr:", error.stderr.toString().substring(0,500));
      return true;
    }
  }

  findTSFiles(directories = ['app', 'components', 'lib', 'hooks']) {
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
              if (excludedDirs.has(item) && fs.statSync(fullPath).isDirectory()) continue;
              const stat = fs.statSync(fullPath);
              if (stat.isDirectory()) findFilesRecursive(fullPath);
              else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
                files.push(fullPath.replaceAll('\\', '/'));
              }
            }
          } catch (readDirError) { console.warn(`Could not read directory ${currentDir}: ${readDirError.message}`); }
        };
        findFilesRecursive(rootDir);
      } else { console.warn(`Directory not found for TS scan: ${rootDir}`); }
    }
    return files;
  }

  verifyCompilation() {
    console.log('🔍 Verifying TypeScript compilation...');
    try {
      const command = `"${nodeExecutablePath}" "${tscCLIPath}" --noEmit --strict`; // Added --strict for thoroughness
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(command, { stdio: 'pipe', timeout: 300_000 }); // Increased timeout
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.warn('⚠️  TypeScript compilation has issues:');
      if (error.stdout) console.warn("Stdout:", error.stdout.toString().substring(0,1000));
      if (error.stderr) console.warn("Stderr:", error.stderr.toString().substring(0,1000));
      return false;
    }
  }

  async run(options = {}) {
    const { 
      skipESLintFix = false, skipNullishCoalescing = false, skipNullUndefined = false,
      skipUnusedImports = false, verifyCompilation = true // Verify by default
    } = options;

    console.log('🚀 Starting Comprehensive Automated Fixing');
    console.log('==========================================');

    this.stats.initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${this.stats.initialErrors}`);
    let errorsBeforeStep = this.stats.initialErrors;

    try {
      if (!skipESLintFix) {
        this.runESLintAutoFix();
        const afterESLint = this.getCurrentErrorCount();
        this.stats.eslintAutoFixes = errorsBeforeStep - afterESLint;
        console.log(`📉 After ESLint auto-fix: ${afterESLint} (${this.stats.eslintAutoFixes} fixed in this step)`);
        errorsBeforeStep = afterESLint;
      }

      if (!skipNullishCoalescing) {
        this.fixRemainingNullishCoalescing(); // This method updates its own stat
        const afterNullish = this.getCurrentErrorCount();
        // Note: this.stats.nullishCoalescingFixes is set by the script, not by error diff here
        console.log(`📉 After nullish coalescing: ${afterNullish} (script reported ${this.stats.nullishCoalescingFixes} conversions)`);
        errorsBeforeStep = afterNullish;
      }

      if (!skipNullUndefined) {
        this.fixNullToUndefined(); // This method updates its own stat
        const afterNullUndef = this.getCurrentErrorCount();
        // Note: this.stats.nullUndefinedFixes is set by the script
        console.log(`📉 After null → undefined: ${afterNullUndef} (${this.stats.nullUndefinedFixes} fixed in this step)`);
        errorsBeforeStep = afterNullUndef;
      }

      if (!skipUnusedImports) {
        const errorsBeforeUnused = errorsBeforeStep;
        this.removeUnusedImports();
        const afterImports = this.getCurrentErrorCount();
        this.stats.unusedImportFixes = errorsBeforeUnused - afterImports;
        console.log(`📉 After unused imports: ${afterImports} (${this.stats.unusedImportFixes} fixed in this step)`);
        errorsBeforeStep = afterImports;
      }

      if (verifyCompilation) this.verifyCompilation();

      this.stats.finalErrors = this.getCurrentErrorCount();
      const totalReduction = this.stats.initialErrors - this.stats.finalErrors;
      const reductionPercentage = this.stats.initialErrors > 0 ? ((totalReduction / this.stats.initialErrors) * 100).toFixed(1) : "0.0";

      console.log('\n📈 COMPREHENSIVE AUTOMATION RESULTS');
      console.log('===================================');
      console.log(`Initial errors: ${this.stats.initialErrors}`);
      console.log(`Final errors: ${this.stats.finalErrors}`);
      console.log(`Total reduction: ${totalReduction} (${reductionPercentage}%)`);
      console.log('\nBREAKDOWN BY AUTOMATION TYPE (approximated for some):');
      console.log(`• ESLint auto-fixes (general): ${this.stats.eslintAutoFixes}`);
      console.log(`• Nullish coalescing (|| → ??): ${this.stats.nullishCoalescingFixes} (reported by sub-script)`);
      console.log(`• Null → undefined: ${this.stats.nullUndefinedFixes}`);
      console.log(`• Unused imports (sonarjs/unused-import): ${this.stats.unusedImportFixes}`);
      
      const phase1Target = 200;
      const remainingToTarget = Math.max(0, this.stats.finalErrors - phase1Target);
      console.log('\n🎯 PHASE 1 PROGRESS:');
      console.log(`Target: ${phase1Target} errors`);
      console.log(`Current: ${this.stats.finalErrors} errors`);
      console.log(`Remaining: ${remainingToTarget} errors to target`);
      
      if (this.stats.finalErrors <= phase1Target) console.log('🎉 PHASE 1 TARGET ACHIEVED!');
      else {
        const initialGap = Math.max(1, this.stats.initialErrors - phase1Target); // Avoid division by zero if already at target
        const progressMade = this.stats.initialErrors - this.stats.finalErrors;
        const progressPercentage = ((progressMade / initialGap) * 100).toFixed(1);
        console.log(`Progress toward Phase 1 target: ${progressPercentage}%`);
      }

      return {
        success: true, initialErrors: this.stats.initialErrors, finalErrors: this.stats.finalErrors,
        totalReduction, reductionPercentage: Number.parseFloat(reductionPercentage),
        phase1Complete: this.stats.finalErrors <= phase1Target
      };

    } catch (error) {
      console.error('\n❌ Comprehensive automation failed:', error.message);
      this.stats.errors.push({step: 'run', message: error.message});
      return {
        success: false, error: error.message,
        finalErrors: this.stats.finalErrors || this.stats.initialErrors
      };
    }
  }
}

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  const options = {
    skipESLintFix: args.has('--skip-eslint'),
    skipNullishCoalescing: args.has('--skip-nullish'),
    skipNullUndefined: args.has('--skip-null'),
    skipUnusedImports: args.has('--skip-imports'),
    verifyCompilation: args.has('--verify') // Only verify if explicitly asked
  };
  
  const fixer = new ComprehensiveAutomatedFixer();
  fixer.run(options).then(result => {
    console.log(`Comprehensive Automated Fixer ${result.success ? 'finished successfully' : 'finished with errors'}.`);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error in ComprehensiveAutomatedFixer:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveAutomatedFixer;
