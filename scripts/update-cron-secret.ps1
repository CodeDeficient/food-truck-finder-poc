# Update CRON_SECRET in Vercel Environment Variables
# Date: 2025-07-21
# Reason: Old secret contained 2024 timestamp (6+ months old)

# Generate new cryptographically secure secret
$NEW_CRON_SECRET = [System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))

Write-Host "🔐 Updating CRON_SECRET in Vercel..." -ForegroundColor Yellow
Write-Host "New secret: $($NEW_CRON_SECRET.Substring(0,10))... (truncated for security)" -ForegroundColor Gray

# Remove old secret if it exists
Write-Host "Removing old CRON_SECRET..." -ForegroundColor Gray
try {
    vercel env rm CRON_SECRET --yes 2>$null
} catch {
    Write-Host "No existing CRON_SECRET found" -ForegroundColor Gray
}

# Add new secret to all environments
Write-Host "Adding new CRON_SECRET to Production..." -ForegroundColor Green
$NEW_CRON_SECRET | vercel env add CRON_SECRET production

Write-Host "Adding new CRON_SECRET to Preview..." -ForegroundColor Green  
$NEW_CRON_SECRET | vercel env add CRON_SECRET preview

Write-Host "Adding new CRON_SECRET to Development..." -ForegroundColor Green
$NEW_CRON_SECRET | vercel env add CRON_SECRET development

Write-Host "✅ CRON_SECRET updated in all environments!" -ForegroundColor Green

# Update local .env.local
Write-Host "Updating local .env.local..." -ForegroundColor Gray
if (Test-Path ".env.local") {
    # Read existing content and filter out old CRON_SECRET
    $content = Get-Content ".env.local" | Where-Object { $_ -notmatch "^CRON_SECRET=" }
    # Add new CRON_SECRET
    $content += "CRON_SECRET=`"$NEW_CRON_SECRET`""
    # Write back to file
    $content | Set-Content ".env.local"
    Write-Host "✅ Local .env.local updated!" -ForegroundColor Green
} else {
    Write-Host "⚠️ No .env.local found. Run 'vercel env pull .env.local' after this script." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🧪 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Test CRON endpoints with new secret"
Write-Host "2. Verify old secret is rejected" 
Write-Host "3. Update docs/SECRET_MANAGEMENT_PLAN.md with completion status"
Write-Host ""
Write-Host "Test commands:" -ForegroundColor Cyan
Write-Host "curl -X POST https://your-app.vercel.app/api/cron/auto-scrape \"
Write-Host "  -H 'Authorization: Bearer $NEW_CRON_SECRET'"
Write-Host ""
Write-Host "curl -X POST https://your-app.vercel.app/api/cron/quality-check \"
Write-Host "  -H 'Authorization: Bearer $NEW_CRON_SECRET'"

Write-Host ""
Write-Host "🔒 SECURITY REMINDER:" -ForegroundColor Red
Write-Host "- Never commit .env.local to git"
Write-Host "- Test endpoints to ensure they work with new secret"
Write-Host "- Monitor Vercel logs for any authentication errors"
