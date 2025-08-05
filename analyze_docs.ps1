# Load the CSV data
$docs = Import-Csv "docs_inventory.csv"

# Filter out node_modules files
$projectDocs = $docs | Where-Object { $_.RelativePath -notlike "node_modules*" }

Write-Host "Total markdown files found: $($docs.Count)"
Write-Host "Project documentation files (excluding node_modules): $($projectDocs.Count)"

# Categorize files by logical topics
$categories = @{
    "Setup" = @()
    "Backend" = @()
    "Frontend" = @()
    "Deployment" = @()
    "Operations" = @()
    "Rules" = @()
    "Misc" = @()
}

# Categorization logic
foreach ($doc in $projectDocs) {
    $path = $doc.RelativePath.ToLower()
    $name = $doc.Name.ToLower()
    
    # Setup/Installation
    if ($path -match "(readme|installation|setup|configuration|migration)" -or 
        $name -match "(readme|installation|setup|configuration|migration)") {
        $categories["Setup"] += $doc
    }
    # Rules (highest priority)
    elseif ($path -match "\.clinerules" -or $name -match "(rule|protocol|guideline|convention)") {
        $categories["Rules"] += $doc
    }
    # Backend
    elseif ($path -match "(backend|api|database|supabase|data|pipeline)" -or 
            $name -match "(backend|api|database|supabase|data|pipeline)") {
        $categories["Backend"] += $doc
    }
    # Frontend
    elseif ($path -match "(frontend|ui|component|auth|modal|badge)" -or 
            $name -match "(frontend|ui|component|auth|modal|badge)") {
        $categories["Frontend"] += $doc
    }
    # Deployment
    elseif ($path -match "(deploy|github|actions|vercel|build)" -or 
            $name -match "(deploy|github|actions|vercel|build)") {
        $categories["Deployment"] += $doc
    }
    # Operations
    elseif ($path -match "(monitoring|testing|script|cron|job)" -or 
            $name -match "(monitoring|testing|script|cron|job)") {
        $categories["Operations"] += $doc
    }
    # Everything else goes to Misc
    else {
        $categories["Misc"] += $doc
    }
}

# Create detailed analysis
$analysis = @()

foreach ($category in $categories.Keys) {
    $files = $categories[$category]
    Write-Host "`n=== $category Category: $($files.Count) files ==="
    
    if ($files.Count -gt 0) {
        # Group by name to find duplicates
        $duplicates = $files | Group-Object Name | Where-Object { $_.Count -gt 1 }
        
        foreach ($file in $files) {
            $isDuplicate = $duplicates | Where-Object { $_.Name -eq $file.Name }
            $newestInGroup = $false
            
            if ($isDuplicate) {
                $newestFile = $isDuplicate.Group | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                $newestInGroup = ($file.FullName -eq $newestFile.FullName)
            }
            
            $analysis += [PSCustomObject]@{
                Category = $category
                FileName = $file.Name
                RelativePath = $file.RelativePath
                LastWriteTime = $file.LastWriteTime
                IsDuplicate = [bool]$isDuplicate
                IsNewestVersion = if ($isDuplicate) { $newestInGroup } else { $null }
                MigrationPriority = if ($isDuplicate -and $newestInGroup) { "Primary" } elseif ($isDuplicate) { "Archive" } else { "Standard" }
                YAMLFrontMatter = @"
---
original_path: $($file.RelativePath)
last_modified: $($file.LastWriteTime)
category: $category
migration_date: $(Get-Date -Format "yyyy-MM-dd")
---
"@
            }
        }
        
        if ($duplicates.Count -gt 0) {
            Write-Host "  Found $($duplicates.Count) duplicate file name(s):"
            foreach ($dup in $duplicates) {
                Write-Host "    - $($dup.Name) ($($dup.Count) copies)"
                $newest = $dup.Group | Sort-Object LastWriteTime -Descending | Select-Object -First 1
                Write-Host "      Newest: $($newest.RelativePath) ($($newest.LastWriteTime))"
            }
        }
    }
}

# Export detailed analysis
$analysis | Export-Csv -Path "docs_categorization_analysis.csv" -NoTypeInformation

# Summary statistics
Write-Host "`n=== SUMMARY ==="
foreach ($category in $categories.Keys | Sort-Object) {
    Write-Host "$category`: $($categories[$category].Count) files"
}

$totalDuplicates = $analysis | Where-Object { $_.IsDuplicate } | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "`nTotal duplicate files: $totalDuplicates"
Write-Host "Analysis exported to: docs_categorization_analysis.csv"
