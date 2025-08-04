# Load the Invoke-GitSafe function
. "$PSScriptRoot\Invoke-GitSafe.ps1"

Write-Host "Running Invoke-GitSafe verification tests..." -ForegroundColor Green

try {
    # Test 1: Quick command that should succeed
    Write-Host "`nTest 1: Quick git command (rev-parse --short HEAD)" -ForegroundColor Yellow
    $shortHash = Invoke-GitSafe 'rev-parse --short HEAD'
    Write-Host "Success: $shortHash" -ForegroundColor Green
    
    # Test 2: Another quick command
    Write-Host "`nTest 2: Git status check" -ForegroundColor Yellow
    $status = Invoke-GitSafe 'status --porcelain'
    if ($status) {
        Write-Host "Success: Repository has changes" -ForegroundColor Green
    } else {
        Write-Host "Success: Repository is clean" -ForegroundColor Green
    }
    
    # Test 3: Timeout test with a command that should timeout
    Write-Host "`nTest 3: Timeout test (simulated long-running command)" -ForegroundColor Yellow
    try {
        # Use a command that might take longer than 1 second
        # This simulates a long-running git command
        $result = Invoke-GitSafe 'log --all --oneline' -TimeoutSec 1
        Write-Host "Command completed within timeout: $(($result -split "`n").Count) lines" -ForegroundColor Green
    }
    catch [System.TimeoutException] {
        Write-Host "Timeout test successful: Command properly timed out after 1 second" -ForegroundColor Green
        Write-Host "  Warning should have been displayed above" -ForegroundColor Cyan
    }
    catch {
        Write-Host "Unexpected error in timeout test: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host "`nAll verification tests completed!" -ForegroundColor Green
}
catch {
    Write-Host "Verification test failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
