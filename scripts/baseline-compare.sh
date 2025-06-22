#!/bin/bash

# 📊 BASELINE COMPARISON SCRIPT
# Compares current error count with baseline for progress tracking

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 BASELINE COMPARISON ANALYSIS${NC}"
echo "=================================================="

# Get current error count
CURRENT_ERRORS=$(npm run error:count 2>/dev/null || echo "0")

# Get baseline error count
if [ -f ".baseline-errors.txt" ]; then
    BASELINE_ERRORS=$(cat .baseline-errors.txt)
else
    echo -e "${YELLOW}⚠️  No baseline found. Creating baseline...${NC}"
    echo "$CURRENT_ERRORS" > .baseline-errors.txt
    BASELINE_ERRORS=$CURRENT_ERRORS
fi

# Calculate progress
ERRORS_FIXED=$((BASELINE_ERRORS - CURRENT_ERRORS))
if [ "$BASELINE_ERRORS" -gt 0 ]; then
    REDUCTION_PERCENTAGE=$(( (ERRORS_FIXED * 100) / BASELINE_ERRORS ))
else
    REDUCTION_PERCENTAGE=0
fi

echo -e "\n${BLUE}📈 PROGRESS METRICS${NC}"
echo "Baseline errors:  $BASELINE_ERRORS"
echo "Current errors:   $CURRENT_ERRORS"
echo "Errors fixed:     $ERRORS_FIXED"
echo "Reduction:        ${REDUCTION_PERCENTAGE}%"

# Progress visualization
if [ "$ERRORS_FIXED" -gt 0 ]; then
    echo -e "${GREEN}✅ PROGRESS: $ERRORS_FIXED errors fixed (${REDUCTION_PERCENTAGE}% reduction)${NC}"
elif [ "$ERRORS_FIXED" -eq 0 ]; then
    echo -e "${YELLOW}⚪ STABLE: No change in error count${NC}"
else
    echo -e "${RED}❌ REGRESSION: $((ERRORS_FIXED * -1)) new errors introduced${NC}"
fi

# Phase progress calculation
echo -e "\n${BLUE}🎯 PHASE PROGRESS${NC}"

# Phase 1 target: 1332 → 200 (85% reduction)
PHASE1_TARGET=200
PHASE1_BASELINE=1332

if [ "$CURRENT_ERRORS" -le "$PHASE1_TARGET" ]; then
    echo -e "${GREEN}✅ PHASE 1 COMPLETE: Target of $PHASE1_TARGET errors achieved${NC}"
    
    # Phase 2 target: 200 → 50 (75% reduction)
    PHASE2_TARGET=50
    if [ "$CURRENT_ERRORS" -le "$PHASE2_TARGET" ]; then
        echo -e "${GREEN}✅ PHASE 2 COMPLETE: Target of $PHASE2_TARGET errors achieved${NC}"
        
        # Phase 3 target: 50 → 10 (80% reduction)
        PHASE3_TARGET=10
        if [ "$CURRENT_ERRORS" -le "$PHASE3_TARGET" ]; then
            echo -e "${GREEN}✅ PHASE 3 COMPLETE: Target of $PHASE3_TARGET errors achieved${NC}"
            echo -e "${GREEN}🎉 ALL PHASES COMPLETE! Enterprise linting standards achieved${NC}"
        else
            PHASE3_PROGRESS=$(( ((PHASE2_TARGET - CURRENT_ERRORS) * 100) / (PHASE2_TARGET - PHASE3_TARGET) ))
            echo -e "${YELLOW}🔄 PHASE 3 IN PROGRESS: ${PHASE3_PROGRESS}% complete${NC}"
        fi
    else
        PHASE2_PROGRESS=$(( ((PHASE1_TARGET - CURRENT_ERRORS) * 100) / (PHASE1_TARGET - PHASE2_TARGET) ))
        echo -e "${YELLOW}🔄 PHASE 2 IN PROGRESS: ${PHASE2_PROGRESS}% complete${NC}"
    fi
else
    PHASE1_PROGRESS=$(( ((PHASE1_BASELINE - CURRENT_ERRORS) * 100) / (PHASE1_BASELINE - PHASE1_TARGET) ))
    echo -e "${YELLOW}🔄 PHASE 1 IN PROGRESS: ${PHASE1_PROGRESS}% complete${NC}"
fi

# Velocity calculation (if we have timestamps)
if [ -f ".error-history.log" ]; then
    echo -e "\n${BLUE}⚡ VELOCITY ANALYSIS${NC}"
    
    # Get last 5 entries for trend analysis
    RECENT_ENTRIES=$(tail -5 .error-history.log)
    echo "Recent error count history:"
    echo "$RECENT_ENTRIES"
    
    # Calculate average velocity (errors fixed per hour)
    FIRST_ENTRY=$(echo "$RECENT_ENTRIES" | head -1)
    LAST_ENTRY=$(echo "$RECENT_ENTRIES" | tail -1)
    
    if [ -n "$FIRST_ENTRY" ] && [ -n "$LAST_ENTRY" ]; then
        FIRST_ERRORS=$(echo "$FIRST_ENTRY" | cut -d',' -f2)
        LAST_ERRORS=$(echo "$LAST_ENTRY" | cut -d',' -f2)
        FIRST_TIME=$(echo "$FIRST_ENTRY" | cut -d',' -f1)
        LAST_TIME=$(echo "$LAST_ENTRY" | cut -d',' -f1)
        
        # Simple velocity calculation (errors per entry)
        VELOCITY_ERRORS=$((FIRST_ERRORS - LAST_ERRORS))
        echo "Velocity: $VELOCITY_ERRORS errors fixed in recent period"
    fi
fi

# Update error history log
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
echo "$TIMESTAMP,$CURRENT_ERRORS" >> .error-history.log

# Generate progress report
cat > .progress-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "baseline": $BASELINE_ERRORS,
  "current": $CURRENT_ERRORS,
  "fixed": $ERRORS_FIXED,
  "reductionPercentage": $REDUCTION_PERCENTAGE,
  "phase1Complete": $([ "$CURRENT_ERRORS" -le 200 ] && echo "true" || echo "false"),
  "phase2Complete": $([ "$CURRENT_ERRORS" -le 50 ] && echo "true" || echo "false"),
  "phase3Complete": $([ "$CURRENT_ERRORS" -le 10 ] && echo "true" || echo "false")
}
EOF

echo -e "\n${BLUE}📊 Progress report saved to .progress-report.json${NC}"
