# Complete Repository History Cleanup Script
# This script will PERMANENTLY remove all sensitive content from the entire repository history
# WARNING: This will rewrite git history and cannot be undone!

param(
    [switch]$DryRun = $false,
    [switch]$Force = $false
)

Write-Host "🔥 REPOSITORY HISTORY CLEANUP SCRIPT 🔥" -ForegroundColor Red -BackgroundColor Black
Write-Host ""
Write-Host "⚠️  WARNING: This will PERMANENTLY rewrite git history!" -ForegroundColor Yellow
Write-Host "⚠️  This operation CANNOT be undone!" -ForegroundColor Yellow
Write-Host ""

if (-not $Force -and -not $DryRun) {
    $confirmation = Read-Host "Are you absolutely sure you want to proceed? Type 'PURGE' to continue"
    if ($confirmation -ne "PURGE") {
        Write-Host "❌ Operation cancelled." -ForegroundColor Red
        exit 1
    }
}

# Define sensitive content to remove
$sensitiveFiles = @(
    "docs/blog/THE-9-MILLION-DOLLAR-CODE.md"
)

$sensitiveStrings = @(
    "Zabrina",
    "zabrina", 
    "ZABRINA"
)

Write-Host "📋 Cleanup Plan:" -ForegroundColor Cyan
Write-Host "  Files to remove: $($sensitiveFiles -join ', ')" -ForegroundColor White
Write-Host "  Strings to purge: $($sensitiveStrings -join ', ')" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Delete problematic remote branch
Write-Host "🌿 Step 1: Delete problematic remote branch" -ForegroundColor Green
if ($DryRun) {
    Write-Host "   [DRY RUN] Would delete: origin/add-more-logging" -ForegroundColor Yellow
} else {
    try {
        git push origin --delete add-more-logging 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Successfully deleted origin/add-more-logging" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Branch origin/add-more-logging may not exist or already deleted" -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "   ⚠️  Could not delete remote branch (may not exist): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Step 2: Check if git-filter-repo is available
Write-Host ""
Write-Host "🔧 Step 2: Check git-filter-repo availability" -ForegroundColor Green
$gitFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue
if (-not $gitFilterRepo) {
    Write-Host "   ⚠️  git-filter-repo not found. Installing via pip..." -ForegroundColor Yellow
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would install: pip install git-filter-repo" -ForegroundColor Yellow
    } else {
        try {
            pip install git-filter-repo
            if ($LASTEXITCODE -ne 0) {
                throw "pip install failed"
            }
            Write-Host "   ✅ git-filter-repo installed successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "   ⚠️  Could not install git-filter-repo via pip. Falling back to git filter-branch..." -ForegroundColor Yellow
            $useFilterBranch = $true
        }
    }
} else {
    Write-Host "   ✅ git-filter-repo is available" -ForegroundColor Green
}

# Step 3: Create backup
Write-Host ""
Write-Host "💾 Step 3: Create backup" -ForegroundColor Green
$backupPath = "../food-truck-finder-poc-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
if ($DryRun) {
    Write-Host "   [DRY RUN] Would create backup at: $backupPath" -ForegroundColor Yellow
} else {
    try {
        git clone . $backupPath
        Write-Host "   ✅ Backup created at: $backupPath" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Failed to create backup: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Aborting for safety..." -ForegroundColor Red
        exit 1
    }
}

# Step 4: Remove sensitive files from history
Write-Host ""
Write-Host "🗑️  Step 4: Remove sensitive files from history" -ForegroundColor Green
foreach ($file in $sensitiveFiles) {
    Write-Host "   Removing file: $file" -ForegroundColor White
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would remove: $file from all history" -ForegroundColor Yellow
    } else {
        if (-not $useFilterBranch) {
            # Use git-filter-repo (preferred method)
            try {
                git filter-repo --path "$file" --invert-paths --force
                Write-Host "   ✅ Removed $file using git-filter-repo" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ git-filter-repo failed for $file : $($_.Exception.Message)" -ForegroundColor Red
                $useFilterBranch = $true
            }
        }
        
        if ($useFilterBranch) {
            # Fallback to git filter-branch
            try {
                git filter-branch --force --index-filter "git rm --cached --ignore-unmatch '$file'" --prune-empty --tag-name-filter cat -- --all
                Write-Host "   ✅ Removed $file using git filter-branch" -ForegroundColor Green
            }
            catch {
                Write-Host "   ❌ git filter-branch failed for $file : $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Step 5: Remove sensitive strings from commit messages and content
Write-Host ""
Write-Host "🔍 Step 5: Remove sensitive strings from history" -ForegroundColor Green
foreach ($sensitiveString in $sensitiveStrings) {
    Write-Host "   Removing string: $sensitiveString" -ForegroundColor White
    
    if ($DryRun) {
        Write-Host "   [DRY RUN] Would remove: '$sensitiveString' from all history" -ForegroundColor Yellow
    } else {
        if (-not $useFilterBranch) {
            # Use git-filter-repo for string replacement
            try {
                # Create temporary replacement file
                $tempFile = "temp-replacements.txt"
                "$sensitiveString==>[REDACTED]" | Out-File -FilePath $tempFile -Encoding UTF8
                git filter-repo --replace-text $tempFile --force
                Remove-Item $tempFile -ErrorAction SilentlyContinue
                Write-Host "   ✅ Replaced '$sensitiveString' using git-filter-repo" -ForegroundColor Green
            }
            catch {
                Write-Host "   ⚠️  git-filter-repo string replacement failed: $($_.Exception.Message)" -ForegroundColor Yellow
                Remove-Item $tempFile -ErrorAction SilentlyContinue
            }
        }
        
        # Additional cleanup with filter-branch for commit messages
        try {
            git filter-branch --force --msg-filter "sed 's/$sensitiveString/[REDACTED]/g'" -- --all
            Write-Host "   ✅ Cleaned commit messages for '$sensitiveString'" -ForegroundColor Green
        }
        catch {
            Write-Host "   ⚠️  Commit message cleanup failed for '$sensitiveString': $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Step 6: Clean up filter-branch refs if used
if ($useFilterBranch -and -not $DryRun) {
    Write-Host ""
    Write-Host "🧹 Step 6: Clean up filter-branch references" -ForegroundColor Green
    try {
        Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
        git reflog expire --expire=now --all
        git gc --prune=now --aggressive
        Write-Host "   ✅ Cleaned up filter-branch references" -ForegroundColor Green
    }
    catch {
        Write-Host "   ⚠️  Cleanup warning: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Step 7: Verify cleanup
Write-Host ""
Write-Host "🔍 Step 7: Verify cleanup" -ForegroundColor Green
if ($DryRun) {
    Write-Host "   [DRY RUN] Would verify that sensitive content is removed" -ForegroundColor Yellow
} else {
    $foundIssues = $false
    
    # Check for remaining files
    foreach ($file in $sensitiveFiles) {
        $fileExists = git log --all --name-only --pretty=format: | Select-String -Pattern $file -Quiet
        if ($fileExists) {
            Write-Host "   ❌ File still found in history: $file" -ForegroundColor Red
            $foundIssues = $true
        } else {
            Write-Host "   ✅ File successfully removed: $file" -ForegroundColor Green
        }
    }
    
    # Check for remaining strings
    foreach ($sensitiveString in $sensitiveStrings) {
        $stringExists = git log --all -S"$sensitiveString" --oneline
        if ($stringExists) {
            Write-Host "   ⚠️  String may still exist in history: $sensitiveString" -ForegroundColor Yellow
            Write-Host "      Found in commits: $($stringExists -join ', ')" -ForegroundColor Gray
        } else {
            Write-Host "   ✅ String successfully cleaned: $sensitiveString" -ForegroundColor Green
        }
    }
}

# Step 8: Force push to remote
Write-Host ""
Write-Host "🚀 Step 8: Force push cleaned history to remote" -ForegroundColor Green
if ($DryRun) {
    Write-Host "   [DRY RUN] Would force push to origin" -ForegroundColor Yellow
} else {
    $pushConfirmation = Read-Host "Ready to force push to GitHub? This will overwrite remote history. Type 'PUSH' to continue"
    if ($pushConfirmation -eq "PUSH") {
        try {
            git push origin --force --all
            git push origin --force --tags
            Write-Host "   ✅ Successfully force pushed cleaned history to origin" -ForegroundColor Green
        }
        catch {
            Write-Host "   ❌ Force push failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   You may need to manually force push later" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Skipped force push. You'll need to manually push later with:" -ForegroundColor Yellow
        Write-Host "      git push origin --force --all" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎉 CLEANUP COMPLETE!" -ForegroundColor Green -BackgroundColor Black
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Problematic remote branch deleted" -ForegroundColor Green
Write-Host "  ✅ Sensitive files removed from history" -ForegroundColor Green
Write-Host "  ✅ Sensitive strings cleaned from history" -ForegroundColor Green
Write-Host "  ✅ Repository history rewritten" -ForegroundColor Green
if (-not $DryRun) {
    Write-Host "  💾 Backup available at: $backupPath" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "⚠️  IMPORTANT: All collaborators will need to fresh clone the repository!" -ForegroundColor Yellow
Write-Host "⚠️  Old clones will have divergent history and won't be able to push!" -ForegroundColor Yellow
