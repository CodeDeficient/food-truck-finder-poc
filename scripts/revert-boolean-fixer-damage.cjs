#!/usr/bin/env node

/**
 * Revert Boolean Fixer Damage
 * Fixes the malformed expressions created by the targeted-boolean-expression-fixer.cjs
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const nodeExecutablePath = process.execPath;

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
      const countScriptPath = path.join(__dirname, 'count-errors.cjs');
      const command = `"${nodeExecutablePath}" "${countScriptPath}"`;
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
   * Fix malformed boolean expressions in a line
   */
  fixMalformedExpressions(line) {
    let fixedLine = line;
    let changesMade = 0;

    // Pattern 1: Fix instanceof expressions
    // "error instanceof Error != null" → "error instanceof Error"
    const instanceofPattern = /(\w+\s+instanceof\s+\w+)\s*!=\s*null/g;
    fixedLine = fixedLine.replace(instanceofPattern, (match, instanceofExpr) => {
      changesMade++;
      return instanceofExpr;
    });

    // Pattern 2: Fix boolean ternary expressions
    // "booleanVar != null ? a : b" → "booleanVar ? a : b" (for known boolean patterns)
    const booleanTernaryPattern = /(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*\?\s*([^:]+)\s*:\s*([^;,}]+)/g;
    fixedLine = fixedLine.replace(booleanTernaryPattern, (match, booleanVar, trueExpr, falseExpr) => {
      changesMade++;
      return `${booleanVar} ? ${trueExpr.trim()} : ${falseExpr.trim()}`;
    });

    // Pattern 3: Fix boolean if conditions
    // "if (booleanVar != null)" → "if (booleanVar)"
    const booleanIfPattern = /if\s*\(\s*(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*\)/g;
    fixedLine = fixedLine.replace(booleanIfPattern, (match, booleanVar) => {
      changesMade++;
      return `if (${booleanVar})`;
    });

    // Pattern 4: Fix boolean && expressions
    // "booleanVar != null &&" → "booleanVar &&"
    const booleanAndPattern = /(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*&&/g;
    fixedLine = fixedLine.replace(booleanAndPattern, (match, booleanVar) => {
      changesMade++;
      return `${booleanVar} &&`;
    });

    // Pattern 5: Fix boolean || expressions (less common for this specific damage, but for completeness)
    // "booleanVar != null ||" → "booleanVar ||"
    const booleanOrPattern = /(is\w+|has\w+|can\w+|should\w+|success|loading|error|active|enabled|disabled|visible|hidden)\s*!=\s*null\s*\|\|/g;
    fixedLine = fixedLine.replace(booleanOrPattern, (match, booleanVar) => {
        changesMade++;
        return `${booleanVar} ||`;
    });


    return { fixed: fixedLine, changes: changesMade };
  }

  /**
   * Process a single file
   */
  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      let fileHasChanges = false;
      const newLines = [];
      let fileTotalChanges = 0;

      for (const [index, line] of lines.entries()) {
        const result = this.fixMalformedExpressions(line);
        newLines.push(result.fixed);
        if (result.changes > 0) {
          fileHasChanges = true;
          fileTotalChanges += result.changes;
        }
      }

      if (fileHasChanges) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        this.stats.fixesApplied += fileTotalChanges;
        console.log(`✅ Updated: ${filePath} (${fileTotalChanges} fix(es) applied)`);
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
   * Find files with malformed patterns
   */
  findFilesWithMalformedPatterns() {
    // The PowerShell command is Windows-specific and might be flagged.
    // For cross-platform compatibility and to avoid shell injection risks,
    // it's better to iterate files and check content with Node.js fs and regex.
    // However, if the PowerShell script is essential and its environment is controlled,
    // it might be kept with a linter ignore for that specific line.
    // For now, using the fallback as the primary method for robustness.
    console.warn('Using fallback list for potentially affected files. PowerShell search skipped.');
    return [
        // This list should be populated by a more robust file search or a predefined list
        // For demonstration, using a few known potentially affected areas
        'app/admin/food-trucks/[id]/page.tsx',
        'app/components/TruckCard.tsx',
        // Add other files known or suspected to be affected by previous boolean fixer
    ];
    // Original PowerShell based find (kept for reference, but commented out for safety/portability)
    /*
    try {
      // This command is Windows-specific (PowerShell)
      const command = String.raw`Get-ChildItem -Path "." -Include "*.ts","*.tsx" -Recurse -ErrorAction SilentlyContinue | Select-String -Pattern "!= null \?" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path | Sort-Object -Unique`;
      const output = execSync(command, {
        encoding: 'utf8',
        shell: 'powershell.exe', // Explicitly state powershell.exe
        stdio: 'pipe',
        timeout: 60_000
      });
      const files = output.trim().split('\n').filter(file => file.trim()).map(file => path.resolve(file.trim()));
      console.log(`Found ${files.length} files via PowerShell search that might contain patterns.`);
      return files;
    } catch (error) {
      console.warn('PowerShell file search failed or found no files. Using fallback list.');
      console.warn('Error during PowerShell search:', error.message);
      return []; // Return an empty array for the fallback for now
    // }
    // */
  }


  /**
   * Run the reversion process
   */
  async run() {
    console.log('🔄 Starting Boolean Fixer Damage Reversion');
    console.log('==========================================');

    const initialErrors = this.getCurrentErrorCount();
    console.log(`📊 Initial error count: ${initialErrors}`);

    const filesToProcess = this.findFilesWithMalformedPatterns();
    
    console.log(`📁 Found ${filesToProcess.length} files to check (using fallback list)`);
    if (filesToProcess.length === 0) {
        console.log("No files identified for processing. Exiting.");
        return { success: true, filesChanged: 0, fixesApplied: 0, errorReduction: 0 };
    }
    console.log('');

    let filesChangedCount = 0;
    for (const file of filesToProcess) {
      const absoluteFilePath = path.resolve(file); // Ensure path is absolute
      if (fs.existsSync(absoluteFilePath)) {
        console.log(`Processing: ${absoluteFilePath}`);
        const changed = this.processFile(absoluteFilePath);
        if (changed) filesChangedCount++;
        this.stats.filesProcessed++;
      } else {
        console.warn(`Skipping non-existent file from list: ${absoluteFilePath}`);
      }
    }

    const finalErrors = this.getCurrentErrorCount();
    const errorReduction = initialErrors > 0 ? initialErrors - finalErrors : 0;
    const percentageReduction = initialErrors > 0 ? ((errorReduction / initialErrors) * 100).toFixed(1) : "0.0";

    console.log('');
    console.log('📈 REVERSION SUMMARY');
    console.log('===================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Files changed: ${filesChangedCount}`);
    console.log(`Total fixes applied: ${this.stats.fixesApplied}`);
    console.log(`Errors encountered during processing: ${this.stats.errors.length}`);
    console.log('');
    console.log(`Initial error count: ${initialErrors}`);
    console.log(`Final error count: ${finalErrors}`);
    console.log(`Error reduction: ${errorReduction} (${percentageReduction}%)`);

    if (this.stats.errors.length > 0) {
      console.log('');
      console.log('❌ DETAILED ERRORS DURING PROCESSING:');
      for (const err of this.stats.errors) {
        console.log(`  File: ${err.file}, Error: ${err.error}`);
      }
    }

    return {
      filesChanged: filesChangedCount,
      fixesApplied: this.stats.fixesApplied,
      errorReduction,
      success: this.stats.errors.length === 0
    };
  }
}

if (require.main === module) {
  const reverter = new BooleanFixerReverter();
  reverter.run().then(result => {
    console.log(`Boolean Fixer Reverter ${result.success ? 'completed successfully' : 'completed with errors'}.`);
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Fatal error during BooleanFixerReverter execution:', error);
    process.exit(1);
  });
}

module.exports = BooleanFixerReverter;
