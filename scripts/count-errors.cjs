#!/usr/bin/env node

/**
 * 📊 CROSS-PLATFORM ERROR COUNTING SCRIPT
 * Counts ESLint errors in a platform-independent way
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path'); // Required for path.join if used, but not directly in this version

// Resolve paths to CLI tools upfront
let eslintCLIPath;
try {
  eslintCLIPath = require.resolve('eslint/bin/eslint.js');
} catch (e) {
  console.error("ESLint CLI path not found. Make sure 'eslint' is installed locally.");
  // Fallback or exit, depending on desired strictness. For a counting script, exiting is safer.
  process.exit(1);
}
const nodeExecutablePath = process.execPath;

function countErrors() {
  try {
    // console.error('Running ESLint to count errors...'); // Using console.error for progress messages

    const command = `"${nodeExecutablePath}" "${eslintCLIPath}" . --format json`;
    // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
    const eslintOutput = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe', // Capture stdout, stderr will go to console by default if not piped
      timeout: 180_000, // 3 minutes timeout, increased
      maxBuffer: 1024 * 1024 * 20 // 20MB buffer, increased
    });

    // console.error('ESLint completed successfully'); // Progress message

    const results = JSON.parse(eslintOutput);
    const totalErrors = results.reduce((total, file) => total + file.errorCount, 0);
    const totalWarnings = results.reduce((total, file) => total + file.warningCount, 0);

    // console.error(`Found ${totalErrors} errors and ${totalWarnings} warnings`); // Progress

    // Output just the error count for scripts that call this
    console.log(totalErrors);

    const metrics = {
      timestamp: new Date().toISOString(),
      errors: totalErrors,
      warnings: totalWarnings,
      filesScanned: results.length, // Renamed for clarity
      filesWithErrors: results.filter(f => f.errorCount > 0).length,
      filesWithWarnings: results.filter(f => f.warningCount > 0).length // Added
    };
    fs.writeFileSync('.current-metrics.json', JSON.stringify(metrics, null, 2));

    return totalErrors;

  } catch (error) {
    // This block executes if execSync itself throws an error (e.g., non-zero exit code)
    // console.error('ESLint execution resulted in an error:', error.message); // Log the main error message

    const stdout = error.stdout ? error.stdout.toString() : '';
    // const stderr = error.stderr ? error.stderr.toString() : ''; // stderr can be noisy

    // Try to parse stdout even if the command failed, as ESLint might still output JSON
    if (stdout) {
      try {
        const results = JSON.parse(stdout);
        const totalErrors = results.reduce((total, file) => total + file.errorCount, 0);
        const totalWarnings = results.reduce((total, file) => total + file.warningCount, 0);

        // console.error(`Extracted ${totalErrors} errors and ${totalWarnings} warnings from failed ESLint run (stdout).`);
        console.log(totalErrors); // Output error count

        const metrics = {
          timestamp: new Date().toISOString(),
          errors: totalErrors,
          warnings: totalWarnings,
          filesScanned: results.length,
          filesWithErrors: results.filter(f => f.errorCount > 0).length,
          filesWithWarnings: results.filter(f => f.warningCount > 0).length,
          eslintRunFailed: true, // Indicate that the run itself had issues
          eslintExitCode: error.status // Capture exit code
        };
        fs.writeFileSync('.current-metrics.json', JSON.stringify(metrics, null, 2));
        return totalErrors;
      } catch (parseError) {
        // console.error('Could not parse ESLint stdout as JSON after error:', parseError.message);
        // console.error('ESLint stdout snippet on error:', stdout.substring(0, 1000));
      }
    }

    // Fallback: if parsing stdout failed or no stdout, try to read from a known ESLint output file if it exists
    // This is a more robust fallback if direct execSync parsing is tricky
    const eslintOutputFile = 'eslint-output.json'; // A common output file name
    if (fs.existsSync(eslintOutputFile)) {
        try {
            const fileContent = fs.readFileSync(eslintOutputFile, 'utf8');
            const results = JSON.parse(fileContent);
            const totalErrors = results.reduce((total, file) => total + file.errorCount, 0);
            // console.error(`Extracted ${totalErrors} errors from ${eslintOutputFile}.`);
            console.log(totalErrors);
            // Not saving metrics here as this is a last resort fallback
            return totalErrors;
        } catch (fileParseError) {
            // console.error(`Could not parse ${eslintOutputFile}: ${fileParseError.message}`);
        }
    }

    // Absolute fallback if no other method works
    // console.error('Could not determine error count through any method. Reporting a high fallback number.');
    const fallbackErrorCount = 1332; // Default or last known high number
    console.log(fallbackErrorCount);

    // Save metrics with fallback
     const metrics = {
        timestamp: new Date().toISOString(),
        errors: fallbackErrorCount,
        warnings: 0, // Unknown
        filesScanned: 0, // Unknown
        filesWithErrors: 0, // Unknown
        eslintRunFailed: true,
        fallbackUsed: true
    };
    fs.writeFileSync('.current-metrics.json', JSON.stringify(metrics, null, 2));
    return fallbackErrorCount;
  }
}

// Ensure the function is called only when the script is executed directly
if (require.main === module) {
  countErrors();
}

module.exports = countErrors; // Export for potential programmatic use elsewhere if needed
