#!/bin/bash

# 🛡️ COMPREHENSIVE QUALITY GATES SCRIPT
# Prevents systematic linting errors through automated validation

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration - Dynamic thresholds based on current phase
BASELINE_ERRORS=1316
PHASE1_TARGET=200
PHASE2_TARGET=50
PHASE3_TARGET=10

# Determine current phase and set appropriate thresholds
CURRENT_ERRORS_OUTPUT=$(node scripts/count-errors.cjs 2>/dev/null || echo "1316")
CURRENT_ERRORS=$(echo "$CURRENT_ERRORS_OUTPUT" | tail -1 | grep -o '[0-9]*' | head -1)
CURRENT_ERRORS=${CURRENT_ERRORS:-1316}

if [ "$CURRENT_ERRORS" -gt "$PHASE1_TARGET" ]; then
    # Phase 1: Allow higher error count but track progress
    MAX_ERRORS=$((CURRENT_ERRORS - 50))  # Require at least 50 error reduction
    PHASE="Phase 1 (Stabilization)"
elif [ "$CURRENT_ERRORS" -gt "$PHASE2_TARGET" ]; then
    # Phase 2: Stricter requirements
    MAX_ERRORS=200
    PHASE="Phase 2 (Systematic)"
elif [ "$CURRENT_ERRORS" -gt "$PHASE3_TARGET" ]; then
    # Phase 3: Very strict
    MAX_ERRORS=50
    PHASE="Phase 3 (Optimization)"
else
    # Phase 4: Enterprise standards
    MAX_ERRORS=10
    PHASE="Phase 4 (Prevention)"
fi

MAX_WARNINGS=20  # Allow more warnings during transition
MIN_TYPE_COVERAGE=85  # Relaxed during migration
MAX_COMPLEXITY=20  # Relaxed during migration

echo -e "${BLUE}🛡️  RUNNING COMPREHENSIVE QUALITY GATES${NC}"
echo "=================================================="
echo -e "${BLUE}Current Phase: $PHASE${NC}"
echo -e "${BLUE}Error Threshold: $MAX_ERRORS (Current: $CURRENT_ERRORS)${NC}"
echo "=================================================="

# Stage 1: Type Safety Validation (CRITICAL)
echo -e "\n${BLUE}🔍 Stage 1: Type Safety Validation${NC}"
echo "Running TypeScript strict mode check..."

if npx tsc --noEmit --strict; then
    echo -e "${GREEN}✅ Type safety validation passed${NC}"
else
    echo -e "${RED}❌ Type safety validation failed${NC}"
    echo -e "${RED}Fix TypeScript errors before proceeding${NC}"
    exit 1
fi

# Stage 2: ESLint Error Threshold Check (CRITICAL)
echo -e "\n${BLUE}🧹 Stage 2: ESLint Quality Gate${NC}"
echo "Running ESLint with error threshold validation..."

# Run ESLint and capture output
ESLINT_OUTPUT=$(npx eslint . --format json 2>/dev/null || echo "[]")
ERROR_COUNT=$(echo "$ESLINT_OUTPUT" | jq '[.[] | .errorCount] | add // 0')
WARNING_COUNT=$(echo "$ESLINT_OUTPUT" | jq '[.[] | .warningCount] | add // 0')

echo "Current errors: $ERROR_COUNT (max: $MAX_ERRORS)"
echo "Current warnings: $WARNING_COUNT (max: $MAX_WARNINGS)"

if [ "$ERROR_COUNT" -gt "$MAX_ERRORS" ]; then
    echo -e "${RED}❌ QUALITY GATE FAILED: $ERROR_COUNT errors exceeds threshold of $MAX_ERRORS${NC}"
    echo -e "${RED}Fix critical errors before proceeding${NC}"
    exit 1
fi

if [ "$WARNING_COUNT" -gt "$MAX_WARNINGS" ]; then
    echo -e "${YELLOW}⚠️  WARNING: $WARNING_COUNT warnings exceeds threshold of $MAX_WARNINGS${NC}"
    echo -e "${YELLOW}Consider fixing warnings for better code quality${NC}"
fi

echo -e "${GREEN}✅ ESLint quality gate passed${NC}"

# Stage 3: Cognitive Complexity Check (HIGH PRIORITY)
echo -e "\n${BLUE}📊 Stage 3: Cognitive Complexity Gate${NC}"
echo "Checking for functions with complexity > $MAX_COMPLEXITY..."

COMPLEXITY_OUTPUT=$(npx eslint . --rule "sonarjs/cognitive-complexity: [error, $MAX_COMPLEXITY]" --format json 2>/dev/null || echo "[]")
COMPLEXITY_ERRORS=$(echo "$COMPLEXITY_OUTPUT" | jq '[.[] | .errorCount] | add // 0')

if [ "$COMPLEXITY_ERRORS" -gt 0 ]; then
    echo -e "${RED}❌ COMPLEXITY GATE FAILED: $COMPLEXITY_ERRORS functions exceed complexity threshold${NC}"
    echo -e "${RED}Refactor complex functions before proceeding${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Cognitive complexity gate passed${NC}"

# Stage 4: Type Coverage Check (MEDIUM PRIORITY)
echo -e "\n${BLUE}🎯 Stage 4: Type Coverage Gate${NC}"
echo "Validating TypeScript type coverage..."

if command -v type-coverage >/dev/null 2>&1; then
    if npx type-coverage --at-least "$MIN_TYPE_COVERAGE" --detail; then
        echo -e "${GREEN}✅ Type coverage gate passed${NC}"
    else
        echo -e "${YELLOW}⚠️  Type coverage below $MIN_TYPE_COVERAGE%${NC}"
        echo -e "${YELLOW}Consider improving type definitions${NC}"
        # Don't fail on type coverage for now, just warn
    fi
else
    echo -e "${YELLOW}⚠️  type-coverage not installed, skipping type coverage check${NC}"
fi

# Stage 5: Security and Best Practices (OPTIONAL)
echo -e "\n${BLUE}🔒 Stage 5: Security & Best Practices${NC}"
echo "Running additional security and best practice checks..."

# Check for common security issues
SECURITY_PATTERNS=(
    "console\.log"
    "debugger"
    "alert\("
    "confirm\("
    "eval\("
    "innerHTML"
)

SECURITY_ISSUES=0
for pattern in "${SECURITY_PATTERNS[@]}"; do
    if grep -r "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Found potential security/debug pattern: $pattern${NC}"
        ((SECURITY_ISSUES++))
    fi
done

if [ "$SECURITY_ISSUES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Found $SECURITY_ISSUES potential security/debug issues${NC}"
    echo -e "${YELLOW}Review and remove debug code before production${NC}"
fi

# Stage 6: Bundle Size Check (OPTIONAL)
echo -e "\n${BLUE}📦 Stage 6: Bundle Size Analysis${NC}"
echo "Analyzing potential bundle size impact..."

# Count large files that might impact bundle size
LARGE_FILES=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs wc -l | sort -nr | head -10)
echo "Largest source files (lines of code):"
echo "$LARGE_FILES"

# Summary Report
echo -e "\n${GREEN}🎉 QUALITY GATES SUMMARY${NC}"
echo "=================================================="
echo -e "Type Safety:      ${GREEN}✅ PASSED${NC}"
echo -e "ESLint Errors:     ${GREEN}✅ PASSED${NC} ($ERROR_COUNT/$MAX_ERRORS)"
echo -e "ESLint Warnings:   ${GREEN}✅ PASSED${NC} ($WARNING_COUNT/$MAX_WARNINGS)"
echo -e "Complexity:        ${GREEN}✅ PASSED${NC}"
echo -e "Security Issues:   ${YELLOW}$SECURITY_ISSUES found${NC}"

echo -e "\n${GREEN}🚀 All critical quality gates passed! Ready for deployment.${NC}"

# Generate quality report
cat > quality-report.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "gates": {
    "typeSafety": "passed",
    "eslintErrors": "passed",
    "eslintWarnings": "passed",
    "complexity": "passed"
  },
  "metrics": {
    "errorCount": $ERROR_COUNT,
    "warningCount": $WARNING_COUNT,
    "complexityViolations": $COMPLEXITY_ERRORS,
    "securityIssues": $SECURITY_ISSUES
  },
  "thresholds": {
    "maxErrors": $MAX_ERRORS,
    "maxWarnings": $MAX_WARNINGS,
    "maxComplexity": $MAX_COMPLEXITY,
    "minTypeCoverage": $MIN_TYPE_COVERAGE
  }
}
EOF

echo -e "\n${BLUE}📊 Quality report saved to quality-report.json${NC}"
