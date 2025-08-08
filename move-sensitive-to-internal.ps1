# Move Sensitive Content to .internal Directory
# This script moves all sensitive/internal content to the .internal directory
# for proper isolation before public repository cleanup

Write-Host "Moving sensitive content to .internal directory..." -ForegroundColor Yellow

# Create necessary .internal subdirectories
$directories = @(
    ".internal/docs/strategy",
    ".internal/docs/analysis", 
    ".internal/docs/audit",
    ".internal/docs/work-tracking",
    ".internal/staging",
    ".internal/reports",
    ".internal/clinerules",
    ".internal/jscpd-reports"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Move sensitive root-level markdown files
$sensitiveRootFiles = @(
    @{From="MERGE_STRATEGY.md"; To=".internal/docs/strategy/"},
    @{From="CONSERVATIVE_MERGE_PLAN.md"; To=".internal/docs/strategy/"},
    @{From="INVENTORY_ANALYSIS_REPORT.md"; To=".internal/docs/analysis/"},
    @{From="GEMINI.md"; To=".internal/docs/"},
    @{From="current-work-for-Gemini-cli.md"; To=".internal/docs/work-tracking/"},
    @{From="prompt-Gemini-cli.md"; To=".internal/docs/work-tracking/"},
    @{From="supabase-advisor-alerts.md"; To=".internal/docs/audit/"},
    @{From="temp_scratchpad_github_actions_analysis.md"; To=".internal/docs/analysis/"},
    @{From="SECURITY_AUDIT_STEP5_COMPLETE.md"; To=".internal/docs/audit/"},
    @{From="DOCUMENTATION_STRATEGY.md"; To=".internal/docs/strategy/"},
    @{From="CODEBASE_STRUCTURE_ANALYSIS.md"; To=".internal/docs/analysis/"},
    @{From="IMPACT_ANALYSIS_NULLABLE_FIELDS.md"; To=".internal/docs/analysis/"},
    @{From="2.5.2_SUBTASKS_TEMPLATE.md"; To=".internal/docs/work-tracking/"},
    @{From="README-GitMeta.md"; To=".internal/docs/"},
    @{From="README-InvokeGitSafe.md"; To=".internal/docs/"}
)

foreach ($file in $sensitiveRootFiles) {
    if (Test-Path $file.From) {
        Move-Item -Path $file.From -Destination $file.To -Force
        Write-Host "Moved: $($file.From) -> $($file.To)" -ForegroundColor Cyan
    }
}

# Move entire directories that should be internal
Write-Host "`nMoving sensitive directories..." -ForegroundColor Yellow

# Move .clinerules directory (internal development rules)
if (Test-Path ".clinerules") {
    Write-Host "Moving .clinerules directory..." -ForegroundColor Yellow
    Get-ChildItem -Path ".clinerules" -Recurse | ForEach-Object {
        $relativePath = $_.FullName.Substring((Get-Location).Path.Length + 12) # Remove .clinerules prefix
        $destination = Join-Path ".internal/clinerules" $relativePath
        $destDir = Split-Path $destination -Parent
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item -Path $_.FullName -Destination $destination -Force
    }
    Remove-Item ".clinerules" -Recurse -Force
    Write-Host "Moved: .clinerules -> .internal/clinerules" -ForegroundColor Cyan
}

# Move staging directory (internal development work)
if (Test-Path "staging") {
    Move-Item -Path "staging" -Destination ".internal/" -Force
    Write-Host "Moved: staging -> .internal/staging" -ForegroundColor Cyan
}

# Move reports directory (internal audit reports)
if (Test-Path "reports") {
    Move-Item -Path "reports" -Destination ".internal/" -Force
    Write-Host "Moved: reports -> .internal/reports" -ForegroundColor Cyan
}

# Move jscpd-report directory (code duplication reports)
if (Test-Path "jscpd-report") {
    Move-Item -Path "jscpd-report" -Destination ".internal/jscpd-reports/html" -Force
    Write-Host "Moved: jscpd-report -> .internal/jscpd-reports/html" -ForegroundColor Cyan
}

# Move jscpd-report.json
if (Test-Path "jscpd-report.json") {
    Move-Item -Path "jscpd-report.json" -Destination ".internal/jscpd-reports/" -Force
    Write-Host "Moved: jscpd-report.json -> .internal/jscpd-reports/" -ForegroundColor Cyan
}

# Move other sensitive files that might exist
$additionalSensitiveFiles = @(
    "trufflehog-exclude.txt",
    "trufflehog-exclude-paths.txt",
    "baseline-lint-summary.txt",
    "deployment-trigger.txt"
)

foreach ($file in $additionalSensitiveFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination ".internal/docs/" -Force
        Write-Host "Moved: $file -> .internal/docs/" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ All sensitive content has been moved to .internal directory" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Review the moved files in .internal/" -ForegroundColor White
Write-Host "2. Commit these changes: git add -A && git commit -m 'chore: move sensitive content to .internal'" -ForegroundColor White
Write-Host "3. Use BFG to clean git history of these files" -ForegroundColor White
Write-Host "4. Force push the cleaned history" -ForegroundColor White
