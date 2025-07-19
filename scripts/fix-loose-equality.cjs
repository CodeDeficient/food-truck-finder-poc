const fs = require('node:fs');
const path = require('node:path');

const filesToProcess = [
  'app/api/cron/quality-check/route.ts',
  'app/login/page.tsx',
  'components/WebVitalsReporter.tsx',
  'components/admin/food-trucks/detail/ContactField.tsx',
  'components/admin/food-trucks/detail/ContactInfoCard.tsx',
  'components/admin/food-trucks/detail/OperatingHoursCard.tsx',
  'components/admin/food-trucks/detail/QualityMetricsGrid.tsx',
  'components/home/MapSection.tsx',
  'components/trucks/TruckCardHeader.tsx',
  'components/trucks/TruckContactInfo.tsx',
  'hooks/realtime/useEventHandlers.ts',
  'lib/ScraperEngine.ts',
  'lib/api/admin/data-quality/handlers.ts',
  'lib/api/admin/oauth-status/helpers.ts',
  'lib/api/monitoring/api-usage/handlers.ts',
  'lib/api/scheduler/handlers.ts',
  'lib/pipeline/pipelineHelpers.ts',
  'lib/security/rateLimiter.ts',
  'lib/supabase.ts',
  'lib/utils/foodTruckHelpers.ts',
];

function fixLooseEquality(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace 'value !== undefined' with 'value != null'
  content = content.replaceAll(/(\w+)\s*!==\s*undefined/g, '$1 != null');
  // Replace 'value === undefined' with 'value == null'
  content = content.replaceAll(/(\w+)\s*===\s*undefined/g, '$1 == null');
  // Replace 'value !== null' with 'value != null'
  content = content.replaceAll(/(\w+)\s*!==\s*null/g, '$1 != null');
  // Replace 'value === null' with 'value == null'
  content = content.replaceAll(/(\w+)\s*===\s*null/g, '$1 == null');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed loose equality in: ${filePath}`);
    return true;
  }
  return false;
}

let filesFixedCount = 0;
for (const file of filesToProcess) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (fixLooseEquality(fullPath)) {
      filesFixedCount++;
    }
  } else {
    console.warn(`File not found: ${fullPath}`);
  }
}

console.log(`\nFinished fixing loose equality. Total files modified: ${filesFixedCount}`);
