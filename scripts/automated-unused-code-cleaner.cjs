#!/usr/bin/env node

/**
 * Automated Unused Code Cleaner
 * Safely removes unused imports and variables using ESLint auto-fix capabilities
 * 
 * HIGH CONFIDENCE FIXES:
 * - @typescript-eslint/no-unused-vars
 * - sonarjs/unused-import  
 * - Unused imports that can be safely removed
 * 
 * SAFETY MEASURES:
 * - Uses ESLint's built-in auto-fix (proven safe)
 * - Backs up files before changes
 * - Verifies no build errors after changes
 * - Rollback capability if issues detected
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class UnusedCodeCleaner {
  constructor() {
    this.backupDir = '.backup-unused-cleanup';
    this.stats = {
      filesProcessed: 0,
      unusedVarsFixed: 0,
      unusedImportsFixed: 0,
      errors: []
    };
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
   * Create backup of current state
   */
  createBackup() {
    console.log('💾 Creating backup...');
    
    if (fs.existsSync(this.backupDir)) {
      execSync(`rmdir /s /q "${this.backupDir}"`, { stdio: 'ignore' });
    }
    
    fs.mkdirSync(this.backupDir, { recursive: true });
    
    // Backup key directories
    const dirsToBackup = ['app', 'components', 'lib'];
    dirsToBackup.forEach(dir => {
      if (fs.existsSync(dir)) {
        execSync(`xcopy "${dir}" "${this.backupDir}\\${dir}" /E /I /Q`, { stdio: 'ignore' });
      }
    });
    
    console.log(`✅ Backup created in ${this.backupDir}`);
  }

  /**
   * Restore from backup
   */
  restoreBackup() {
    console.log('🔄 Restoring from backup...');
    
    if (!fs.existsSync(this.backupDir)) {
      throw new Error('No backup found to restore from');
    }
    
    const dirsToRestore = ['app', 'components', 'lib'];
    dirsToRestore.forEach(dir => {
      if (fs.existsSync(dir)) {
        execSync(`rmdir /s /q "${dir}"`, { stdio: 'ignore' });
      }
      if (fs.existsSync(path.join(this.backupDir, dir))) {
        execSync(`xcopy "${this.backupDir}\\${dir}" "${dir}" /E /I /Q`, { stdio: 'ignore' });
      }
    });
    
    console.log('✅ Backup restored successfully');
  }

  /**
   * Clean up backup directory
   */
  cleanupBackup() {
    if (fs.existsSync(this.backupDir)) {
      execSync(`rmdir /s /q "${this.backupDir}"`, { stdio: 'ignore' });
      console.log('🗑️  Backup cleaned up');
    }
  }

  /**
   * Run ESLint auto-fix for unused code rules
   */
  runUnusedCodeFixes() {
    console.log('🧹 Running ESLint auto-fix for unused code...');
    
    try {
      // Fix unused variables
      console.log('  Fixing unused variables...');
      execSync('npx eslint . --fix --rule "@typescript-eslint/no-unused-vars: error"', {
        stdio: 'pipe',
        timeout: 120000
      });
      
      // Fix unused imports  
      console.log('  Fixing unused imports...');
      execSync('npx eslint . --fix --rule "sonarjs/unused-import: error"', {
        stdio: 'pipe', 
        timeout: 120000
      });
      
      console.log('✅ ESLint auto-fixes completed');
      return true;
    } catch (error) {
      console.error('❌ ESLint auto-fix failed:', error.message);
      return false;
    }
  }

  /**
   * Verify TypeScript compilation still works
   */
  verifyTypeScriptCompilation() {
    console.log('🔍 Verifying TypeScript compilation...');
    
    try {
      execSync('npx tsc --noEmit --strict', {
        stdio: 'pipe',
        timeout: 120000
      });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed:', error.message);
      return false;
    }
  }

  /**
   * Count specific error types before and after
   */
  countSpecificErrors() {
    try {
      const output = execSync('npx eslint . --format json', {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000
      });
      
      const results = JSON.parse(output);
      let unusedVars = 0;
      let unusedImports = 0;
      
      results.forEach(file => {
        file.messages.forEach(msg => {
          if (msg.severity === 2) {
            if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
              unusedVars++;
            } else if (msg.ruleId === 'sonarjs/unused-import') {
              unusedImports++;
            }
          }
        });
      });
      
      return { unusedVars, unusedImports };
    } catch (error) {
      console.warn('Could not count specific errors:', error.message);
      return { unusedVars: 0, unusedImports: 0 };
    }
  }

  /**
   * Run the complete unused code cleanup process
   */
  async run(options = {}) {
    const { 
      createBackup = true,
      verifyCompilation = true,
      autoRollback = true 
    } = options;

    console.log('🚀 Starting Automated Unused Code Cleanup');
    console.log('==========================================');

    // Get baseline metrics
    const initialErrors = this.getCurrentErrorCount();
    const initialSpecific = this.countSpecificErrors();
    
    console.log(`📊 Initial error count: ${initialErrors}`);
    console.log(`📊 Initial unused vars: ${initialSpecific.unusedVars}`);
    console.log(`📊 Initial unused imports: ${initialSpecific.unusedImports}`);

    try {
      // Create backup if requested
      if (createBackup) {
        this.createBackup();
      }

      // Run the fixes
      const fixSuccess = this.runUnusedCodeFixes();
      if (!fixSuccess) {
        throw new Error('ESLint auto-fix failed');
      }

      // Verify compilation if requested
      if (verifyCompilation) {
        const compileSuccess = this.verifyTypeScriptCompilation();
        if (!compileSuccess) {
          throw new Error('TypeScript compilation failed after fixes');
        }
      }

      // Get final metrics
      const finalErrors = this.getCurrentErrorCount();
      const finalSpecific = this.countSpecificErrors();
      const errorReduction = initialErrors - finalErrors;
      const unusedVarsFixed = initialSpecific.unusedVars - finalSpecific.unusedVars;
      const unusedImportsFixed = initialSpecific.unusedImports - finalSpecific.unusedImports;

      // Print results
      console.log('\n📈 CLEANUP RESULTS');
      console.log('==================');
      console.log(`Total errors: ${initialErrors} → ${finalErrors} (${errorReduction} fixed)`);
      console.log(`Unused variables: ${initialSpecific.unusedVars} → ${finalSpecific.unusedVars} (${unusedVarsFixed} fixed)`);
      console.log(`Unused imports: ${initialSpecific.unusedImports} → ${finalSpecific.unusedImports} (${unusedImportsFixed} fixed)`);
      console.log(`Error reduction: ${((errorReduction / initialErrors) * 100).toFixed(1)}%`);

      // Update stats
      this.stats.unusedVarsFixed = unusedVarsFixed;
      this.stats.unusedImportsFixed = unusedImportsFixed;

      // Clean up backup on success
      if (createBackup && errorReduction > 0) {
        this.cleanupBackup();
      }

      console.log('\n✅ Unused code cleanup completed successfully!');
      
      return {
        success: true,
        errorReduction,
        unusedVarsFixed,
        unusedImportsFixed,
        finalErrors
      };

    } catch (error) {
      console.error('\n❌ Cleanup failed:', error.message);
      
      // Auto-rollback if requested and backup exists
      if (autoRollback && createBackup && fs.existsSync(this.backupDir)) {
        console.log('🔄 Auto-rolling back changes...');
        this.restoreBackup();
        this.cleanupBackup();
        console.log('✅ Rollback completed');
      }
      
      return {
        success: false,
        error: error.message,
        finalErrors: initialErrors
      };
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  if (args.includes('--no-backup')) options.createBackup = false;
  if (args.includes('--no-verify')) options.verifyCompilation = false;
  if (args.includes('--no-rollback')) options.autoRollback = false;
  
  const cleaner = new UnusedCodeCleaner();
  cleaner.run(options).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = UnusedCodeCleaner;
