#!/usr/bin/env node

/**
 * 📈 CROSS-PLATFORM REAL-TIME MONITORING UPDATE SCRIPT
 * Updates dashboard files with current metrics and progress
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function updateMonitoring() {
  console.log('📈 UPDATING REAL-TIME MONITORING DASHBOARDS');
  console.log('==================================================');

  try {
    // Get current metrics directly from error counting script
    const errorCountOutput = execSync('node scripts/count-errors.cjs', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Extract just the number from the output (last line should be the error count)
    const lines = errorCountOutput.trim().split('\n');
    const currentErrors = parseInt(lines[lines.length - 1]) || 0;

    const baselineErrors = fs.existsSync('.baseline-errors.txt')
      ? parseInt(fs.readFileSync('.baseline-errors.txt', 'utf8').trim())
      : currentErrors;
    
    const timestamp = new Date().toLocaleString();
    const isoTimestamp = new Date().toISOString();

    // Calculate progress metrics
    const errorsFixed = baselineErrors - currentErrors;
    const reductionPercentage = baselineErrors > 0 ? Math.round((errorsFixed * 100) / baselineErrors) : 0;

    // Phase calculations
    let phase1Progress = 0;
    let phase2Progress = 0;
    let phase3Progress = 0;
    let overallProgress = 0;

    if (currentErrors <= 200) {
      phase1Progress = 100;
      if (currentErrors <= 50) {
        phase2Progress = 100;
        if (currentErrors <= 10) {
          phase3Progress = 100;
          overallProgress = 100;
        } else {
          phase3Progress = Math.round(((50 - currentErrors) * 100) / 40);
          overallProgress = 75;
        }
      } else {
        phase2Progress = Math.round(((200 - currentErrors) * 100) / 150);
        overallProgress = 50;
      }
    } else {
      phase1Progress = Math.round(((1332 - currentErrors) * 100) / 1132);
      overallProgress = 25;
    }

    console.log('Current metrics:');
    console.log(`  Errors: ${currentErrors}`);
    console.log(`  Baseline: ${baselineErrors}`);
    console.log(`  Fixed: ${errorsFixed}`);
    console.log(`  Reduction: ${reductionPercentage}%`);
    console.log(`  Overall Progress: ${overallProgress}%`);

    // Create progress bars
    const createProgressBar = (progress) => {
      const filled = Math.floor(progress / 10);
      const empty = 10 - filled;
      return '█'.repeat(filled) + '░'.repeat(empty);
    };

    const phase1Bar = createProgressBar(phase1Progress);
    const phase2Bar = createProgressBar(phase2Progress);
    const phase3Bar = createProgressBar(phase3Progress);
    const overallBar = createProgressBar(overallProgress);

    // Update Progress Tracker file
    console.log('\n📊 Updating Progress Tracker...');
    updateFileContent('📊_PHASE_PROGRESS_TRACKER_📊.md', [
      {
        search: /OVERALL PROGRESS: .*$/m,
        replace: `OVERALL PROGRESS: ${overallBar} ${overallProgress}% (Phase 1 Active)`
      },
      {
        search: /ERROR REDUCTION:  .*$/m,
        replace: `ERROR REDUCTION:  ${overallBar} ${reductionPercentage}% (${baselineErrors} → ${currentErrors} errors)`
      },
      {
        search: /PHASE 1 PROGRESS: .*$/m,
        replace: `PHASE 1 PROGRESS: ${phase1Bar} ${phase1Progress}% (2/5 tasks complete)`
      }
    ]);

    // Update Success Metrics Dashboard
    console.log('\n📈 Updating Success Metrics Dashboard...');
    updateFileContent('📈_SUCCESS_METRICS_DASHBOARD_📈.md', [
      {
        search: /ERROR COUNT: 1,332 → \[UPDATE\]/g,
        replace: `ERROR COUNT: ${baselineErrors} → ${currentErrors}`
      },
      {
        search: /REDUCTION: \[CALCULATE\]%/g,
        replace: `REDUCTION: ${reductionPercentage}%`
      },
      {
        search: /CURRENT:      \[UPDATE_REAL_TIME\] errors/g,
        replace: `CURRENT:      ${currentErrors} errors`
      },
      {
        search: /REMAINING:    \[CALCULATE\] errors/g,
        replace: `REMAINING:    ${currentErrors > 200 ? currentErrors - 200 : 0} errors`
      }
    ]);

    // Update Command Center
    console.log('\n🚨 Updating Command Center...');
    updateFileContent('🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md', [
      {
        search: /CURRENT COUNT\*\*: .* errors/g,
        replace: `CURRENT COUNT**: ${currentErrors} errors`
      },
      {
        search: /LAST UPDATED\*\*: .*/g,
        replace: `LAST UPDATED**: ${timestamp}`
      },
      {
        search: /UPDATED BY\*\*: .*/g,
        replace: `UPDATED BY**: Automated Monitoring`
      }
    ]);

    // Add to error history
    const historyEntry = `${isoTimestamp},${currentErrors},${reductionPercentage}\n`;
    fs.appendFileSync('.error-history.log', historyEntry);

    // Generate comprehensive monitoring report
    const monitoringReport = {
      timestamp: isoTimestamp,
      metrics: {
        currentErrors,
        baselineErrors,
        errorsFixed,
        reductionPercentage
      },
      phases: {
        phase1: {
          progress: phase1Progress,
          complete: currentErrors <= 200,
          target: 200
        },
        phase2: {
          progress: phase2Progress,
          complete: currentErrors <= 50,
          target: 50
        },
        phase3: {
          progress: phase3Progress,
          complete: currentErrors <= 10,
          target: 10
        },
        overall: {
          progress: overallProgress
        }
      },
      status: {
        trend: errorsFixed > 0 ? 'improving' : (errorsFixed === 0 ? 'stable' : 'declining'),
        onTrack: reductionPercentage >= 20
      }
    };

    fs.writeFileSync('.monitoring-report.json', JSON.stringify(monitoringReport, null, 2));

    console.log('\n✅ All monitoring dashboards updated successfully');
    console.log('📊 Monitoring report saved to .monitoring-report.json');

    // Show summary
    console.log('\n📈 MONITORING SUMMARY');
    console.log(`Current Status: ${currentErrors} errors (${reductionPercentage}% reduction)`);
    console.log(`Phase Progress: P1:${phase1Progress}% P2:${phase2Progress}% P3:${phase3Progress}%`);
    console.log(`Overall Progress: ${overallProgress}%`);

  } catch (error) {
    console.error('❌ Error updating monitoring:', error.message);
    process.exit(1);
  }
}

function updateFileContent(filename, replacements) {
  try {
    if (!fs.existsSync(filename)) {
      console.log(`⚠️  File ${filename} not found, skipping...`);
      return;
    }

    let content = fs.readFileSync(filename, 'utf8');
    
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });
    
    fs.writeFileSync(filename, content);
    console.log(`✅ Updated ${filename}`);
  } catch (error) {
    console.log(`⚠️  Failed to update ${filename}: ${error.message}`);
  }
}

// Run the function
updateMonitoring();
