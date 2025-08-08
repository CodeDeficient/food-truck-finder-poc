# Script Organization and Cleanup
# Categorizes and moves appropriate scripts from root to scripts directory

Write-Host "Analyzing root-level scripts..." -ForegroundColor Yellow

# Scripts that MUST stay in root (configuration files)
$mustStayInRoot = @(
    "eslint.config.mjs",      # ESLint config
    "jest.config.cjs",        # Jest config
    "next.config.mjs",        # Next.js config
    "postcss.config.mjs"      # PostCSS config
)

# Development/utility scripts that should move to scripts/
$toMove = @(
    # Database scripts
    "apply-rls-fix.js",
    "check-constraints.js",
    "check-data.js",
    "check-database.js",
    "check-discovered-urls.js",
    "check-policies.js",
    "execute-sql.js",
    "get-scraping-jobs.js",
    "get-truck-count.js",
    "run-sql.ps1",
    "update-job-status.js",
    
    # Debug/test scripts
    "debug-console.js",
    "debugUrlFiltering.js",
    "test-env-loading.js",
    "test-env.js",
    "test-github-action-scraper.js",
    "test-job-fetch.js",
    "test-quality-control.js",
    "test-scraping-service.js",
    
    # PowerShell test/example scripts
    "Example-InvokeGitSafe.ps1",
    "Test-ErrorHandling.ps1",
    "Test-InvokeGitSafe.ps1",
    
    # Analysis scripts
    "analyze-pipeline-quality.js",
    "analyzePipelineQuality.js",
    "simplePipelineAnalysis.mjs",
    
    # Security scripts
    "run-trufflehog.bat",
    "run-trufflehog.ps1",
    
    # Cleanup/organization scripts  
    "rename_files.bat",
    "bfg-cleanup.ps1",
    "move-sensitive-to-internal.ps1"
)

Write-Host "`nScripts that MUST stay in root:" -ForegroundColor Cyan
foreach ($script in $mustStayInRoot) {
    Write-Host "  ✓ $script" -ForegroundColor Green
}

Write-Host "`nScripts to move to scripts/:" -ForegroundColor Yellow
foreach ($script in $toMove) {
    if (Test-Path $script) {
        Write-Host "  → $script" -ForegroundColor White
    }
}

Write-Host "`nDo you want to proceed with moving these scripts? (yes/no)" -ForegroundColor Yellow
$confirm = Read-Host

if ($confirm -eq "yes") {
    # Create subdirectories in scripts/
    $directories = @(
        "scripts/database",
        "scripts/debug",
        "scripts/analysis", 
        "scripts/security",
        "scripts/cleanup",
        "scripts/powershell-examples"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created: $dir" -ForegroundColor Green
        }
    }
    
    # Move scripts to appropriate subdirectories
    $moveMap = @{
        # Database scripts
        "apply-rls-fix.js" = "scripts/database/"
        "check-constraints.js" = "scripts/database/"
        "check-data.js" = "scripts/database/"
        "check-database.js" = "scripts/database/"
        "check-discovered-urls.js" = "scripts/database/"
        "check-policies.js" = "scripts/database/"
        "execute-sql.js" = "scripts/database/"
        "get-scraping-jobs.js" = "scripts/database/"
        "get-truck-count.js" = "scripts/database/"
        "run-sql.ps1" = "scripts/database/"
        "update-job-status.js" = "scripts/database/"
        
        # Debug scripts
        "debug-console.js" = "scripts/debug/"
        "debugUrlFiltering.js" = "scripts/debug/"
        "test-env-loading.js" = "scripts/debug/"
        "test-env.js" = "scripts/debug/"
        "test-github-action-scraper.js" = "scripts/debug/"
        "test-job-fetch.js" = "scripts/debug/"
        "test-quality-control.js" = "scripts/debug/"
        "test-scraping-service.js" = "scripts/debug/"
        
        # PowerShell examples
        "Example-InvokeGitSafe.ps1" = "scripts/powershell-examples/"
        "Test-ErrorHandling.ps1" = "scripts/powershell-examples/"
        "Test-InvokeGitSafe.ps1" = "scripts/powershell-examples/"
        
        # Analysis scripts
        "analyze-pipeline-quality.js" = "scripts/analysis/"
        "analyzePipelineQuality.js" = "scripts/analysis/"
        "simplePipelineAnalysis.mjs" = "scripts/analysis/"
        
        # Security scripts
        "run-trufflehog.bat" = "scripts/security/"
        "run-trufflehog.ps1" = "scripts/security/"
        
        # Cleanup scripts
        "rename_files.bat" = "scripts/cleanup/"
        "bfg-cleanup.ps1" = "scripts/cleanup/"
        "move-sensitive-to-internal.ps1" = "scripts/cleanup/"
    }
    
    foreach ($file in $moveMap.Keys) {
        if (Test-Path $file) {
            Move-Item -Path $file -Destination $moveMap[$file] -Force
            Write-Host "Moved: $file -> $($moveMap[$file])" -ForegroundColor Cyan
        }
    }
    
    Write-Host "`n✅ Scripts have been organized!" -ForegroundColor Green
    Write-Host "`nRoot directory now contains only essential config files." -ForegroundColor White
} else {
    Write-Host "Operation cancelled." -ForegroundColor Yellow
}
