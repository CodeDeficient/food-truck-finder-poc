<#
.SYNOPSIS
Gathers metadata for git branches including commit information and top authors.

.DESCRIPTION
This script analyzes git branches and collects comprehensive metadata including branch type,
latest commit information, merge base details, commit counts, and top contributing authors.
The output can be exported to JSON or CSV format.

.PARAMETER MainBranch
The main branch to use as reference for merge base calculations.
Default: 'main'

.PARAMETER MaxAuthors
Maximum number of top authors to include in the results per branch.
Default: 5

.PARAMETER OutFile
Output file path. If not specified, results are displayed in console.

.PARAMETER Format
Output format for file export. Valid values: 'Json', 'Csv'
Default: 'Json'

.PARAMETER TimeoutSec
Timeout in seconds for each git command execution.
Default: 30

.EXAMPLE
.\Get-GitBranchMeta.ps1
Gets branch metadata for all branches using default settings.

.EXAMPLE
.\Get-GitBranchMeta.ps1 -MainBranch "master" -MaxAuthors 3 -OutFile "branches.json" -Format "Json"
Gets branch metadata using 'master' as main branch, top 3 authors, and exports to JSON.

.EXAMPLE
.\Get-GitBranchMeta.ps1 -OutFile "report.csv" -Format "Csv" -TimeoutSec 60
Exports branch metadata to CSV with 60-second timeout for git commands.

.NOTES
Author: PowerShell Git Branch Analyzer
Version: 1.0
Requires: Git executable in PATH
#>

[CmdletBinding()]
param(
    [Parameter(HelpMessage = "The main branch to use as reference for merge base calculations")]
    [string]$MainBranch = "main",
    
    [Parameter(HelpMessage = "Maximum number of top authors to include per branch")]
    [ValidateRange(1, 50)]
    [int]$MaxAuthors = 5,
    
    [Parameter(HelpMessage = "Output file path for exporting results")]
    [string]$OutFile,
    
    [Parameter(HelpMessage = "Output format for file export (Json or Csv)")]
    [ValidateSet("Json", "Csv")]
    [string]$Format = "Json",
    
    [Parameter(HelpMessage = "Timeout in seconds for each git command execution")]
    [ValidateRange(5, 300)]
    [int]$TimeoutSec = 30
)

# Initialize error collection for robust error handling
$script:ErrorCollection = @()

# Define the output schema
class GitBranchMetadata {
    [string]$BranchName
    [string]$BranchType
    [string]$LatestHash
    [string]$LatestMsg
    [string]$MergeBaseHash
    [int]$CommitsSinceBase
    [object[]]$TopAuthors  # Array of objects with Author & Count properties
}

class AuthorInfo {
    [string]$Author
    [int]$Count
}

# Import the Invoke-GitSafe function
. "$PSScriptRoot\Invoke-GitSafe.ps1"

# Function to add errors to the collection and continue processing
function Add-ErrorRecord {
    param(
        [string]$Context,
        [System.Exception]$Exception,
        [string]$BranchName = ""
    )
    
    $errorDetails = @{
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        Context = $Context
        BranchName = $BranchName
        Exception = $Exception.GetType().Name
        Message = $Exception.Message
    }
    
    $script:ErrorCollection += $errorDetails
    Write-Warning "[$Context] Error processing branch '$BranchName': $($Exception.Message)"
}

# Function to check if a branch reference is orphaned or invalid
function Test-ValidBranchReference {
    param([string]$BranchRef)
    
    # Skip orphaned remote HEAD pointers and invalid references
    if ($BranchRef -match "HEAD" -or 
        $BranchRef -match "\-\>" -or 
        $BranchRef -match "origin/HEAD" -or
        [string]::IsNullOrWhiteSpace($BranchRef)) {
        return $false
    }
    
    return $true
}

function Invoke-GitCommand {
    param(
        [string]$Arguments,
        [int]$TimeoutSeconds = $TimeoutSec
    )
    
    try {
        return Invoke-GitSafe -GitArgs $Arguments -TimeoutSec $TimeoutSeconds
    }
    catch {
        Write-Error "Failed to execute git command: $($_.Exception.Message)"
        return $null
    }
}

function Get-BranchType {
    param([string]$BranchName, [string]$MainBranch)
    
    if ($BranchName -eq $MainBranch) {
        return "main"
    }
    elseif ($BranchName -match "^(feature|feat)/") {
        return "feature"
    }
    elseif ($BranchName -match "^(hotfix|fix)/") {
        return "hotfix"
    }
    elseif ($BranchName -match "^(release|rel)/") {
        return "release"
    }
    elseif ($BranchName -match "^(develop|dev)$") {
        return "develop"
    }
    else {
        return "other"
    }
}

function Get-TopAuthors {
    param(
        [string]$BranchName,
        [string]$MergeBaseHash,
        [int]$MaxAuthors,
        [int]$TimeoutSeconds = $TimeoutSec
    )
    
    # Use git shortlog -sne as specified in Step 5
    $authorsCmd = if ($MergeBaseHash) {
        "shortlog -sne $MergeBaseHash..$BranchName"
    } else {
        "shortlog -sne $BranchName"
    }
    
    $authorsOutput = Invoke-GitCommand -Arguments $authorsCmd -TimeoutSeconds $TimeoutSeconds
    
    if (-not $authorsOutput) {
        return @()
    }
    
    # Parse lines like "  14\tJohn Doe <john@ex.com>"
    $topAuthors = @()
    $authorsOutput -split "`n" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and $line -match '^\s*(\d+)\s+(.+)$') {
            $count = [int]$matches[1]
            $author = $matches[2].Trim()
            
            $topAuthors += [AuthorInfo]@{
                Author = $author
                Count = $count
            }
        }
    }
    
    # Select top MaxAuthors (git shortlog already sorts by count descending)
    $result = $topAuthors | Select-Object -First $MaxAuthors
    
    # Verification: Log the sum for debugging
    $totalCommits = ($result | Measure-Object -Property Count -Sum).Sum
    Write-Verbose "Top authors total commits: $totalCommits for branch $BranchName"
    
    return $result
}

# Main execution
Write-Host "Analyzing git branches..." -ForegroundColor Green

# Check if we're in a git repository
$gitCheck = Invoke-GitCommand -Arguments "rev-parse --is-inside-work-tree"
if (-not $gitCheck) {
    Write-Error "Not in a git repository or git is not available"
    exit 1
}

# Get all branches with robust error handling
try {
    $branchesOutput = Invoke-GitCommand -Arguments 'branch -r --format="%(refname:short)"' -TimeoutSeconds $TimeoutSec
    if (-not $branchesOutput) {
        throw "No branch output received from git command"
    }
}
catch {
    Add-ErrorRecord -Context "Branch List Retrieval" -Exception $_.Exception
    Write-Error "Failed to get branch list: $($_.Exception.Message)"
    exit 1
}

# Filter branches and skip orphaned remote HEAD pointers
$allBranchRefs = $branchesOutput -split "`n" | Where-Object { $_ -and $_.Trim() }
$branches = @()

foreach ($branchRef in $allBranchRefs) {
    try {
        $cleanRef = $branchRef.Trim()
        
        # Skip orphaned remote HEAD pointers and invalid references
        if (-not (Test-ValidBranchReference -BranchRef $cleanRef)) {
            Write-Verbose "Skipping invalid/orphaned branch reference: '$cleanRef'"
            continue
        }
        
        # Extract branch name from origin/branch-name format
        if ($cleanRef -match "^origin/(.+)$" -and $cleanRef -ne "origin") {
            $branchName = $matches[1]
            
            # Additional validation: ensure branch name is not just whitespace or special chars
            if (-not ([string]::IsNullOrWhiteSpace($branchName)) -and $branchName -notmatch "^[\s\-\>]+$") {
                $branches += $branchName
            } else {
                Write-Verbose "Skipping invalid branch name: '$branchName'"
            }
        }
    }
    catch {
        Add-ErrorRecord -Context "Branch Filtering" -Exception $_.Exception -BranchName $branchRef
        continue
    }
}

Write-Host "Found $($branches.Count) valid branches to process" -ForegroundColor Cyan
if ($script:ErrorCollection.Count -gt 0) {
    Write-Warning "Encountered $($script:ErrorCollection.Count) errors during branch discovery"
}

$results = @()
$processedCount = 0
$skippedCount = 0

# Process each branch with comprehensive error handling
foreach ($branch in $branches) {
    try {
        Write-Host "Processing branch: $branch" -ForegroundColor Yellow
        
        # Initialize branch metadata with defaults
        $latestHash = $null
        $latestMsg = $null
        $mergeBaseHash = $null
        $commitsSinceBase = 0
        $topAuthors = @()
        
        # Get latest commit info with timeout
        try {
            $latestHash = Invoke-GitCommand -Arguments "rev-parse origin/$branch" -TimeoutSeconds $TimeoutSec
        }
        catch {
            Add-ErrorRecord -Context "Latest Hash Retrieval" -Exception $_.Exception -BranchName $branch
        }
        
        try {
            $latestMsg = Invoke-GitCommand -Arguments "log -1 --pretty=format:'%s' origin/$branch" -TimeoutSeconds $TimeoutSec
        }
        catch {
            Add-ErrorRecord -Context "Latest Message Retrieval" -Exception $_.Exception -BranchName $branch
        }
        
        # Get merge base with main branch (skip for main branch itself)
        if ($branch -ne $MainBranch) {
            try {
                $mergeBaseHash = Invoke-GitCommand -Arguments "merge-base origin/$MainBranch origin/$branch" -TimeoutSeconds $TimeoutSec
                
                if ($mergeBaseHash) {
                    try {
                        $commitCount = Invoke-GitCommand -Arguments "rev-list --count $mergeBaseHash..origin/$branch" -TimeoutSeconds $TimeoutSec
                        if ($commitCount -match '^\d+$') {
                            $commitsSinceBase = [int]$commitCount
                        }
                    }
                    catch {
                        Add-ErrorRecord -Context "Commit Count Calculation" -Exception $_.Exception -BranchName $branch
                    }
                }
            }
            catch {
                Add-ErrorRecord -Context "Merge Base Calculation" -Exception $_.Exception -BranchName $branch
            }
        }
        
        # Get top authors with error handling
        try {
            $topAuthors = Get-TopAuthors -BranchName "origin/$branch" -MergeBaseHash $mergeBaseHash -MaxAuthors $MaxAuthors -TimeoutSeconds $TimeoutSec
        }
        catch {
            Add-ErrorRecord -Context "Top Authors Retrieval" -Exception $_.Exception -BranchName $branch
            $topAuthors = @()  # Ensure we have an empty array if this fails
        }
        
        # Verification: Check that sum of author counts equals CommitsSinceBase
        if ($topAuthors -and $commitsSinceBase -gt 0) {
            try {
                $topAuthorsSum = ($topAuthors | Measure-Object -Property Count -Sum).Sum
                if ($topAuthorsSum -ne $commitsSinceBase) {
                    Write-Warning "Verification failed for branch '$branch': Top authors sum ($topAuthorsSum) != CommitsSinceBase ($commitsSinceBase)"
                } else {
                    Write-Verbose "Verification passed for branch '$branch': Sum matches CommitsSinceBase ($commitsSinceBase)"
                }
            }
            catch {
                Add-ErrorRecord -Context "Author Count Verification" -Exception $_.Exception -BranchName $branch
            }
        }
        
        # Create the result object
        $branchMetadata = [GitBranchMetadata]@{
            BranchName = $branch
            BranchType = Get-BranchType -BranchName $branch -MainBranch $MainBranch
            LatestHash = $latestHash
            LatestMsg = $latestMsg
            MergeBaseHash = $mergeBaseHash
            CommitsSinceBase = $commitsSinceBase
            TopAuthors = $topAuthors
        }
        
        $results += $branchMetadata
        $processedCount++
        
        Write-Verbose "Successfully processed branch: $branch"
    }
    catch {
        # Catch-all for any unhandled exceptions in branch processing
        Add-ErrorRecord -Context "Branch Processing" -Exception $_.Exception -BranchName $branch
        $skippedCount++
        
        Write-Warning "Skipping branch '$branch' due to critical error: $($_.Exception.Message)"
        continue
    }
}

# Output results
if ($OutFile) {
    Write-Host "Exporting results to: $OutFile" -ForegroundColor Green
    
    switch ($Format.ToLower()) {
        "json" {
            $results | ConvertTo-Json -Depth 10 | Out-File -FilePath $OutFile -Encoding UTF8
            Write-Host "Results exported to JSON format" -ForegroundColor Green
        }
        "csv" {
            # Flatten the TopAuthors for CSV export
            $csvData = $results | ForEach-Object {
                $branch = $_
                [PSCustomObject]@{
                    BranchName = $branch.BranchName
                    BranchType = $branch.BranchType
                    LatestHash = $branch.LatestHash
                    LatestMsg = $branch.LatestMsg
                    MergeBaseHash = $branch.MergeBaseHash
                    CommitsSinceBase = $branch.CommitsSinceBase
                    TopAuthors = ($branch.TopAuthors | ForEach-Object { "$($_.Author):$($_.Count)" }) -join "; "
                }
            }
            $csvData | Export-Csv -Path $OutFile -NoTypeInformation -Encoding UTF8
            Write-Host "Results exported to CSV format" -ForegroundColor Green
        }
    }
} else {
    Write-Host "`nBranch Analysis Results:" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    $results | Format-Table -AutoSize
}

# Comprehensive error reporting and summary
Write-Host "`n" -ForegroundColor White
Write-Host "=== ANALYSIS SUMMARY ===" -ForegroundColor Cyan
Write-Host "Total branches discovered: $($branches.Count)" -ForegroundColor White
Write-Host "Successfully processed: $processedCount" -ForegroundColor Green
Write-Host "Skipped due to errors: $skippedCount" -ForegroundColor Yellow
Write-Host "Total errors encountered: $($script:ErrorCollection.Count)" -ForegroundColor $(if ($script:ErrorCollection.Count -gt 0) { "Red" } else { "Green" })

# Display error summary if any errors occurred
if ($script:ErrorCollection.Count -gt 0) {
    Write-Host "`n=== ERROR SUMMARY ===" -ForegroundColor Red
    
    # Group errors by context
    $errorsByContext = $script:ErrorCollection | Group-Object -Property Context
    
    foreach ($contextGroup in $errorsByContext) {
        Write-Host "`n$($contextGroup.Name) Errors: $($contextGroup.Count)" -ForegroundColor Yellow
        
        # Show top 3 most frequent error messages in this context
        $topErrors = $contextGroup.Group | Group-Object -Property Message | 
                     Sort-Object Count -Descending | Select-Object -First 3
        
        foreach ($errorGroup in $topErrors) {
            $sampleError = $errorGroup.Group[0]
            Write-Host "  [$($sampleError.Exception)] $($errorGroup.Name) (Count: $($errorGroup.Count))" -ForegroundColor Red
            
            # Show affected branches for this error (up to 3)
            $affectedBranches = $errorGroup.Group | Where-Object { $_.BranchName } | 
                                Select-Object -First 3 -ExpandProperty BranchName
            if ($affectedBranches) {
                Write-Host "    Affected branches: $($affectedBranches -join ', ')" -ForegroundColor DarkRed
            }
        }
    }
    
    # Optionally export detailed error log
    if ($OutFile) {
        $errorLogPath = $OutFile -replace '\.[^.]+$', '_errors.json'
        try {
            $script:ErrorCollection | ConvertTo-Json -Depth 5 | Out-File -FilePath $errorLogPath -Encoding UTF8
            Write-Host "`nDetailed error log exported to: $errorLogPath" -ForegroundColor Cyan
        }
        catch {
            Write-Warning "Failed to export error log: $($_.Exception.Message)"
        }
    }
    
    Write-Host "`nNote: Script continued processing despite errors to maximize data collection." -ForegroundColor Yellow
} else {
    Write-Host "`nNo errors encountered during processing!" -ForegroundColor Green
}

Write-Host "`nAnalysis complete. Successfully processed $($results.Count) branches with $($script:ErrorCollection.Count) errors." -ForegroundColor Green
