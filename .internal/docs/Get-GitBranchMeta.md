# Get-GitBranchMeta PowerShell Utility

## Overview

The `Get-GitBranchMeta.ps1` script is a comprehensive PowerShell utility designed to analyze Git branches and collect detailed metadata about them. This tool is particularly useful for project management, code review processes, and understanding the development history of a repository.

## Features

- **Branch Analysis**: Automatically discovers and analyzes all remote branches in a Git repository
- **Metadata Collection**: Gathers comprehensive information including:
  - Branch type classification (main, feature, hotfix, release, develop, other)
  - Latest commit hash and message
  - Merge base calculations with the main branch
  - Commit counts since merge base
  - Top contributing authors with commit counts
- **Multiple Output Formats**: Supports both JSON and CSV export formats
- **Robust Error Handling**: Continues processing despite individual branch errors
- **Configurable Parameters**: Customizable timeout, author limits, and output preferences

## Installation

The script is located in the `scripts/` directory of the project:

```
scripts/
├── Get-GitBranchMeta.ps1
└── Invoke-GitSafe.ps1      # Required dependency
```

## Prerequisites

- PowerShell 5.1 or later
- Git executable available in PATH
- Valid Git repository (must be run from within a Git repository)

## Usage

### Basic Usage

```powershell
# Run from repository root
.\scripts\Get-GitBranchMeta.ps1
```

### Advanced Usage Examples

```powershell
# Use different main branch and limit authors
.\scripts\Get-GitBranchMeta.ps1 -MainBranch "master" -MaxAuthors 3

# Export to JSON file
.\scripts\Get-GitBranchMeta.ps1 -OutFile "branch-analysis.json" -Format "Json"

# Export to CSV with custom timeout
.\scripts\Get-GitBranchMeta.ps1 -OutFile "branches.csv" -Format "Csv" -TimeoutSec 60
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `MainBranch` | String | "main" | The main branch to use as reference for merge base calculations |
| `MaxAuthors` | Int | 5 | Maximum number of top authors to include per branch (1-50) |
| `OutFile` | String | - | Output file path for exporting results |
| `Format` | String | "Json" | Output format for file export ("Json" or "Csv") |
| `TimeoutSec` | Int | 30 | Timeout in seconds for each git command execution (5-300) |

## Output Schema

### Branch Metadata Object

```json
{
  "BranchName": "feature/new-dashboard",
  "BranchType": "feature",
  "LatestHash": "abc123...",
  "LatestMsg": "Add dashboard components",
  "MergeBaseHash": "def456...",
  "CommitsSinceBase": 15,
  "TopAuthors": [
    {
      "Author": "John Doe <john@example.com>",
      "Count": 8
    },
    {
      "Author": "Jane Smith <jane@example.com>",
      "Count": 7
    }
  ]
}
```

### Branch Type Classifications

- **main**: The main branch (matches MainBranch parameter)
- **feature**: Branches matching `^(feature|feat)/` pattern
- **hotfix**: Branches matching `^(hotfix|fix)/` pattern  
- **release**: Branches matching `^(release|rel)/` pattern
- **develop**: Branches matching `^(develop|dev)$` pattern
- **other**: All other branch patterns

## Error Handling

The script implements comprehensive error handling:

- **Continue on Error**: Processing continues even if individual branches fail
- **Error Collection**: All errors are collected and summarized at the end
- **Detailed Reporting**: Error summary shows context, frequency, and affected branches
- **Error Log Export**: When using file output, detailed error logs are exported to `*_errors.json`

## Performance Considerations

- **Timeout Protection**: Each Git command has configurable timeout protection
- **Parallel Processing**: Branches are processed sequentially with progress indicators
- **Memory Efficient**: Results are streamed rather than held entirely in memory
- **Network Optimization**: Uses remote branch references to minimize network calls

## Dependencies

### Invoke-GitSafe.ps1

The script depends on `Invoke-GitSafe.ps1` for secure Git command execution with timeout handling. This dependency is automatically loaded from the same directory as the main script.

## Troubleshooting

### Common Issues

1. **"Not in a git repository"**: Ensure you're running the script from within a Git repository
2. **Git command timeouts**: Increase the `TimeoutSec` parameter for repositories with complex history
3. **Branch reference errors**: The script automatically skips orphaned or invalid branch references

### Verbose Output

Enable verbose output for detailed processing information:

```powershell
.\scripts\Get-GitBranchMeta.ps1 -Verbose
```

## Integration Examples

### CI/CD Pipeline Integration

```yaml
# Example GitHub Actions step
- name: Generate Branch Analysis
  run: |
    .\scripts\Get-GitBranchMeta.ps1 -OutFile "artifacts/branch-analysis.json"
  shell: pwsh
```

### Automated Reporting

```powershell
# Weekly branch analysis report
$date = Get-Date -Format "yyyy-MM-dd"
.\scripts\Get-GitBranchMeta.ps1 -OutFile "reports/branches-$date.json" -MaxAuthors 10
```

## Version History

- **v1.0**: Initial release with comprehensive branch analysis and error handling

## Support

For issues or questions regarding this utility, please refer to the project's issue tracker or documentation.
