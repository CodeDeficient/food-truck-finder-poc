<#
.SYNOPSIS
A reusable function that runs git commands with timeout enforcement and proper error handling.

.DESCRIPTION
This function executes git commands using Start-Process with a timeout mechanism via Wait-Process.
It runs git with --no-pager and -c core.pager=cat to prevent pager issues in automation scenarios.
On timeout, it throws a handled exception and adds a warning record.

.PARAMETER GitArgs
The git command arguments to execute (e.g., 'rev-parse --short HEAD', 'status --porcelain')

.PARAMETER TimeoutSec
Timeout in seconds for the git command execution. Default is 30 seconds.

.PARAMETER WorkingDirectory
Working directory to execute the git command in. Default is current directory.

.EXAMPLE
Invoke-GitSafe 'rev-parse --short HEAD'
Gets the short commit hash of the current HEAD.

.EXAMPLE
Invoke-GitSafe 'status --porcelain' -TimeoutSec 10
Gets the git status with a 10-second timeout.

.EXAMPLE
Invoke-GitSafe 'log --oneline -n 5' -TimeoutSec 15 -WorkingDirectory 'C:\MyRepo'
Gets the last 5 commits from a specific directory with a 15-second timeout.

.NOTES
Author: PowerShell Git Helper
Version: 1.0
Requires: Git executable in PATH
#>

function Invoke-GitSafe {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory = $true, Position = 0, HelpMessage = "Git command arguments to execute")]
        [string]$GitArgs,
        
        [Parameter(HelpMessage = "Timeout in seconds for git command execution")]
        [ValidateRange(1, 300)]
        [int]$TimeoutSec = 30,
        
        [Parameter(HelpMessage = "Working directory to execute git command in")]
        [string]$WorkingDirectory = (Get-Location).Path
    )
    
    Write-Verbose "Executing git command: git --no-pager -c core.pager=cat $GitArgs"
    Write-Verbose "Working directory: $WorkingDirectory"
    Write-Verbose "Timeout: $TimeoutSec seconds"
    
    try {
        # Prepare the process start info
        $processStartInfo = New-Object System.Diagnostics.ProcessStartInfo
        $processStartInfo.FileName = "git"
        $processStartInfo.Arguments = "--no-pager -c core.pager=cat $GitArgs"
        $processStartInfo.WorkingDirectory = $WorkingDirectory
        $processStartInfo.RedirectStandardOutput = $true
        $processStartInfo.RedirectStandardError = $true
        $processStartInfo.UseShellExecute = $false
        $processStartInfo.CreateNoWindow = $true
        
        # Start the process
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $processStartInfo
        
        Write-Verbose "Starting git process..."
        $started = $process.Start()
        
        if (-not $started) {
            throw "Failed to start git process"
        }
        
        # Wait for the process to complete with timeout
        $completed = $process.WaitForExit($TimeoutSec * 1000)
        
        if (-not $completed) {
            # Process timed out
            Write-Warning "Git command timed out after $TimeoutSec seconds: git $GitArgs"
            
            try {
                # Try to kill the process gracefully first
                if (-not $process.HasExited) {
                    $process.Kill()
                    $process.WaitForExit(5000)  # Wait up to 5 seconds for graceful shutdown
                }
            }
            catch {
                Write-Warning "Failed to kill timed-out git process: $($_.Exception.Message)"
            }
            
            # Throw a handled exception for timeout
            $timeoutException = New-Object System.TimeoutException("Git command timed out after $TimeoutSec seconds")
            throw $timeoutException
        }
        
        # Read the output
        $stdout = $process.StandardOutput.ReadToEnd()
        $stderr = $process.StandardError.ReadToEnd()
        $exitCode = $process.ExitCode
        
        Write-Verbose "Git process completed with exit code: $exitCode"
        
        # Check exit code
        if ($exitCode -ne 0) {
            $errorMessage = "Git command failed with exit code $exitCode"
            if ($stderr) {
                $errorMessage += ": $stderr"
            }
            throw $errorMessage
        }
        
        # Return stdout, trimmed of whitespace
        return $stdout.Trim()
    }
    catch [System.TimeoutException] {
        # Re-throw timeout exceptions as-is (already handled above)
        throw
    }
    catch {
        # Handle other exceptions
        $errorMessage = "Failed to execute git command '$GitArgs': $($_.Exception.Message)"
        Write-Error $errorMessage
        throw $errorMessage
    }
    finally {
        # Ensure process is disposed
        if ($process) {
            try {
                if (-not $process.HasExited) {
                    $process.Kill()
                }
                $process.Dispose()
            }
            catch {
                Write-Verbose "Error disposing git process: $($_.Exception.Message)"
            }
        }
    }
}

# If running directly (not dot-sourced), run verification tests
if ($MyInvocation.InvocationName -eq $MyInvocation.MyCommand.Name) {
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
}
