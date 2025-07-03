@echo off
cd /d %~dp0..\
npm install pmd-cli@latest
npx pmd-cli cpd ^
  --minimum-tokens 30 ^
  --format json ^
  --language typescript ^
  ./components/ ./hooks/ ./lib/ ^
  > .\test-results\cpd-analysis.json
