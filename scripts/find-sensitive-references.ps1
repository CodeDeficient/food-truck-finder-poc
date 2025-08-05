# Find Sensitive References Script
# This script searches for all occurrences of sensitive content across the entire repository
# including files, commit messages, and git history

param(
    [switch]$Detailed = $false
)

Write-Host "🔍 Searching for sensitive references..." -ForegroundColor Yellow
Write-Host ""

# Define search terms
$searchTerms = @(
    "Zabrina",
    "zabrina", 
    "ZABRINA",
    "9.*million.*dollar",
    "9-million-dollar",
    "THE-9-MILLION-DOLLAR-CODE"
)

$results = @()

# 1. Search current markdown directory files
Write-Host "📁 Searching current markdown files (.md)..." -ForegroundColor Cyan
foreach ($term in $searchTerms) {
    try {
        # Optimized to only include .md files and exclude common dependency/build directories
        $fileMatches = Get-ChildItem -Recurse -File -Filter *.md -Exclude "node_modules",".git",".next","dist" -ErrorAction SilentlyContinue |
            Select-String -Pattern $term -ErrorAction SilentlyContinue
        
        foreach ($match in $fileMatches) {
            $results += [PSCustomObject]@{
                Type = "File Content"
                Location = $match.Filename
                LineNumber = $match.LineNumber
                Content = $match.Line.Trim()
                Term = $term
            }
        }
    }
    catch {
        Write-Warning "Error searching files for term '$term': $($_.Exception.Message)"
    }
}

# 2. Search filenames
Write-Host "📂 Searching filenames (for .md files)..." -ForegroundColor Cyan
foreach ($term in $searchTerms) {
    try {
        $fileNameMatches = Get-ChildItem -Recurse -Filter *.md -Exclude "node_modules",".git",".next","dist" -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match $term }
        
        foreach ($file in $fileNameMatches) {
            $results += [PSCustomObject]@{
                Type = "Filename"
                Location = $file.FullName
                LineNumber = "N/A"
                Content = $file.Name
                Term = $term
            }
        }
    }
    catch {
        Write-Warning "Error searching filenames for term '$term': $($_.Exception.Message)"
    }
}

# 3. Search git commit messages
Write-Host "📝 Searching commit messages..." -ForegroundColor Cyan
foreach ($term in $searchTerms) {
    try {
        $commitOutput = git log --all --grep="$term" --oneline 2>$null
        if ($commitOutput) {
            foreach ($commit in $commitOutput) {
                $results += [PSCustomObject]@{
                    Type = "Commit Message"
                    Location = $commit.Split(' ')[0]
                    LineNumber = "N/A"
                    Content = $commit
                    Term = $term
                }
            }
        }
    }
    catch {
        Write-Warning "Error searching commits for term '$term': $($_.Exception.Message)"
    }
}

# 4. Search git commit diffs
Write-Host "🔍 Searching commit diffs..." -ForegroundColor Cyan
foreach ($term in $searchTerms) {
    try {
        $diffOutput = git log --all -S"$term" --oneline 2>$null
        if ($diffOutput) {
            foreach ($commit in $diffOutput) {
                $results += [PSCustomObject]@{
                    Type = "Commit Diff"
                    Location = $commit.Split(' ')[0]
                    LineNumber = "N/A"
                    Content = $commit
                    Term = $term
                }
            }
        }
    }
    catch {
        Write-Warning "Error searching diffs for term '$term': $($_.Exception.Message)"
    }
}

# 5. Search all branches
Write-Host "🌿 Searching all branches..." -ForegroundColor Cyan
try {
    $branches = git branch -a 2>$null | ForEach-Object { $_.Trim().Replace('*', '').Trim() }
    foreach ($branch in $branches) {
        if ($branch -and $branch -notmatch '^remotes/') {
            foreach ($term in $searchTerms) {
                try {
                    $branchOutput = git log $branch --grep="$term" --oneline 2>$null
                    if ($branchOutput) {
                        foreach ($commit in $branchOutput) {
                            $results += [PSCustomObject]@{
                                Type = "Branch: $branch"
                                Location = $commit.Split(' ')[0]
                                LineNumber = "N/A"
                                Content = $commit
                                Term = $term
                            }
                        }
                    }
                }
                catch {
                    # Silently continue for branch search errors
                }
            }
        }
    }
}
catch {
    Write-Warning "Error searching branches: $($_.Exception.Message)"
}

# Display results
Write-Host ""
if ($results.Count -eq 0) {
    Write-Host "✅ No sensitive references found!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $($results.Count) sensitive references:" -ForegroundColor Red
    Write-Host ""
    
    $groupedResults = $results | Group-Object Type
    foreach ($group in $groupedResults) {
        Write-Host "📍 $($group.Name) ($($group.Count) occurrences):" -ForegroundColor Yellow
        
        if ($Detailed) {
            foreach ($item in $group.Group) {
                Write-Host "   Location: $($item.Location)" -ForegroundColor White
                if ($item.LineNumber -ne "N/A") {
                    Write-Host "   Line: $($item.LineNumber)" -ForegroundColor Gray
                }
                Write-Host "   Content: $($item.Content)" -ForegroundColor Gray
                Write-Host "   Term: $($item.Term)" -ForegroundColor Magenta
                Write-Host ""
            }
        } else {
            $group.Group | ForEach-Object {
                Write-Host "   $($_.Location) - $($_.Term)" -ForegroundColor White
            }
        }
        Write-Host ""
    }
    
    # Export results to JSON for further processing
    $resultsFile = "sensitive-references-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $results | ConvertTo-Json -Depth 3 | Out-File $resultsFile
    Write-Host "📄 Detailed results exported to: $resultsFile" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔍 Search complete!" -ForegroundColor Green
