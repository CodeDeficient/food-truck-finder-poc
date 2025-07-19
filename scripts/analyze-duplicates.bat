@echo off
cd /d %~dp0..
npx eslint . --format json > .\test-results\eslint-duplication-results.json
powershell -Command "(Get-Content .\test-results\eslint-duplication-results.json -Raw) -replace '\\\\','$$\' | Set-Content .\test-results\eslint-duplication-results.json"
echo Duplication analysis complete. Check test-results/eslint-duplication-results.json for results.
