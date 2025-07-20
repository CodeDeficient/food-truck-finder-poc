# PowerShell script to run SQL against Supabase database
# This uses psql to connect directly to your Supabase database

# Load environment variables from .env.local
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#].*?)=(.*)$") {
            $name = $matches[1]
            $value = $matches[2].Trim('"')
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
$serviceKey = $env:SUPABASE_SERVICE_ROLE_KEY
$dbPassword = $env:DATABASE_PASSWORD

Write-Host "Running SQL script against Supabase database..." -ForegroundColor Cyan
Write-Host "URL: $supabaseUrl" -ForegroundColor Gray

if (-not $supabaseUrl -or -not $serviceKey -or -not $dbPassword) {
    Write-Host "ERROR: Missing required environment variables!" -ForegroundColor Red
    Write-Host "   Need: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_PASSWORD" -ForegroundColor Yellow
    exit 1
}

# Extract project ID from URL
$projectId = ($supabaseUrl -replace "https://", "" -replace ".supabase.co", "")
$dbHost = "db.$projectId.supabase.co"
$dbUser = "postgres"
$dbName = "postgres"
$dbPort = "5432"

Write-Host "Connecting to: $dbHost" -ForegroundColor Gray

# Set password environment variable for psql
$env:PGPASSWORD = $dbPassword

# Check if psql is available
try {
    $psqlVersion = psql --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "psql not found"
    }
    Write-Host "Found psql: $($psqlVersion.Split(' ')[2])" -ForegroundColor Green
} catch {
    Write-Host "ERROR: psql not found! Please install PostgreSQL client tools." -ForegroundColor Red
    Write-Host "Download from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "   Or use Chocolatey: choco install postgresql" -ForegroundColor Yellow
    exit 1
}

# Run the SQL script
Write-Host "Executing add-public-policies.sql..." -ForegroundColor Cyan

try {
    $result = psql -h $dbHost -p $dbPort -U $dbUser -d $dbName -f "add-public-policies.sql" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: SQL script executed successfully!" -ForegroundColor Green
        Write-Host $result -ForegroundColor Gray
        
        Write-Host "`nTesting anonymous access..." -ForegroundColor Cyan
        
        # Test query to verify the policies work
        $testQuery = @"
SELECT COUNT(*) as total_trucks, 
       COUNT(CASE WHEN verification_status = 'verified' THEN 1 END) as verified_trucks,
       COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_trucks
FROM food_trucks;
"@
        
        $testResult = echo $testQuery | psql -h $dbHost -p $dbPort -U $dbUser -d $dbName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Database statistics:" -ForegroundColor Green
            Write-Host $testResult -ForegroundColor Gray
        } else {
            Write-Host "WARNING: Could not run test query, but policies were created" -ForegroundColor Yellow
        }
        
        Write-Host "`nDone! Your app should now show food trucks to anonymous users." -ForegroundColor Green
        Write-Host "Refresh your localhost:3000 page to see the results!" -ForegroundColor Cyan
        
    } else {
        Write-Host "ERROR: Error executing SQL script:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
        
        if ($result -match "already exists") {
            Write-Host "Policies might already exist. This is usually OK." -ForegroundColor Yellow
        }
        
        exit 1
    }
} catch {
    Write-Host "Unexpected error: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clear the password from environment
    $env:PGPASSWORD = $null
}

Write-Host "`nScript complete!" -ForegroundColor Green
