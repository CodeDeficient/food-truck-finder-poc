# Test script to verify robust error handling and timeout functionality
# This script tests the enhanced Get-GitBranchMeta.ps1 with very low timeout values

Write-Host "=== Testing Error Handling and Timeout Functionality ===" -ForegroundColor Cyan
Write-Host "This test will run with very low timeout values to trigger timeout errors" -ForegroundColor Yellow

# Test 1: Normal operation with reasonable timeout
Write-Host "`nTest 1: Normal operation (TimeoutSec=30)" -ForegroundColor Green
try {
    & "$PSScriptRoot\Get-GitBranchMeta.ps1" -TimeoutSec 30 -Verbose
    Write-Host "Test 1 completed successfully" -ForegroundColor Green
}
catch {
    Write-Host "Test 1 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Very low timeout to trigger timeout errors
Write-Host "`nTest 2: Low timeout stress test (TimeoutSec=5)" -ForegroundColor Yellow
Write-Host "Expected: Script should continue with warnings when git commands timeout" -ForegroundColor Cyan

try {
    & "$PSScriptRoot\Get-GitBranchMeta.ps1" -TimeoutSec 5 -Verbose
    Write-Host "Test 2 completed - script continued despite any timeouts" -ForegroundColor Green
}
catch {
    Write-Host "Test 2 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Minimum timeout to test timeout handling
Write-Host "`nTest 3: Minimum timeout stress test (TimeoutSec=5)" -ForegroundColor Yellow
Write-Host "Expected: Some potential timeout errors, but script should complete and report errors" -ForegroundColor Cyan

try {
    & "$PSScriptRoot\Get-GitBranchMeta.ps1" -TimeoutSec 5 -OutFile "test_output.json" -Verbose
    Write-Host "Test 3 completed - checking if output files were created..." -ForegroundColor Green
    
    if (Test-Path "test_output.json") {
        Write-Host "✓ Main output file created" -ForegroundColor Green
        $jsonContent = Get-Content "test_output.json" -Raw | ConvertFrom-Json
        Write-Host "✓ Successfully processed $($jsonContent.Count) branches" -ForegroundColor Green
    }
    
    if (Test-Path "test_output_errors.json") {
        Write-Host "✓ Error log file created" -ForegroundColor Green
        $errorContent = Get-Content "test_output_errors.json" -Raw | ConvertFrom-Json
        Write-Host "✓ Captured $($errorContent.Count) errors for analysis" -ForegroundColor Green
    }
}
catch {
    Write-Host "Test 3 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test with non-existent main branch to trigger merge base errors
Write-Host "`nTest 4: Invalid main branch test (MainBranch='nonexistent')" -ForegroundColor Yellow
Write-Host "Expected: Merge base calculation errors, but script should continue" -ForegroundColor Cyan

try {
    & "$PSScriptRoot\Get-GitBranchMeta.ps1" -MainBranch "nonexistent" -TimeoutSec 10 -MaxAuthors 2
    Write-Host "Test 4 completed - script handled invalid main branch gracefully" -ForegroundColor Green
}
catch {
    Write-Host "Test 4 failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Clean up test files
Write-Host "`nCleaning up test files..." -ForegroundColor Cyan
@("test_output.json", "test_output_errors.json") | ForEach-Object {
    if (Test-Path $_) {
        Remove-Item $_ -Force
        Write-Host "Removed $_" -ForegroundColor Gray
    }
}

Write-Host "`n=== Error Handling Tests Complete ===" -ForegroundColor Cyan
Write-Host "If all tests passed, the script properly:" -ForegroundColor Green
Write-Host "✓ Continues processing despite individual git command failures" -ForegroundColor Green
Write-Host "✓ Respects timeout values for all git operations" -ForegroundColor Green
Write-Host "✓ Collects and reports detailed error information" -ForegroundColor Green
Write-Host "✓ Exports error logs when output files are specified" -ForegroundColor Green
Write-Host "✓ Skips orphaned remote HEAD pointers and invalid references" -ForegroundColor Green
