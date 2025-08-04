# TruffleHog Secret Scanner - Safe Configuration for Food Truck Finder
Write-Host "🔍 TruffleHog Secret Scanner" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Check if TruffleHog is installed
$trufflehogPath = "C:\Users\zabri\AppData\Roaming\Python\Python313\Scripts\trufflehog.exe"

if (-not (Test-Path $trufflehogPath)) {
    Write-Host "❌ TruffleHog not found at expected location!" -ForegroundColor Red
    Write-Host "Expected: $trufflehogPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ TruffleHog found at: $trufflehogPath" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Not in project root directory! Please run from food-truck-finder-poc directory." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Project directory confirmed" -ForegroundColor Green

# Check exclusion file exists
if (-not (Test-Path "trufflehog-exclude.txt")) {
    Write-Host "❌ Exclusion file not found: trufflehog-exclude.txt" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Exclusion file found" -ForegroundColor Green
Write-Host ""

# Show what will be excluded
Write-Host "📁 Directories that will be EXCLUDED from scanning:" -ForegroundColor Yellow
Get-Content "trufflehog-exclude.txt" | ForEach-Object { 
    Write-Host "   - $_" -ForegroundColor DarkYellow 
}
Write-Host ""

# Run TruffleHog with safe parameters
Write-Host "🚀 Starting TruffleHog scan..." -ForegroundColor Green
Write-Host "Parameters: Limited depth, JSON output, with exclusions" -ForegroundColor Gray
Write-Host ""

try {
    # Use --max_depth to limit how deep it goes in the git history to prevent crashes
    $output = & $trufflehogPath . --repo_path . --exclude_paths "trufflehog-exclude.txt" --max_depth 5 --json 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ TruffleHog scan completed successfully!" -ForegroundColor Green
        
        # Count and display results
        if ($output) {
            $secretsCount = ($output | Measure-Object).Count
            Write-Host "🔍 Found $secretsCount potential secrets in git history" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "📋 Results:" -ForegroundColor Cyan
            $output | ForEach-Object { Write-Host $_ -ForegroundColor White }
        } else {
            Write-Host "🎉 No secrets detected!" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  TruffleHog completed with warnings/errors" -ForegroundColor Yellow
        Write-Host "Output:" -ForegroundColor Gray
        $output | ForEach-Object { Write-Host $_ -ForegroundColor White }
    }
} catch {
    Write-Host "❌ Error running TruffleHog:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "🏁 Scan complete!" -ForegroundColor Cyan
