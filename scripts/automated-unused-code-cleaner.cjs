#!/usr/bin/env node

/**
 * Automated Unused Code Cleaner
 * Safely removes unused imports and variables using ESLint auto-fix capabilities
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
      if (error.stdout) console.warn('stdout:', error.stdout.toString().trim());
      if (error.message && !error.message.includes(error.stdout?.toString()) && !error.message.includes(error.stderr?.toString())) {
        console.warn('message:', error.message);
      }
      return 0;
    }
  }

  /**
   * Create backup of current state
   */
  createBackup() {
    console.log('💾 Creating backup...');
    const backupPath = path.resolve(this.backupDir); // Ensure absolute path

    if (fs.existsSync(backupPath)) {
      // Use platform-independent removal if possible, or keep existing execSync for specific commands
      // For simplicity, keeping execSync for rmdir/xcopy as they are Windows-specific
      // On non-Windows, these would need to be 'rm -rf' and 'cp -r' respectively
      try {
        if (process.platform === "win32") {
            execSync(`rmdir /s /q "${backupPath}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled, for specific OS command.
        } else {
            execSync(`rm -rf "${backupPath}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled, for specific OS command.
        }
      } catch (e) { /* ignore errors if dir doesn't exist or cannot be removed */ }
    }
    fs.mkdirSync(backupPath, { recursive: true });
    
    const dirsToBackup = ['app', 'components', 'lib', 'hooks']; // Added hooks
    for (const dir of dirsToBackup) {
      const sourceDir = path.resolve(dir);
      const destDir = path.join(backupPath, dir);
      if (fs.existsSync(sourceDir)) {
        try {
            if (process.platform === "win32") {
                execSync(`xcopy "${sourceDir}" "${destDir}" /E /I /Q /Y`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, paths are controlled.
            } else {
                execSync(`cp -r "${sourceDir}" "${destDir}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, paths are controlled.
            }
        } catch (e) {
            console.warn(`Warning: Could not backup directory ${sourceDir}: ${e.message}`);
        }
      }
    }
    console.log(`✅ Backup created in ${backupPath}`);
  }

  /**
   * Restore from backup
   */
  restoreBackup() {
    console.log('🔄 Restoring from backup...');
    const backupPath = path.resolve(this.backupDir);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`No backup found to restore from at ${backupPath}`);
    }
    
    const dirsToRestore = ['app', 'components', 'lib', 'hooks']; // Added hooks
    for (const dir of dirsToRestore) {
      const targetDir = path.resolve(dir);
      const sourceBackupDir = path.join(backupPath, dir);

      if (fs.existsSync(targetDir)) {
         try {
            if (process.platform === "win32") {
                execSync(`rmdir /s /q "${targetDir}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled.
            } else {
                execSync(`rm -rf "${targetDir}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled.
            }
        } catch (e) { /* ignore */ }
      }
      if (fs.existsSync(sourceBackupDir)) {
        try {
            if (process.platform === "win32") {
                execSync(`xcopy "${sourceBackupDir}" "${targetDir}" /E /I /Q /Y`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, paths are controlled.
            } else {
                execSync(`cp -r "${sourceBackupDir}" "${targetDir}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, paths are controlled.
            }
        } catch (e) {
             console.warn(`Warning: Could not restore directory ${targetDir}: ${e.message}`);
        }
      }
    }
    console.log('✅ Backup restored successfully');
  }

  /**
   * Clean up backup directory
   */
  cleanupBackup() {
    const backupPath = path.resolve(this.backupDir);
    if (fs.existsSync(backupPath)) {
      try {
        if (process.platform === "win32") {
            execSync(`rmdir /s /q "${backupPath}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled.
        } else {
            execSync(`rm -rf "${backupPath}"`, { stdio: 'ignore' }); // eslint-disable-line sonarjs/os-command -- Reason: Internal script, path is controlled.
        }
        console.log('🗑️  Backup cleaned up');
      } catch (e) {
        console.warn(`Warning: Could not clean up backup directory ${backupPath}: ${e.message}`);
      }
    }
  }

  /**
   * Run ESLint auto-fix for unused code rules
   */
  runUnusedCodeFixes() {
    console.log('🧹 Running ESLint auto-fix for unused code...');
    try {
      console.log('  Fixing unused variables (@typescript-eslint/no-unused-vars)...');
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(`"${nodeExecutablePath}" "${eslintCLIPath}" . --fix --rule "@typescript-eslint/no-unused-vars: error"`, {
        stdio: 'pipe', timeout: 180_000 // Increased timeout
      });
      
      console.log('  Fixing unused imports (sonarjs/unused-import)...');
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(`"${nodeExecutablePath}" "${eslintCLIPath}" . --fix --rule "sonarjs/unused-import: error"`, {
        stdio: 'pipe', timeout: 180_000 // Increased timeout
      });
      
      console.log('✅ ESLint auto-fixes completed');
      return true;
    } catch (error) {
      console.error('❌ ESLint auto-fix failed:');
      if(error.stdout) console.error("Stdout:", error.stdout.toString());
      if(error.stderr) console.error("Stderr:", error.stderr.toString());
      if(!error.stdout && !error.stderr) console.error(error.message);
      return false;
    }
  }

  /**
   * Verify TypeScript compilation still works
   */
  verifyTypeScriptCompilation() {
    console.log('🔍 Verifying TypeScript compilation...');
    try {
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      execSync(`"${nodeExecutablePath}" "${tscCLIPath}" --noEmit --strict`, {
        stdio: 'pipe', timeout: 180_000 // Increased timeout
      });
      console.log('✅ TypeScript compilation successful');
      return true;
    } catch (error) {
      console.error('❌ TypeScript compilation failed:');
      if(error.stdout) console.error("Stdout:", error.stdout.toString());
      if(error.stderr) console.error("Stderr:", error.stderr.toString());
      if(!error.stdout && !error.stderr) console.error(error.message);
      return false;
    }
  }

  /**
   * Count specific error types before and after
   */
  countSpecificErrors() {
    try {
      const command = `"${nodeExecutablePath}" "${eslintCLIPath}" . --format json`;
      // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
      const output = execSync(command, {
        encoding: 'utf8', stdio: 'pipe', timeout: 180_000 // Increased timeout
      });
      
      const results = JSON.parse(output);
      let unusedVars = 0;
      let unusedImports = 0;
      
      for (const file of results) {
        for (const msg of file.messages) {
          if (msg.severity === 2) { // Error
            if (msg.ruleId === '@typescript-eslint/no-unused-vars') {
              unusedVars++;
            } else if (msg.ruleId === 'sonarjs/unused-import') {
              unusedImports++;
            }
          }
        }
      }
      return { unusedVars, unusedImports };
    } catch (error) {
      console.warn('Could not count specific errors via ESLint:');
      if(error.stdout) console.warn("Stdout:", error.stdout.toString().substring(0, 500)); // Log snippet
      if(error.stderr) console.warn("Stderr:", error.stderr.toString().substring(0, 500));
      if(!error.stdout && !error.stderr && error.message) console.warn(error.message);
      return { unusedVars: 0, unusedImports: 0 }; // Fallback
    }
  }

  async run(options = {}) {
    const { 
      createBackup = true,
      verifyCompilation = true,
      autoRollback = true 
    } = options;

    console.log('🚀 Starting Automated Unused Code Cleanup');
    console.log('==========================================');

    const initialErrors = this.getCurrentErrorCount();
    const initialSpecific = this.countSpecificErrors();
    
    console.log(`📊 Initial total error count: ${initialErrors}`);
    console.log(`📊 Initial unused vars (@typescript-eslint/no-unused-vars): ${initialSpecific.unusedVars}`);
    console.log(`📊 Initial unused imports (sonarjs/unused-import): ${initialSpecific.unusedImports}`);

    try {
      if (createBackup) this.createBackup();

      const fixSuccess = this.runUnusedCodeFixes();
      if (!fixSuccess) throw new Error('ESLint auto-fix phase failed');

      if (verifyCompilation) {
        const compileSuccess = this.verifyTypeScriptCompilation();
        if (!compileSuccess) throw new Error('TypeScript compilation failed after fixes');
      }

      const finalErrors = this.getCurrentErrorCount();
      const finalSpecific = this.countSpecificErrors();
      const errorReduction = initialErrors > 0 ? initialErrors - finalErrors : 0;
      const unusedVarsFixed = initialSpecific.unusedVars > 0 ? initialSpecific.unusedVars - finalSpecific.unusedVars : 0;
      const unusedImportsFixed = initialSpecific.unusedImports > 0 ? initialSpecific.unusedImports - finalSpecific.unusedImports : 0;
      const percentageReduction = initialErrors > 0 ? ((errorReduction / initialErrors) * 100).toFixed(1) : "0.0";

      console.log('\n📈 CLEANUP RESULTS');
      console.log('==================');
      console.log(`Total errors: ${initialErrors} → ${finalErrors} (${errorReduction >= 0 ? errorReduction : 'increase of ' + Math.abs(errorReduction)} fixed)`);
      console.log(`Unused variables: ${initialSpecific.unusedVars} → ${finalSpecific.unusedVars} (${unusedVarsFixed >= 0 ? unusedVarsFixed : 'increase of ' + Math.abs(unusedVarsFixed)} fixed)`);
      console.log(`Unused imports: ${initialSpecific.unusedImports} → ${finalSpecific.unusedImports} (${unusedImportsFixed >= 0 ? unusedImportsFixed : 'increase of ' + Math.abs(unusedImportsFixed)} fixed)`);
      if (initialErrors > 0) console.log(`Overall error reduction: ${percentageReduction}%`);

      this.stats.unusedVarsFixed = unusedVarsFixed;
      this.stats.unusedImportsFixed = unusedImportsFixed;

      if (createBackup && errorReduction >= 0) this.cleanupBackup(); // Cleanup backup only on success or no change

      console.log('\n✅ Unused code cleanup process completed.');
      
      return {
        success: true, errorReduction, unusedVarsFixed, unusedImportsFixed, finalErrors
      };

    } catch (error) {
      console.error('\n❌ Cleanup failed:', error.message);
      this.stats.errors.push({ general: error.message });
      
      if (autoRollback && createBackup && fs.existsSync(path.resolve(this.backupDir))) {
        console.log('🔄 Auto-rolling back changes...');
        try {
          this.restoreBackup();
          this.cleanupBackup(); // Clean up backup after restore
          console.log('✅ Rollback completed');
        } catch (restoreError) {
          console.error('❌ Rollback failed:', restoreError.message);
        }
      }
      
      return { success: false, error: error.message, finalErrors: initialErrors };
    }
  }
}

if (require.main === module) {
  const args = new Set(process.argv.slice(2));
  const options = { createBackup: !args.has('--no-backup'), verifyCompilation: !args.has('--no-verify'), autoRollback: !args.has('--no-rollback') };
  
  const cleaner = new UnusedCodeCleaner();
  cleaner.run(options).then(result => {
    console.log(`Unused Code Cleaner ${result.success ? 'finished successfully' : 'finished with errors'}.`);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error in UnusedCodeCleaner:', error);
    process.exit(1);
  });
}

module.exports = UnusedCodeCleaner;
