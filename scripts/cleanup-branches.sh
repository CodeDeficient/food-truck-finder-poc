#!/bin/bash
# Food Truck Finder - Branch Cleanup Script
# Safely archives important branches and removes routine fix branches

echo "🌳 Food Truck Finder Branch Cleanup"
echo "======================================"

# Branches to DELETE (routine fixes that don't tell important stories)
ROUTINE_BRANCHES=(
    "fix/linter-errors-batch-1"
    "fix/linting-and-scripts" 
    "fix/linting-and-tests-v2"
    "fix/type-errors-and-initial-dedupe"
    "linting-fixes-phase1-3"
    "linting-remediation-attempt-1"
    "fix/critical-code-quality-issues"
    "codeantai-changes8eb0d8adb737ec03c1c134b351b83e95dee8f409gjqly"
    "codeantai-changes8eb0d8adb737ec03c1c134b351b83e95dee8f409vcttk"
    "codeantai-changesb822a6bf3e1a11bcbbfca3eed2943b2c271868fccdbps"
)

# Branches to KEEP/ARCHIVE (tell important development stories)  
KEEP_BRANCHES=(
    "main"
    "feature/admin-dashboard-updates-p1"  # Major milestone
    "feature/phase-4-ui-overhaul"         # Latest major work
    "feature/comprehensive-code-quality-improvements"  # Important refactor
    "feat/sc-food-truck-pipeline"         # Core feature
    "debug/leaflet-map-load"              # Important debugging
    "fix/map-init-error"                  # Critical fix
    "jules-tasks-1"                       # Named task branch
    "vercel-deployment-fix"               # Production fix
)

echo "📋 CLEANUP PLAN:"
echo "- Will DELETE: ${#ROUTINE_BRANCHES[@]} routine fix branches"
echo "- Will KEEP: ${#KEEP_BRANCHES[@]} important branches"
echo ""

echo "🏷️ Creating archive tags for important branches..."
git tag archive/admin-dashboard-updates-p1 feature/admin-dashboard-updates-p1 2>/dev/null || echo "Tag already exists"
git tag archive/phase-4-ui-overhaul feature/phase-4-ui-overhaul 2>/dev/null || echo "Tag already exists"  
git tag archive/comprehensive-code-quality feature/comprehensive-code-quality-improvements 2>/dev/null || echo "Tag already exists"

echo ""
echo "🗑️ Deleting routine fix branches..."
for branch in "${ROUTINE_BRANCHES[@]}"; do
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "  Deleting: $branch"
        git branch -D $branch
    else
        echo "  Skipping: $branch (doesn't exist)"
    fi
done

echo ""
echo "📤 Pushing archive tags to remote..."
git push origin --tags

echo ""
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "📊 SUMMARY:"
git branch --list | wc -l | xargs echo "- Local branches remaining:"
git tag --list "archive/*" | wc -l | xargs echo "- Archive tags created:"
echo ""
echo "🔍 Remaining branches:"
git branch --list
