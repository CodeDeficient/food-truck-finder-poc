# ESLint Error Counter - Battle-Tested Solution
# Based on ESLint official documentation and established CI/CD practices
# Research sources: ESLint CLI docs, Node.js API, PowerShell best practices
# Usage: .\scripts\count-errors.ps1

Write-Host "Counting ESLint errors using established methods..." -ForegroundColor Cyan

# Method 1: ESLint JSON format (Official ESLint recommendation)
# Source: https://eslint.org/docs/latest/use/formatters/#json
Write-Host "Using ESLint JSON formatter (official method)..." -ForegroundColor Gray

try {
    # Use ESLint's built-in JSON formatter - battle-tested approach
    $eslintOutput = npx eslint . --format json 2>&1

    # Check if output is valid JSON
    if ($eslintOutput -and $eslintOutput.GetType().Name -eq "String") {
        try {
            $lintResults = $eslintOutput | ConvertFrom-Json

            # Calculate totals using ESLint's standard structure
            $totalErrors = ($lintResults | ForEach-Object { $_.errorCount } | Measure-Object -Sum).Sum
            $totalWarnings = ($lintResults | ForEach-Object { $_.warningCount } | Measure-Object -Sum).Sum
            $totalFiles = $lintResults.Count

            Write-Host "✅ ESLint JSON Method Success:" -ForegroundColor Green
            Write-Host "   Total Errors: $totalErrors" -ForegroundColor Red
            Write-Host "   Total Warnings: $totalWarnings" -ForegroundColor Yellow
            Write-Host "   Files Checked: $totalFiles" -ForegroundColor Gray

            return $totalErrors
        }
        catch {
            Write-Host "JSON parsing failed, trying fallback method..." -ForegroundColor Yellow
        }
    }

    # Method 2: Node.js API approach (fallback)
    # Source: https://eslint.org/docs/latest/integrate/nodejs-api
    Write-Host "Trying Node.js API approach..." -ForegroundColor Gray

    $nodeScript = @"
const { ESLint } = require('eslint');
(async function main() {
  try {
    const eslint = new ESLint();
    const results = await eslint.lintFiles(['.']);
    const errorCount = results.reduce((sum, result) => sum + result.errorCount, 0);
    const warningCount = results.reduce((sum, result) => sum + result.warningCount, 0);
    console.log(JSON.stringify({ errorCount, warningCount, fileCount: results.length }));
  } catch (error) {
    console.error('Node.js API failed:', error.message);
    process.exit(1);
  }
})();
"@

    $nodeOutput = Write-Output $nodeScript | node 2>&1
    if ($nodeOutput -and $nodeOutput -match '^\{') {
        $result = $nodeOutput | ConvertFrom-Json
        Write-Host "✅ Node.js API Method Success:" -ForegroundColor Green
        Write-Host "   Total Errors: $($result.errorCount)" -ForegroundColor Red
        Write-Host "   Total Warnings: $($result.warningCount)" -ForegroundColor Yellow
        Write-Host "   Files Checked: $($result.fileCount)" -ForegroundColor Gray
        return $result.errorCount
    }

    # Method 3: Simple CLI parsing (last resort)
    Write-Host "Trying simple CLI parsing..." -ForegroundColor Gray
    $simpleOutput = npx eslint . 2>&1 | Out-String
    if ($simpleOutput -match '(\d+) problems? \((\d+) errors?, (\d+) warnings?\)') {
        $errors = [int]$matches[2]
        Write-Host "✅ CLI Parsing Success:" -ForegroundColor Green
        Write-Host "   Total Errors: $errors" -ForegroundColor Red
        return $errors
    }

    Write-Host "❌ All methods failed" -ForegroundColor Red
    Write-Host "Manual count required - run: npx eslint ." -ForegroundColor Yellow
    return -1

} catch {
    Write-Host "❌ Error counting failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Manual count required - run: npx eslint ." -ForegroundColor Yellow
    return -1
}
