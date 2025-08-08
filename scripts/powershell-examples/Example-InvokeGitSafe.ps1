# Example usage of Invoke-GitSafe function
# Load the function
. "$PSScriptRoot\Invoke-GitSafe.ps1"

Write-Host "=== Invoke-GitSafe Examples ===" -ForegroundColor Cyan

# Example 1: Basic usage - get current commit hash
Write-Host "`n1. Getting current commit hash:" -ForegroundColor Yellow
try {
    $hash = Invoke-GitSafe 'rev-parse --short HEAD'
    Write-Host "   Current commit: $hash" -ForegroundColor Green
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 2: Check repository status
Write-Host "`n2. Checking repository status:" -ForegroundColor Yellow
try {
    $status = Invoke-GitSafe 'status --porcelain'
    if ($status) {
        Write-Host "   Repository has uncommitted changes:" -ForegroundColor Green
        $status -split "`n" | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "   Repository is clean" -ForegroundColor Green
    }
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 3: Get branch information
Write-Host "`n3. Getting current branch:" -ForegroundColor Yellow
try {
    $branch = Invoke-GitSafe 'branch --show-current'
    Write-Host "   Current branch: $branch" -ForegroundColor Green
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 4: Get last few commits
Write-Host "`n4. Getting last 3 commits:" -ForegroundColor Yellow
try {
    $commits = Invoke-GitSafe 'log --oneline -n 3'
    Write-Host "   Recent commits:" -ForegroundColor Green
    $commits -split "`n" | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 5: Demonstrate timeout with a custom timeout value
Write-Host "`n5. Demonstrating timeout (5 seconds):" -ForegroundColor Yellow
try {
    $result = Invoke-GitSafe 'log --all --oneline --graph' -TimeoutSec 5
    $lineCount = ($result -split "`n").Count
    Write-Host "   Command completed successfully: $lineCount lines returned" -ForegroundColor Green
}
catch [System.TimeoutException] {
    Write-Host "   Command timed out as expected" -ForegroundColor Green
}
catch {
    Write-Host "   Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 6: Working with specific directory
Write-Host "`n6. Working with specific directory (current directory):" -ForegroundColor Yellow
try {
    $remotes = Invoke-GitSafe 'remote -v' -WorkingDirectory (Get-Location).Path
    if ($remotes) {
        Write-Host "   Remote repositories:" -ForegroundColor Green
        $remotes -split "`n" | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "   No remote repositories configured" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Example 7: Verbose output demonstration
Write-Host "`n7. Demonstrating verbose output:" -ForegroundColor Yellow
try {
    $tags = Invoke-GitSafe 'tag --list' -Verbose
    if ($tags) {
        Write-Host "   Available tags:" -ForegroundColor Green
        $tags -split "`n" | Select-Object -First 5 | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "   No tags found" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Examples completed ===" -ForegroundColor Cyan
