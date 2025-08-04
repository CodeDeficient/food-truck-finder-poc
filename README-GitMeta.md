# GitMeta - Git Branch Metadata Analyzer

## Overview

`Get-GitBranchMeta.ps1` is a comprehensive PowerShell script that analyzes Git branches and collects detailed metadata including commit information, author statistics, and branch relationships. This tool is designed for repository analysis, reporting, and understanding branch structure in Git repositories.

## Prerequisites

### Required Software
- **Git**: Must be installed and available in the system PATH
- **PowerShell**: Version 5.1 or higher required
- **Repository Access**: Must be run from within a Git repository

### System Requirements
- Windows PowerShell 5.1+ or PowerShell Core 6.0+
- Git 2.0 or higher recommended
- Sufficient system memory for processing large repositories (see Performance Tips)

## Key Features

- ✅ **Comprehensive Branch Analysis** - Analyzes all remote branches with detailed metadata
- ✅ **Author Statistics** - Identifies top contributors per branch with commit counts
- ✅ **Branch Classification** - Automatically categorizes branches (main, feature, hotfix, release, etc.)
- ✅ **Merge Base Calculation** - Determines merge base and commits since branching
- ✅ **Robust Error Handling** - Continues processing despite individual branch failures
- ✅ **Multiple Export Formats** - Supports JSON and CSV output formats
- ✅ **Timeout Protection** - Uses `Invoke-GitSafe` for reliable Git command execution
- ✅ **Detailed Progress Reporting** - Provides comprehensive execution summaries and error reports

## Installation

1. Download the required files to your local directory:
   - `Get-GitBranchMeta.ps1` (main script)
   - `Invoke-GitSafe.ps1` (dependency helper)

2. Ensure both files are in the same directory or adjust the path in line 88 of `Get-GitBranchMeta.ps1`

3. Set execution policy if needed:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

## Usage Examples

### Basic Analysis (Console Output)

```powershell
# Run from within a Git repository
.\Get-GitBranchMeta.ps1
```

**Expected Output:**
```
Analyzing git branches...
Found 12 valid branches to process
Processing branch: main
Processing branch: feature/user-auth
Processing branch: hotfix/security-patch

Branch Analysis Results:
========================
BranchName       BranchType LatestHash LatestMsg                    CommitsSinceBase TopAuthors
----------       ---------- ---------- ----------                   ---------------- ----------
main             main       a1b2c3d    Update README with examples  0                {@{Author=John Doe <john@ex.com>; Count=15}}
feature/user-auth feature   e4f5g6h    Add OAuth integration        8                {@{Author=Jane Smith <jane@ex.com>; Count=5}}
```

### Export to JSON

```powershell
.\Get-GitBranchMeta.ps1 -OutFile "branch-analysis.json" -Format "Json"
```

**Sample JSON Output:**
```json
[
  {
    "BranchName": "feature/user-auth",
    "BranchType": "feature",
    "LatestHash": "e4f5g6h89",
    "LatestMsg": "Add OAuth integration",
    "MergeBaseHash": "a1b2c3d45",
    "CommitsSinceBase": 8,
    "TopAuthors": [
      {
        "Author": "Jane Smith <jane@example.com>",
        "Count": 5
      },
      {
        "Author": "Bob Wilson <bob@example.com>",
        "Count": 3
      }
    ]
  }
]
```

### Export to CSV

```powershell
.\Get-GitBranchMeta.ps1 -OutFile "branch-report.csv" -Format "Csv"
```

**Sample CSV Output:**
```csv
"BranchName","BranchType","LatestHash","LatestMsg","MergeBaseHash","CommitsSinceBase","TopAuthors"
"feature/user-auth","feature","e4f5g6h89","Add OAuth integration","a1b2c3d45","8","Jane Smith <jane@example.com>:5; Bob Wilson <bob@example.com>:3"
```

### Advanced Configuration

```powershell
# Custom configuration for large repositories
.\Get-GitBranchMeta.ps1 `
    -MainBranch "master" `
    -MaxAuthors 10 `
    -OutFile "detailed-analysis.json" `
    -Format "Json" `
    -TimeoutSec 120
```

## Parameters Reference

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `MainBranch` | String | "main" | - | Reference branch for merge base calculations |
| `MaxAuthors` | Integer | 5 | 1-50 | Maximum number of top authors per branch |
| `OutFile` | String | - | - | Output file path (optional, displays in console if not specified) |
| `Format` | String | "Json" | Json, Csv | Export format for file output |
| `TimeoutSec` | Integer | 30 | 5-300 | Timeout in seconds for each Git command |

## Field Explanations

### Output Schema

Each branch analysis returns the following fields:

- **`BranchName`**: The branch name (without `origin/` prefix)
- **`BranchType`**: Automatically classified branch type:
  - `main` - Main/master branch
  - `feature` - Feature branches (starts with `feature/` or `feat/`)
  - `hotfix` - Hotfix branches (starts with `hotfix/` or `fix/`)
  - `release` - Release branches (starts with `release/` or `rel/`)
  - `develop` - Development branch (exactly `develop` or `dev`)
  - `other` - All other branches
- **`LatestHash`**: SHA hash of the latest commit on the branch
- **`LatestMsg`**: Commit message of the latest commit
- **`MergeBaseHash`**: SHA hash of the merge base with the main branch
- **`CommitsSinceBase`**: Number of commits since branching from main
- **`TopAuthors`**: Array of author objects with commit counts

### Author Information

Each author entry contains:
- **`Author`**: Full author name and email (e.g., "John Doe <john@example.com>")
- **`Count`**: Number of commits by this author on the branch

## Error Handling & Troubleshooting

### Common Issues

#### 1. "Not in a git repository"
```powershell
# Error Message
Not in a git repository or git is not available

# Solution
cd /path/to/your/git/repository
.\Get-GitBranchMeta.ps1
```

#### 2. Git Command Timeouts
```powershell
# For very large repositories, increase timeout
.\Get-GitBranchMeta.ps1 -TimeoutSec 120
```

#### 3. Missing Branches
```powershell
# Ensure remote branches are up to date
git fetch --all
.\Get-GitBranchMeta.ps1
```

### Error Reporting

The script provides comprehensive error reporting:

```
=== ANALYSIS SUMMARY ===
Total branches discovered: 15
Successfully processed: 12
Skipped due to errors: 3
Total errors encountered: 5

=== ERROR SUMMARY ===
Branch Processing Errors: 3
  [System.Exception] Branch not found (Count: 2)
    Affected branches: old-feature-branch, deleted-branch

Timeout Errors: 2
  [System.TimeoutException] Git command timed out after 30 seconds (Count: 2)
    Affected branches: very-large-feature
```

### Error Log Export

When using file output, detailed error logs are automatically exported:
```powershell
# If you export to "analysis.json", errors are saved to "analysis_errors.json"
.\Get-GitBranchMeta.ps1 -OutFile "analysis.json"
# Creates: analysis.json + analysis_errors.json
```

## Performance Tips

### For Large Repositories

1. **Increase Timeout**: Large repositories may need longer timeouts
   ```powershell
   .\Get-GitBranchMeta.ps1 -TimeoutSec 120
   ```

2. **Reduce Author Count**: Limit authors to improve performance
   ```powershell
   .\Get-GitBranchMeta.ps1 -MaxAuthors 3
   ```

3. **Run During Off-Peak Hours**: Network-heavy operations work better with stable connections

4. **Monitor System Resources**: Large repositories may consume significant memory

### Expected Performance

| Repository Size | Branches | Estimated Time | Recommended Timeout |
|----------------|----------|----------------|-------------------|
| Small (< 100 commits) | < 10 | 10-30 seconds | 30 seconds (default) |
| Medium (< 1000 commits) | 10-50 | 1-3 minutes | 60 seconds |
| Large (< 10k commits) | 50-200 | 3-10 minutes | 120 seconds |
| Very Large (> 10k commits) | > 200 | 10+ minutes | 300 seconds |

### Optimization Strategies

1. **Fetch Before Running**: Ensure local repository is up-to-date
   ```powershell
   git fetch --all --prune
   .\Get-GitBranchMeta.ps1
   ```

2. **Clean Up Stale Branches**: Remove obsolete remote branches
   ```powershell
   git remote prune origin
   ```

3. **Use Specific Branch Patterns**: Future versions may support branch filtering

## Integration Examples

### CI/CD Pipeline Integration

```powershell
# Generate branch report for build pipeline
$reportPath = "artifacts/branch-analysis-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
.\Get-GitBranchMeta.ps1 -OutFile $reportPath -Format "Json" -TimeoutSec 60

# Upload to build artifacts
if (Test-Path $reportPath) {
    Write-Host "Branch analysis completed: $reportPath"
    # Add to pipeline artifacts
}
```

### Automated Reporting

```powershell
# Weekly branch analysis report
$weeklyReport = "reports/weekly-branch-analysis-$(Get-Date -Format 'yyyy-MM-dd').csv"
.\Get-GitBranchMeta.ps1 -OutFile $weeklyReport -Format "Csv" -MaxAuthors 10

# Email report or upload to documentation system
```

### Code Review Integration

```powershell
# Analyze specific branches for code review metrics
.\Get-GitBranchMeta.ps1 -MainBranch "develop" -MaxAuthors 5 | 
    Where-Object { $_.BranchType -eq "feature" -and $_.CommitsSinceBase -gt 10 }
```

## Verification Steps

To verify the script is working correctly:

1. **Basic Functionality Test**:
   ```powershell
   .\Get-GitBranchMeta.ps1
   # Should display branch analysis results in console
   ```

2. **JSON Export Test**:
   ```powershell
   .\Get-GitBranchMeta.ps1 -OutFile "test.json"
   Get-Content "test.json" | ConvertFrom-Json
   # Should display structured JSON data
   ```

3. **CSV Export Test**:
   ```powershell
   .\Get-GitBranchMeta.ps1 -OutFile "test.csv" -Format "Csv"
   Import-Csv "test.csv"
   # Should display tabular data
   ```

4. **Error Handling Test**:
   ```powershell
   # Test with very short timeout to trigger timeout handling
   .\Get-GitBranchMeta.ps1 -TimeoutSec 1
   # Should show timeout warnings but continue processing
   ```

## Version Information

- **Version**: 1.0
- **Author**: PowerShell Git Branch Analyzer
- **Dependencies**: Invoke-GitSafe.ps1
- **Last Updated**: 2024
- **Compatibility**: PowerShell 5.1+, Git 2.0+

## License & Support

This tool is provided as-is for repository analysis purposes. For issues or feature requests, please refer to your organization's internal support channels or development team.

---

**Quick Start Checklist:**
- [ ] Git installed and in PATH
- [ ] PowerShell 5.1 or higher
- [ ] Both script files in same directory
- [ ] Current directory is a Git repository
- [ ] Run: `.\Get-GitBranchMeta.ps1`
