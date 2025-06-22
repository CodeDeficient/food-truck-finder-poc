#!/usr/bin/env node

/**
 * 📈 CROSS-PLATFORM REAL-TIME MONITORING UPDATE SCRIPT
 * Updates dashboard files with current metrics and progress
 */

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const nodeExecutablePath = process.execPath;

function updateMonitoring() {
  console.log('📈 UPDATING REAL-TIME MONITORING DASHBOARDS');
  console.log('==================================================');

  try {
    const countScriptPath = path.join(__dirname, 'count-errors.cjs');
    const command = `"${nodeExecutablePath}" "${countScriptPath}"`;
    // eslint-disable-next-line sonarjs/os-command -- Reason: Internal script, command constructed with resolved paths for trusted tools.
    const errorCountOutput = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe' // Simpler stdio if only stdout is needed
    });

    const lines = errorCountOutput.trim().split('\n');
    const currentErrors = Number.parseInt(lines.pop()) || 0; // Get last line

    const baselineErrorsPath = '.baseline-errors.txt';
    const baselineErrors = fs.existsSync(baselineErrorsPath)
      ? Number.parseInt(fs.readFileSync(baselineErrorsPath, 'utf8').trim())
      : currentErrors; // If baseline file doesn't exist, use current as baseline
    
    if (!fs.existsSync(baselineErrorsPath)) {
        console.warn(`Baseline file ${baselineErrorsPath} not found. Using current error count (${currentErrors}) as baseline.`);
        // Optionally create it now
        // fs.writeFileSync(baselineErrorsPath, currentErrors.toString());
    }

    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'UTC', hour12: false }); // Consistent format
    const isoTimestamp = new Date().toISOString();

    const errorsFixed = baselineErrors - currentErrors;
    const reductionPercentage = baselineErrors > 0 ? Math.round((errorsFixed * 100) / baselineErrors) : 0;

    // Phase calculations (Targets: Phase1 <= 200, Phase2 <= 50, Phase3 <= 10)
    // Initial total assumed for calculation if not starting from baseline: 1332 (example)
    const initialTotalForPhaseCalc = 1332;
    let phase1Progress = 0, phase2Progress = 0, phase3Progress = 0, overallProgress = 0;

    // Phase 1: Target 200 errors (from initialTotalForPhaseCalc)
    const p1Start = initialTotalForPhaseCalc;
    const p1Target = 200;
    if (currentErrors <= p1Target) {
        phase1Progress = 100;
        // Phase 2: Target 50 errors (from 200)
        const p2Start = p1Target;
        const p2Target = 50;
        if (currentErrors <= p2Target) {
            phase2Progress = 100;
            // Phase 3: Target 10 errors (from 50)
            const p3Start = p2Target;
            const p3Target = 10;
            if (currentErrors <= p3Target) {
                phase3Progress = 100;
                overallProgress = 100; // All phases complete
            } else { // In Phase 3
                phase3Progress = Math.max(0, Math.round(((p3Start - currentErrors) * 100) / (p3Start - p3Target)));
                overallProgress = 66 + Math.floor(phase3Progress / 3); // Approx
            }
        } else { // In Phase 2
            phase2Progress = Math.max(0, Math.round(((p2Start - currentErrors) * 100) / (p2Start - p2Target)));
            overallProgress = 33 + Math.floor(phase2Progress / 3); // Approx
        }
    } else { // In Phase 1 or before
        phase1Progress = Math.max(0, Math.round(((p1Start - currentErrors) * 100) / (p1Start - p1Target)));
        overallProgress = Math.floor(phase1Progress / 3); // Approx
    }


    console.log('\nCurrent metrics:');
    console.log(`  Errors: ${currentErrors}`);
    console.log(`  Baseline: ${baselineErrors}`);
    console.log(`  Fixed: ${errorsFixed}`);
    console.log(`  Reduction: ${reductionPercentage}%`);
    console.log(`  Overall Progress (approx based on phases): ${overallProgress}%`);

    const createProgressBar = (progress) => {
      const p = Math.max(0, Math.min(100, progress)); // Clamp progress between 0-100
      const filled = Math.floor(p / 10);
      const empty = 10 - filled;
      return '█'.repeat(filled) + '░'.repeat(empty);
    };

    const phase1Bar = createProgressBar(phase1Progress);
    const phase2Bar = createProgressBar(phase2Progress); // Used for overall if not separate
    const phase3Bar = createProgressBar(phase3Progress); // Used for overall if not separate
    const overallBarDisplay = createProgressBar(overallProgress);


    console.log('\n📊 Updating Progress Tracker (📊_PHASE_PROGRESS_TRACKER_📊.md)...');
    updateFileContent('📊_PHASE_PROGRESS_TRACKER_📊.md', [
      { search: /OVERALL PROGRESS: .*$/m, replace: `OVERALL PROGRESS: ${overallBarDisplay} ${overallProgress}%` },
      { search: /ERROR REDUCTION:  .*$/m, replace: `ERROR REDUCTION:  ${createProgressBar(reductionPercentage)} ${reductionPercentage}% (${baselineErrors} → ${currentErrors} errors)` },
      { search: /PHASE 1 PROGRESS: .*$/m, replace: `PHASE 1 PROGRESS: ${phase1Bar} ${phase1Progress}%` },
      // Add Phase 2 and 3 if they exist in the template
      { search: /PHASE 2 PROGRESS: .*$/m, replace: `PHASE 2 PROGRESS: ${phase2Bar} ${phase2Progress}%` },
      { search: /PHASE 3 PROGRESS: .*$/m, replace: `PHASE 3 PROGRESS: ${phase3Bar} ${phase3Progress}%` },
    ]);

    console.log('\n📈 Updating Success Metrics Dashboard (📈_SUCCESS_METRICS_DASHBOARD_📈.md)...');
    updateFileContent('📈_SUCCESS_METRICS_DASHBOARD_📈.md', [
      { search: /ERROR COUNT: \d+ → \d+/g, replace: `ERROR COUNT: ${baselineErrors} → ${currentErrors}` },
      { search: /ERROR COUNT: \d+ → \[UPDATE\]/g, replace: `ERROR COUNT: ${baselineErrors} → ${currentErrors}` }, // Support old format
      { search: /REDUCTION: \d+%+/g, replace: `REDUCTION: ${reductionPercentage}%` },
      { search: /REDUCTION: \[CALCULATE\]%/g, replace: `REDUCTION: ${reductionPercentage}%` },
      { search: /CURRENT:      \d+ errors/g, replace: `CURRENT:      ${currentErrors} errors` },
      { search: /CURRENT:      \[UPDATE_REAL_TIME\] errors/g, replace: `CURRENT:      ${currentErrors} errors`},
      { search: /REMAINING:    \d+ errors/g, replace: `REMAINING:    ${Math.max(0, currentErrors - p1Target)} errors` }, // Remaining for Phase 1
      { search: /REMAINING:    \[CALCULATE\] errors/g, replace: `REMAINING:    ${Math.max(0, currentErrors - p1Target)} errors`},
    ]);

    console.log('\n🚨 Updating Command Center (🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md)...');
    updateFileContent('🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md', [
      { search: /\*\*CURRENT COUNT\*\*: \d+ errors/g, replace: `**CURRENT COUNT**: ${currentErrors} errors` },
      { search: /\*\*LAST UPDATED\*\*: .*/g, replace: `**LAST UPDATED**: ${timestamp} (UTC)` },
      { search: /\*\*UPDATED BY\*\*: .*/g, replace: `**UPDATED BY**: Automated Monitoring Script` }
    ]);

    const historyFilePath = '.error-history.log';
    const historyEntry = `${isoTimestamp},${currentErrors},${reductionPercentage}\n`;
    fs.appendFileSync(historyFilePath, historyEntry);
    console.log(`\n📝 Error history updated in ${historyFilePath}`);

    const monitoringReport = {
      timestamp: isoTimestamp,
      metrics: { currentErrors, baselineErrors, errorsFixed, reductionPercentage },
      phases: {
        phase1: { progress: phase1Progress, target: p1Target, complete: currentErrors <= p1Target },
        phase2: { progress: phase2Progress, target: 50, complete: currentErrors <= 50 },
        phase3: { progress: phase3Progress, target: 10, complete: currentErrors <= 10 },
        overall: { progress: overallProgress }
      },
      status: { trend: errorsFixed > 0 ? 'improving' : (errorsFixed === 0 ? 'stable' : 'declining'), onTrackToPhase1Target: reductionPercentage >= ((initialTotalForPhaseCalc - p1Target) * 100 / initialTotalForPhaseCalc) }
    };
    fs.writeFileSync('.monitoring-report.json', JSON.stringify(monitoringReport, null, 2));
    console.log('📊 Monitoring report saved to .monitoring-report.json');

    console.log('\n✅ All monitoring dashboards updated successfully');
    console.log('📈 MONITORING SUMMARY');
    console.log(`Current Status: ${currentErrors} errors (${reductionPercentage}% reduction from baseline ${baselineErrors})`);
    console.log(`Phase Progress (approx): P1:${phase1Progress}% P2:${phase2Progress}% P3:${phase3Progress}%`);
    console.log(`Overall Progress (approx): ${overallProgress}%`);

  } catch (error) {
    console.error('❌ Error updating monitoring dashboards:', error.message);
    if(error.stderr) console.error("Stderr:", error.stderr.toString());
    if(error.stdout) console.error("Stdout:", error.stdout.toString()); // Should not happen if command was successful
    process.exit(1);
  }
}

function updateFileContent(filename, replacements) {
  try {
    const filePath = path.resolve(filename); // Ensure absolute path
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  File ${filePath} not found, skipping update.`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    for (const { search, replace } of replacements) {
      const newContent = content.replace(search, replace);
      if (newContent !== content) {
        content = newContent;
        changed = true;
      }
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated ${filePath}`);
    } else {
      console.log(`☑️ No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.warn(`⚠️  Failed to update ${filename}: ${error.message}`);
  }
}

if (require.main === module) {
  updateMonitoring();
}

module.exports = updateMonitoring; // Export for potential programmatic use
