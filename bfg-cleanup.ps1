# BFG Git History Cleanup Script
# This script uses BFG Repo-Cleaner to remove sensitive files from git history
# Run this AFTER moving files to .internal and committing

Write-Host "BFG Git History Cleanup Script" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow

# Check if bfg-1.15.0.jar exists
if (!(Test-Path "bfg-1.15.0.jar")) {
    Write-Host "ERROR: bfg-1.15.0.jar not found in current directory!" -ForegroundColor Red
    Write-Host "Download from: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nThis will remove the following from git history:" -ForegroundColor Yellow
Write-Host "- All files matching patterns: *STRATEGY*, *PLAN*, *ANALYSIS*, *AUDIT*" -ForegroundColor White
Write-Host "- All files matching: *Gemini*, *work-for-*, *prompt-*, *advisor*, *scratchpad*" -ForegroundColor White
Write-Host "- Directories: .clinerules/, staging/, reports/, jscpd-report/" -ForegroundColor White
Write-Host "- Specific sensitive files from root" -ForegroundColor White

Write-Host "`n⚠️ WARNING: This will rewrite git history!" -ForegroundColor Red
$confirmation = Read-Host "Are you sure you want to proceed? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "Aborted." -ForegroundColor Yellow
    exit 0
}

# Create a backup first
Write-Host "`nCreating backup..." -ForegroundColor Yellow
git clone --mirror . ../food-truck-finder-backup.git
Write-Host "Backup created at: ../food-truck-finder-backup.git" -ForegroundColor Green

# Remove specific files by name pattern
Write-Host "`nRemoving sensitive files from history..." -ForegroundColor Yellow

# Remove strategy and planning documents
java -jar bfg-1.15.0.jar --delete-files "*STRATEGY*.md" .
java -jar bfg-1.15.0.jar --delete-files "*PLAN*.md" .
java -jar bfg-1.15.0.jar --delete-files "*ANALYSIS*.md" .
java -jar bfg-1.15.0.jar --delete-files "*AUDIT*.md" .

# Remove Gemini-related files
java -jar bfg-1.15.0.jar --delete-files "GEMINI.md" .
java -jar bfg-1.15.0.jar --delete-files "*Gemini*.md" .
java -jar bfg-1.15.0.jar --delete-files "*work-for-*.md" .
java -jar bfg-1.15.0.jar --delete-files "*prompt-*.md" .

# Remove advisor and internal tracking files
java -jar bfg-1.15.0.jar --delete-files "*advisor*.md" .
java -jar bfg-1.15.0.jar --delete-files "*scratchpad*.md" .
java -jar bfg-1.15.0.jar --delete-files "*SUBTASKS*.md" .

# Remove PowerShell documentation
java -jar bfg-1.15.0.jar --delete-files "README-GitMeta.md" .
java -jar bfg-1.15.0.jar --delete-files "README-InvokeGitSafe.md" .

# Remove directories
java -jar bfg-1.15.0.jar --delete-folders ".clinerules" .
java -jar bfg-1.15.0.jar --delete-folders "staging" .
java -jar bfg-1.15.0.jar --delete-folders "reports" .
java -jar bfg-1.15.0.jar --delete-folders "jscpd-report" .

# Remove other sensitive files
java -jar bfg-1.15.0.jar --delete-files "trufflehog-*.txt" .
java -jar bfg-1.15.0.jar --delete-files "baseline-lint-summary.txt" .
java -jar bfg-1.15.0.jar --delete-files "deployment-trigger.txt" .

Write-Host "`nRunning git garbage collection..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "`n✅ Git history has been cleaned!" -ForegroundColor Green
Write-Host "`nIMPORTANT NEXT STEPS:" -ForegroundColor Red
Write-Host "1. Review the changes: git log --oneline" -ForegroundColor White
Write-Host "2. Force push to remote: git push --force --all" -ForegroundColor White
Write-Host "3. Force push tags: git push --force --tags" -ForegroundColor White
Write-Host "4. Notify any collaborators to re-clone the repository" -ForegroundColor White
Write-Host "`nBackup location: ../food-truck-finder-backup.git" -ForegroundColor Cyan
