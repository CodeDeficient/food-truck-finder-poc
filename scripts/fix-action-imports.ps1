#This script is designed to be run from the root of the project.

param (
    [string]$actionDir = './.github/actions/scrape'
)

$distDir = Join-Path $actionDir 'dist'

# Get all .js files in the dist directory
$jsFiles = Get-ChildItem -Path $distDir -Filter *.js -Recurse

foreach ($file in $jsFiles) {
    $content = Get-Content $file.FullName -Raw

    # This regex will find import paths that start with ../../dist/ and replace them with a relative path
    $newContent = $content -replace '(\.\./)+dist/lib', '../lib'

    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent
        Write-Host "Updated import paths in $($file.FullName)"
    }
}
