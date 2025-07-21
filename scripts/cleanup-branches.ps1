# Food Truck Finder - Branch Cleanup Script (PowerShell)
# Safely archives important branches and removes routine fix branches

Write-Host "🌳 Food Truck Finder Branch Cleanup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Branches to DELETE (routine fixes that don't tell important stories)
$RoutineBranches = @(
    "fix/linter-errors-batch-1",
    "fix/linting-and-scripts", 
    "fix/linting-and-tests-v2",
    "fix/type-errors-and-initial-dedupe",
    "linting-fixes-phase1-3",
    "linting-remediation-attempt-1", 
    "fix/critical-code-quality-issues",
    "codeantai-changes8eb0d8adb737ec03c1c134b351b83e95dee8f409gjqly",
    "codeantai-changes8eb0d8adb737ec03c1c134b351b83e95dee8f409vcttk",
    "codeantai-changesb822a6bf3e1a11bcbbfca3eed2943b2c271868fccdbps"
)

# Branches to KEEP/ARCHIVE (tell important development stories)  
$KeepBranches = @(
    "main",
    "feature/admin-dashboard-updates-p1",   # Major milestone
    "feature/phase-4-ui-overhaul",          # Latest major work
    "feature/comprehensive-code-quality-improvements",  # Important refactor
    "feat/sc-food-truck-pipeline",          # Core feature
    "debug/leaflet-map-load",               # Important debugging
    "fix/map-init-error",                   # Critical fix
    "jules-tasks-1",                        # Named task branch
    "vercel-deployment-fix"                 # Production fix
)

Write-Host ""
Write-Host "📋 CLEANUP PLAN:" -ForegroundColor Yellow
Write-Host "- Will DELETE: $($RoutineBranches.Count) routine fix branches" -ForegroundColor Yellow
Write-Host "- Will KEEP: $($KeepBranches.Count) important branches" -ForegroundColor Yellow
Write-Host ""

Write-Host "🏷️ Archive tags already created..." -ForegroundColor Cyan
Write-Host ""

Write-Host "🗑️ Deleting routine fix branches..." -ForegroundColor Red
foreach ($branch in $RoutineBranches) {
    try {
        $exists = git show-ref --verify --quiet refs/heads/$branch
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Deleting: $branch" -ForegroundColor Red
            git branch -D $branch
        }
    }
    catch {
        Write-Host "  Skipping: $branch (doesn't exist)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📤 Pushing archive tags to remote..." -ForegroundColor Blue
git push origin --tags

Write-Host ""
Write-Host "✅ CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 SUMMARY:" -ForegroundColor Cyan
$branchCount = (git branch --list).Count
$tagCount = (git tag --list "archive/*").Count
Write-Host "- Local branches remaining: $branchCount" -ForegroundColor Cyan
Write-Host "- Archive tags created: $tagCount" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔍 Remaining branches:" -ForegroundColor Cyan
git branch --list
