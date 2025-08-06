#!/usr/bin/env pwsh
# Test authentication and profile system status

Write-Host "=== Food Truck Finder Authentication System Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if the development server is running
Write-Host "1. Checking development server..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✓ Development server is running" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Development server not responding" -ForegroundColor Red
    Write-Host "   Run 'npm run dev' to start the server" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check Supabase environment variables
Write-Host "2. Checking Supabase configuration..." -ForegroundColor Yellow
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$supabaseAnonKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
$supabaseServiceKey = $env:SUPABASE_SERVICE_ROLE_KEY

if ($supabaseUrl -and $supabaseAnonKey) {
    Write-Host "   ✓ Supabase URL and Anon Key configured" -ForegroundColor Green
} else {
    Write-Host "   ✗ Missing Supabase environment variables" -ForegroundColor Red
    Write-Host "   Check .env.local file" -ForegroundColor Yellow
}

if ($supabaseServiceKey) {
    Write-Host "   ✓ Supabase Service Key configured" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Supabase Service Key not configured (optional)" -ForegroundColor Yellow
}

# Check Google OAuth configuration
Write-Host "3. Checking Google OAuth configuration..." -ForegroundColor Yellow
$googleClientId = $env:NEXT_PUBLIC_GOOGLE_CLIENT_ID
$googleClientSecret = $env:GOOGLE_CLIENT_SECRET

if ($googleClientId -and $googleClientSecret) {
    Write-Host "   ✓ Google OAuth credentials configured" -ForegroundColor Green
} else {
    Write-Host "   ✗ Missing Google OAuth credentials" -ForegroundColor Red
    Write-Host "   Configure in Google Cloud Console and Supabase" -ForegroundColor Yellow
}

# Test basic endpoints
Write-Host "4. Testing application endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{ path = "/"; name = "Home page" },
    @{ path = "/login"; name = "Login page" },
    @{ path = "/profile"; name = "Profile page" },
    @{ path = "/settings"; name = "Settings page" }
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000$($endpoint.path)" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✓ $($endpoint.name) - OK" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ $($endpoint.name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ✗ $($endpoint.name) - Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "If all checks pass, the authentication system should be working." -ForegroundColor White
Write-Host "Try signing in with Google OAuth at http://localhost:3000/login" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure Google OAuth in Google Cloud Console" -ForegroundColor White
Write-Host "2. Enable Google provider in Supabase Auth settings" -ForegroundColor White
Write-Host "3. Run database migrations if needed" -ForegroundColor White
Write-Host "4. Test sign-in and profile pages" -ForegroundColor White
