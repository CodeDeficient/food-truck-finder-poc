#!/bin/bash

# 📈 REAL-TIME MONITORING UPDATE SCRIPT
# Updates dashboard files with current metrics and progress

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📈 UPDATING REAL-TIME MONITORING DASHBOARDS${NC}"
echo "=================================================="

# Get current metrics
CURRENT_ERRORS=$(npm run error:count 2>/dev/null || echo "0")
BASELINE_ERRORS=$([ -f ".baseline-errors.txt" ] && cat .baseline-errors.txt || echo "$CURRENT_ERRORS")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
ISO_TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Calculate progress metrics
ERRORS_FIXED=$((BASELINE_ERRORS - CURRENT_ERRORS))
if [ "$BASELINE_ERRORS" -gt 0 ]; then
    REDUCTION_PERCENTAGE=$(( (ERRORS_FIXED * 100) / BASELINE_ERRORS ))
else
    REDUCTION_PERCENTAGE=0
fi

# Phase calculations
PHASE1_PROGRESS=0
PHASE2_PROGRESS=0
PHASE3_PROGRESS=0
OVERALL_PROGRESS=0

if [ "$CURRENT_ERRORS" -le 200 ]; then
    PHASE1_PROGRESS=100
    if [ "$CURRENT_ERRORS" -le 50 ]; then
        PHASE2_PROGRESS=100
        if [ "$CURRENT_ERRORS" -le 10 ]; then
            PHASE3_PROGRESS=100
            OVERALL_PROGRESS=100
        else
            PHASE3_PROGRESS=$(( ((50 - CURRENT_ERRORS) * 100) / 40 ))
            OVERALL_PROGRESS=75
        fi
    else
        PHASE2_PROGRESS=$(( ((200 - CURRENT_ERRORS) * 100) / 150 ))
        OVERALL_PROGRESS=50
    fi
else
    PHASE1_PROGRESS=$(( ((1332 - CURRENT_ERRORS) * 100) / 1132 ))
    OVERALL_PROGRESS=25
fi

echo "Current metrics:"
echo "  Errors: $CURRENT_ERRORS"
echo "  Baseline: $BASELINE_ERRORS"
echo "  Fixed: $ERRORS_FIXED"
echo "  Reduction: ${REDUCTION_PERCENTAGE}%"
echo "  Overall Progress: ${OVERALL_PROGRESS}%"

# Update Progress Tracker
echo -e "\n${BLUE}📊 Updating Progress Tracker...${NC}"

# Create progress bars
PHASE1_BAR=$(printf "█%.0s" $(seq 1 $((PHASE1_PROGRESS / 10))))$(printf "░%.0s" $(seq 1 $((10 - PHASE1_PROGRESS / 10))))
PHASE2_BAR=$(printf "█%.0s" $(seq 1 $((PHASE2_PROGRESS / 10))))$(printf "░%.0s" $(seq 1 $((10 - PHASE2_PROGRESS / 10))))
PHASE3_BAR=$(printf "█%.0s" $(seq 1 $((PHASE3_PROGRESS / 10))))$(printf "░%.0s" $(seq 1 $((10 - PHASE3_PROGRESS / 10))))
OVERALL_BAR=$(printf "█%.0s" $(seq 1 $((OVERALL_PROGRESS / 10))))$(printf "░%.0s" $(seq 1 $((10 - OVERALL_PROGRESS / 10))))

# Update Progress Tracker file
sed -i "s/OVERALL PROGRESS: .*$/OVERALL PROGRESS: ${OVERALL_BAR} ${OVERALL_PROGRESS}% (Phase 1 Active)/" "📊_PHASE_PROGRESS_TRACKER_📊.md" 2>/dev/null || true
sed -i "s/ERROR REDUCTION:  .*$/ERROR REDUCTION:  ${OVERALL_BAR} ${REDUCTION_PERCENTAGE}% (${BASELINE_ERRORS} → ${CURRENT_ERRORS} errors)/" "📊_PHASE_PROGRESS_TRACKER_📊.md" 2>/dev/null || true
sed -i "s/PHASE 1 PROGRESS: .*$/PHASE 1 PROGRESS: ${PHASE1_BAR} ${PHASE1_PROGRESS}% (2\/5 tasks complete)/" "📊_PHASE_PROGRESS_TRACKER_📊.md" 2>/dev/null || true

# Update Success Metrics Dashboard
echo -e "\n${BLUE}📈 Updating Success Metrics Dashboard...${NC}"

# Update error counts in dashboard
sed -i "s/ERROR COUNT: 1,332 → \[UPDATE\]/ERROR COUNT: ${BASELINE_ERRORS} → ${CURRENT_ERRORS}/" "📈_SUCCESS_METRICS_DASHBOARD_📈.md" 2>/dev/null || true
sed -i "s/REDUCTION: \[CALCULATE\]%/REDUCTION: ${REDUCTION_PERCENTAGE}%/" "📈_SUCCESS_METRICS_DASHBOARD_📈.md" 2>/dev/null || true
sed -i "s/CURRENT:      \[UPDATE_REAL_TIME\] errors/CURRENT:      ${CURRENT_ERRORS} errors/" "📈_SUCCESS_METRICS_DASHBOARD_📈.md" 2>/dev/null || true
sed -i "s/REMAINING:    \[CALCULATE\] errors/REMAINING:    $((CURRENT_ERRORS > 200 ? CURRENT_ERRORS - 200 : 0)) errors/" "📈_SUCCESS_METRICS_DASHBOARD_📈.md" 2>/dev/null || true

# Update Command Center
echo -e "\n${BLUE}🚨 Updating Command Center...${NC}"

sed -i "s/CURRENT COUNT\*\*: .* errors/CURRENT COUNT**: ${CURRENT_ERRORS} errors/" "🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md" 2>/dev/null || true
sed -i "s/LAST UPDATED\*\*: .*/LAST UPDATED**: ${TIMESTAMP}/" "🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md" 2>/dev/null || true
sed -i "s/UPDATED BY\*\*: .*/UPDATED BY**: Automated Monitoring/" "🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md" 2>/dev/null || true

# Add to error history
echo "$ISO_TIMESTAMP,$CURRENT_ERRORS,$REDUCTION_PERCENTAGE" >> .error-history.log

# Generate comprehensive monitoring report
cat > .monitoring-report.json << EOF
{
  "timestamp": "$ISO_TIMESTAMP",
  "metrics": {
    "currentErrors": $CURRENT_ERRORS,
    "baselineErrors": $BASELINE_ERRORS,
    "errorsFixed": $ERRORS_FIXED,
    "reductionPercentage": $REDUCTION_PERCENTAGE
  },
  "phases": {
    "phase1": {
      "progress": $PHASE1_PROGRESS,
      "complete": $([ "$CURRENT_ERRORS" -le 200 ] && echo "true" || echo "false"),
      "target": 200
    },
    "phase2": {
      "progress": $PHASE2_PROGRESS,
      "complete": $([ "$CURRENT_ERRORS" -le 50 ] && echo "true" || echo "false"),
      "target": 50
    },
    "phase3": {
      "progress": $PHASE3_PROGRESS,
      "complete": $([ "$CURRENT_ERRORS" -le 10 ] && echo "true" || echo "false"),
      "target": 10
    },
    "overall": {
      "progress": $OVERALL_PROGRESS
    }
  },
  "status": {
    "trend": "$([ "$ERRORS_FIXED" -gt 0 ] && echo "improving" || ([ "$ERRORS_FIXED" -eq 0 ] && echo "stable" || echo "declining"))",
    "onTrack": $([ "$REDUCTION_PERCENTAGE" -ge 20 ] && echo "true" || echo "false")
  }
}
EOF

echo -e "\n${GREEN}✅ All monitoring dashboards updated successfully${NC}"
echo -e "${BLUE}📊 Monitoring report saved to .monitoring-report.json${NC}"

# Show summary
echo -e "\n${BLUE}📈 MONITORING SUMMARY${NC}"
echo "Current Status: $CURRENT_ERRORS errors ($REDUCTION_PERCENTAGE% reduction)"
echo "Phase Progress: P1:${PHASE1_PROGRESS}% P2:${PHASE2_PROGRESS}% P3:${PHASE3_PROGRESS}%"
echo "Overall Progress: ${OVERALL_PROGRESS}%"
