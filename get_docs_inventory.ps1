# Get all markdown files with their details
$mdFiles = Get-ChildItem -Recurse -File -Filter "*.md"

# Create array to store results
$results = @()

foreach ($file in $mdFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    
    $results += [PSCustomObject]@{
        FullName = $file.FullName
        RelativePath = $relativePath
        LastWriteTime = $file.LastWriteTime
        Name = $file.Name
        Directory = $file.Directory.Name
    }
}

# Export to CSV
$results | Export-Csv -Path "docs_inventory.csv" -NoTypeInformation

Write-Host "Exported $($results.Count) markdown files to docs_inventory.csv"
