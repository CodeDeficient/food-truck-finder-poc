param([string]$filePath)

$content = Get-Content $filePath

$content = $content -replace '../../dist/lib/pipeline/scrapingProcessor.js', '../lib/pipeline/scrapingProcessor.js'
$content = $content -replace '../../dist/lib/supabase/services/scrapingJobService.js', '../lib/supabase/services/scrapingJobService.js'

Set-Content -Path $filePath -Value $content