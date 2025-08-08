# FINAL BFG Git History Cleanup Script
# This script removes ALL sensitive content from git history including .clinerules
# Run this AFTER all files have been moved/gitignored

Write-Host "==================================================" -ForegroundColor Red
Write-Host "     FINAL GIT HISTORY CLEANUP - DESTRUCTIVE     " -ForegroundColor Red
Write-Host "==================================================" -ForegroundColor Red

# Check if bfg-1.15.0.jar exists
if (!(Test-Path "bfg-1.15.0.jar")) {
    Write-Host "`nERROR: bfg-1.15.0.jar not found!" -ForegroundColor Red
    Write-Host "Download from: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nThis will PERMANENTLY remove from git history:" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "DIRECTORIES:" -ForegroundColor Cyan
Write-Host "  • .clinerules/ (ALL Cline/AI development rules)" -ForegroundColor White
Write-Host "  • staging/ (UI specialist work)" -ForegroundColor White
Write-Host "  • reports/ (audit reports)" -ForegroundColor White
Write-Host "  • jscpd-report/ (code duplication)" -ForegroundColor White
Write-Host ""
Write-Host "FILE PATTERNS:" -ForegroundColor Cyan
Write-Host "  • *STRATEGY*.md, *PLAN*.md, *ANALYSIS*.md, *AUDIT*.md" -ForegroundColor White
Write-Host "  • *Gemini*.md, *work-for-*.md, *prompt-*.md" -ForegroundColor White
Write-Host "  • *advisor*.md, *scratchpad*.md, *SUBTASKS*.md" -ForegroundColor White
Write-Host "  • README-GitMeta.md, README-InvokeGitSafe.md" -ForegroundColor White
Write-Host "  • trufflehog-*.txt, baseline-*.txt, deployment-trigger.txt" -ForegroundColor White

Write-Host "`n⚠️  THIS IS IRREVERSIBLE! Your git history will be rewritten!" -ForegroundColor Red
Write-Host "⚠️  You will need to force-push after this operation!" -ForegroundColor Red
Write-Host "⚠️  Anyone who has cloned your repo will need to re-clone!" -ForegroundColor Red

Write-Host "`nType 'CLEAN MY HISTORY' to proceed: " -NoNewline -ForegroundColor Yellow
$confirmation = Read-Host

if ($confirmation -ne "CLEAN MY HISTORY") {
    Write-Host "`nAborted. History remains unchanged." -ForegroundColor Green
    exit 0
}

# Create a backup first
Write-Host "`nCreating backup of current repository..." -ForegroundColor Yellow
$backupName = "food-truck-finder-backup-$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
git clone --mirror . "../$backupName.git"
Write-Host "✅ Backup created at: ../$backupName.git" -ForegroundColor Green

Write-Host "`nStarting BFG cleanup..." -ForegroundColor Yellow

# Remove .clinerules directory (CRITICAL - contains AI dev rules)
Write-Host "Removing .clinerules directory from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-folders ".clinerules" --no-blob-protection .

# Remove other sensitive directories
Write-Host "Removing staging directory from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-folders "staging" --no-blob-protection .

Write-Host "Removing reports directory from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-folders "reports" --no-blob-protection .

Write-Host "Removing jscpd-report from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-folders "jscpd-report" --no-blob-protection .

# Remove strategy and planning documents
Write-Host "Removing strategy documents from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-files "*STRATEGY*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*PLAN*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*ANALYSIS*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*AUDIT*.md" --no-blob-protection .

# Remove Gemini/AI-related files
Write-Host "Removing AI/Gemini files from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-files "GEMINI.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*Gemini*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*work-for-*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*prompt-*.md" --no-blob-protection .

# Remove advisor and internal tracking files
Write-Host "Removing internal tracking files from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-files "*advisor*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*scratchpad*.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "*SUBTASKS*.md" --no-blob-protection .

# Remove PowerShell documentation
Write-Host "Removing PowerShell docs from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-files "README-GitMeta.md" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "README-InvokeGitSafe.md" --no-blob-protection .

# Remove other sensitive files
Write-Host "Removing other sensitive files from history..." -ForegroundColor Yellow
java -jar bfg-1.15.0.jar --delete-files "trufflehog-*.txt" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "baseline-lint-summary.txt" --no-blob-protection .
java -jar bfg-1.15.0.jar --delete-files "deployment-trigger.txt" --no-blob-protection .

Write-Host "`nRunning git garbage collection to finalize cleanup..." -ForegroundColor Yellow
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "        ✅ GIT HISTORY HAS BEEN CLEANED!         " -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

Write-Host "`nVERIFY THE CLEANUP:" -ForegroundColor Yellow
Write-Host "1. Check that .clinerules is no longer in history:" -ForegroundColor White
Write-Host "   git log --all -- .clinerules/" -ForegroundColor Cyan
Write-Host "   (Should return nothing)" -ForegroundColor Gray

Write-Host "`n2. Check file count reduction:" -ForegroundColor White
Write-Host "   git count-objects -v" -ForegroundColor Cyan

Write-Host "`nNEXT STEPS:" -ForegroundColor Red
Write-Host "1. Review changes: git log --oneline -20" -ForegroundColor White
Write-Host "2. Force push ALL branches: git push --force --all" -ForegroundColor White
Write-Host "3. Force push ALL tags: git push --force --tags" -ForegroundColor White
Write-Host "4. Delete and re-protect any branch protection rules on GitHub" -ForegroundColor White
Write-Host "5. Anyone who has cloned must delete and re-clone the repo" -ForegroundColor White

Write-Host "`nBACKUP LOCATION: ../$backupName.git" -ForegroundColor Cyan
Write-Host "(Keep this until you're sure everything is working!)" -ForegroundColor Gray
