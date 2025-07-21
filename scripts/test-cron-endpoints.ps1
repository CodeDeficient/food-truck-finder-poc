# Test CRON Endpoints with Secure Secret Input
# Date: 2025-07-21
# Purpose: Test both CRON endpoints after secret rotation

$PRODUCTION_URL = "https://food-truck-finder-poc.vercel.app"

Write-Host "🧪 CRON Endpoint Security Test" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host ""

# Securely prompt for the CRON secret
$SecureSecret = Read-Host "Enter CRON_SECRET for testing" -AsSecureString
$CRON_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureSecret))

Write-Host ""
Write-Host "🔐 Testing with secret: $($CRON_SECRET.Substring(0,8))... (truncated)" -ForegroundColor Gray
Write-Host ""

# Test auto-scrape endpoint
Write-Host "1. Testing auto-scrape endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $CRON_SECRET"
    "Content-Type" = "application/json"
}

try {
    $response1 = Invoke-RestMethod -Uri "$PRODUCTION_URL/api/cron/auto-scrape" -Method POST -Headers $headers -TimeoutSec 30
    Write-Host "   ✅ auto-scrape: SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($response1.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ auto-scrape: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   🚨 UNAUTHORIZED - Check your CRON_SECRET" -ForegroundColor Red
    }
}

Write-Host ""

# Test quality-check endpoint
Write-Host "2. Testing quality-check endpoint..." -ForegroundColor Yellow

try {
    $response2 = Invoke-RestMethod -Uri "$PRODUCTION_URL/api/cron/quality-check" -Method POST -Headers $headers -TimeoutSec 30
    Write-Host "   ✅ quality-check: SUCCESS" -ForegroundColor Green
    Write-Host "   Response: $($response2.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ quality-check: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   🚨 UNAUTHORIZED - Check your CRON_SECRET" -ForegroundColor Red
    }
}

Write-Host ""

# Test with invalid secret to verify rejection
Write-Host "3. Testing security - invalid secret should be rejected..." -ForegroundColor Yellow
$invalidHeaders = @{
    "Authorization" = "Bearer invalid-secret-should-fail"
    "Content-Type" = "application/json"
}

try {
    $response3 = Invoke-RestMethod -Uri "$PRODUCTION_URL/api/cron/auto-scrape" -Method POST -Headers $invalidHeaders -TimeoutSec 10
    Write-Host "   ❌ SECURITY ISSUE: Invalid secret was accepted!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   ✅ Security: Invalid secret properly rejected (401)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Unexpected error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔒 SECURITY REMINDER:" -ForegroundColor Red
Write-Host "- Clear PowerShell history: Clear-History"
Write-Host "- Never share or log the CRON_SECRET"
Write-Host "- Monitor Vercel logs for any suspicious activity"

# Clear the secret from memory
$CRON_SECRET = $null
$SecureSecret = $null
