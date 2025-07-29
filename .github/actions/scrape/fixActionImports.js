import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fix imports in a file
function fixImports(filePath) {
  if (!existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }

  let content = readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fixesMade = false;
  
  console.log(`Analyzing: ${filePath}`);
  
  // Fix 1: Add .js extensions to relative imports that are missing them
  const relativeImportPattern = /from\s+['"](\.{1,2}\/[^'"]+)['"]/g;
  content = content.replaceAll(relativeImportPattern, (match, importPath) => {
    // Skip if it already has an extension
    if (importPath.includes('.')) {
      return match;
    }
    
    // Skip if it ends with / (directory import that we'll handle separately)
    if (importPath.endsWith('/')) {
      return match;
    }
    
    // Add .js extension
    const fixedPath = `${importPath}.js`;
    console.log(`  Fixed relative import: ${importPath} -> ${fixedPath}`);
    fixesMade = true;
    return `from '${fixedPath}'`;
  });
  
  // Fix 2: Handle directory imports by mapping them to specific files
  const DIRECTORY_IMPORT_MAPPINGS = {
    // Supabase directory mappings
    '../supabase': '../lib/supabase/client.js',
    '../../supabase': '../../lib/supabase/client.js',
    './supabase': './lib/supabase/client.js',
    
    // Supabase services mappings
    '../supabase/services': '../lib/supabase/services/apiUsageService.js',
    '../../supabase/services': '../../lib/supabase/services/apiUsageService.js',
    './supabase/services': './lib/supabase/services/apiUsageService.js',
    
    // Supabase utils mappings
    '../supabase/utils': '../lib/supabase/utils/index.js',
    '../../supabase/utils': '../../lib/supabase/utils/index.js',
    './supabase/utils': './lib/supabase/utils/index.js',
    
    // Data-quality mappings
    '../data-quality': '../lib/data-quality/duplicatePrevention.js',
    '../../data-quality': '../../lib/data-quality/duplicatePrevention.js',
    './data-quality': './lib/data-quality/duplicatePrevention.js',
    
    // Gemini mappings
    '../gemini': '../lib/gemini/geminiApiClient.js',
    '../../gemini': '../../lib/gemini/geminiApiClient.js',
    './gemini': './lib/gemini/geminiApiClient.js',
    
    // Utils mappings
    '../utils': '../lib/utils/index.js',
    '../../utils': '../../lib/utils/index.js',
    './utils': './lib/utils/index.js',
    
    // API mappings
    '../api': '../lib/api/search/data.js',
    '../../api': '../../lib/api/search/data.js',
    './api': './lib/api/search/data.js',
  };

  // Specific service mappings
  const SERVICE_MAPPINGS = {
    // Supabase services
    '../supabase/services/apiUsageService': '../lib/supabase/services/apiUsageService.js',
    '../../supabase/services/apiUsageService': '../../lib/supabase/services/apiUsageService.js',
    './supabase/services/apiUsageService': './lib/supabase/services/apiUsageService.js',
    
    '../supabase/services/foodTruckService': '../lib/supabase/services/foodTruckService.js',
    '../../supabase/services/foodTruckService': '../../lib/supabase/services/foodTruckService.js',
    './supabase/services/foodTruckService': './lib/supabase/services/foodTruckService.js',
    
    '../supabase/services/scrapingJobService': '../lib/supabase/services/scrapingJobService.js',
    '../../supabase/services/scrapingJobService': '../../lib/supabase/services/scrapingJobService.js',
    './supabase/services/scrapingJobService': './lib/supabase/services/scrapingJobService.js',
    
    '../supabase/services/dataQualityService': '../lib/supabase/services/dataQualityService.js',
    '../../supabase/services/dataQualityService': '../../lib/supabase/services/dataQualityService.js',
    './supabase/services/dataQualityService': './lib/supabase/services/dataQualityService.js',
    
    '../supabase/services/dataProcessingService': '../lib/supabase/services/dataProcessingService.js',
    '../../supabase/services/dataProcessingService': '../../lib/supabase/services/dataProcessingService.js',
    './supabase/services/dataProcessingService': './lib/supabase/services/dataProcessingService.js',
    
    // Supabase utils
    '../supabase/utils/menuUtils': '../lib/supabase/utils/menuUtils.js',
    '../../supabase/utils/menuUtils': '../../lib/supabase/utils/menuUtils.js',
    './supabase/utils/menuUtils': './lib/supabase/utils/menuUtils.js',
    
    '../supabase/utils/typeGuards': '../lib/supabase/utils/typeGuards.js',
    '../../supabase/utils/typeGuards': '../../lib/supabase/utils/typeGuards.js',
    './supabase/utils/typeGuards': './lib/supabase/utils/typeGuards.js',
    
    // Data quality services
    '../data-quality/duplicatePrevention': '../lib/data-quality/duplicatePrevention.js',
    '../../data-quality/duplicatePrevention': '../../lib/data-quality/duplicatePrevention.js',
    './data-quality/duplicatePrevention': './lib/data-quality/duplicatePrevention.js',
    
    '../data-quality/batchCleanup': '../lib/data-quality/batchCleanup.js',
    '../../data-quality/batchCleanup': '../../lib/data-quality/batchCleanup.js',
    './data-quality/batchCleanup': './lib/data-quality/batchCleanup.js',
    
    // Gemini services
    '../gemini/geminiApiClient': '../lib/gemini/geminiApiClient.js',
    '../../gemini/geminiApiClient': '../../lib/gemini/geminiApiClient.js',
    './gemini/geminiApiClient': './lib/gemini/geminiApiClient.js',
    
    '../gemini/promptTemplates': '../lib/gemini/promptTemplates.js',
    '../../gemini/promptTemplates': '../../lib/gemini/promptTemplates.js',
    './gemini/promptTemplates': './lib/gemini/promptTemplates.js',
    
    '../gemini/responseParser': '../lib/gemini/responseParser.js',
    '../../gemini/responseParser': '../../lib/gemini/responseParser.js',
    './gemini/responseParser': './lib/gemini/responseParser.js',
    
    '../gemini/usageLimits': '../lib/gemini/usageLimits.js',
    '../../gemini/usageLimits': '../../lib/gemini/usageLimits.js',
    './gemini/usageLimits': './lib/gemini/usageLimits.js',
    
    // API services
    '../api/search/data': '../lib/api/search/data.js',
    '../../api/search/data': '../../lib/api/search/data.js',
    './api/search/data': './lib/api/search/data.js',
    
    // Client files
    '../supabase/client': '../lib/supabase/client.js',
    '../../supabase/client': '../../lib/supabase/client.js',
    './supabase/client': './lib/supabase/client.js',
    
    '../client': '../lib/supabase/client.js',
    '../../client': '../../lib/supabase/client.js',
    './client': './lib/supabase/client.js',
  };

  // Fix directory imports
  for (const [directoryImport, fileImport] of Object.entries(DIRECTORY_IMPORT_MAPPINGS)) {
    const escapedImport = directoryImport.replaceAll('.', String.raw`\.`).replaceAll('/', String.raw`\/`);
    const pattern = new RegExp(String.raw`from\s+['"]${escapedImport}['"]`, 'g');
    if (pattern.test(content)) {
      content = content.replaceAll(pattern, `from '${fileImport}'`);
      console.log(`  Fixed directory import: ${directoryImport} -> ${fileImport}`);
      fixesMade = true;
    }
  }
  
  // Fix specific service mappings
  for (const [serviceImport, fileImport] of Object.entries(SERVICE_MAPPINGS)) {
    const escapedImport = serviceImport.replaceAll('.', String.raw`\.`).replaceAll('/', String.raw`\/`);
    const pattern = new RegExp(String.raw`from\s+['"]${escapedImport}['"]`, 'g');
    if (pattern.test(content)) {
      content = content.replaceAll(pattern, `from '${fileImport}'`);
      console.log(`  Fixed service import: ${serviceImport} -> ${fileImport}`);
      fixesMade = true;
    }
  }

  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Fixed imports in: ${filePath}`);
    return true;
  } else if (fixesMade) {
    console.log(`  ℹ️  No changes needed in: ${filePath}`);
    return false;
  }
  
  return false;
}

  // Recursively fix all .js files in dist/lib
function fixAllImports(dir) {
  const files = readdirSync(dir);
  let totalFixed = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      totalFixed += fixAllImports(filePath);
    } else if (file.endsWith('.js')) {
      const fixed = fixImports(filePath);
      if (fixed) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

// Run the fix
const distLibPath = path.join(__dirname, 'dist/lib');
if (existsSync(distLibPath)) {
  console.log('🔍 Systematically fixing all ESM import issues in action dist/lib...');
  console.log('============================================================');
  const fixedCount = fixAllImports(distLibPath);
  console.log('============================================================');
  console.log(`✅ Import fixing complete! Fixed ${fixedCount} files.`);
} else {
  console.log('❌ dist/lib directory not found');
  throw new Error('dist/lib directory not found');
}
