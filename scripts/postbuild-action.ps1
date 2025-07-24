echo 'Setting up GitHub Action structure...'
if (!(Test-Path './.github/actions/scrape/lib')) { New-Item -ItemType Directory -Force -Path './.github/actions/scrape/lib' }
Copy-Item -Path './dist/lib/*' -Destination './.github/actions/scrape/lib/' -Recurse -Force
Copy-Item -Path './package.json' -Destination './.github/actions/scrape/' -Force
(Get-Content -Raw ./.github/actions/scrape/github-action-scraper.js) -replace '../../dist/lib/pipeline/scrapingProcessor.js', '../lib/pipeline/scrapingProcessor.js' | Set-Content ./.github/actions/scrape/github-action-scraper.js
(Get-Content -Raw ./.github/actions/scrape/github-action-scraper.js) -replace '../../dist/lib/supabase/services/scrapingJobService.js', '../lib/supabase/services/scrapingJobService.js' | Set-Content ./.github/actions/scrape/github-action-scraper.js
echo 'GitHub Action structure created successfully'