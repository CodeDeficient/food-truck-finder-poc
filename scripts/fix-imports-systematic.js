import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Comprehensive mapping of directory imports to specific files
const DIRECTORY_IMPORT_MAPPINGS = {
  // Supabase directory mappings
  '../supabase': '../supabase/client.js',
  '../../supabase': '../../supabase/client.js',
  './supabase': './supabase/client.js',
  
  // Supabase services mappings
  '../supabase/services': '../supabase/services/apiUsageService.js',
  '../../supabase/services': '../../supabase/services/apiUsageService.js',
  './supabase/services': './supabase/services/apiUsageService.js',
  
  // Supabase utils mappings
  '../supabase/utils': '../supabase/utils/index.js',
  '../../supabase/utils': '../../supabase/utils/index.js',
  './supabase/utils': './supabase/utils/index.js',
  
  // Data-quality mappings
  '../data-quality': '../data-quality/duplicatePrevention.js',
  '../../data-quality': '../../data-quality/duplicatePrevention.js',
  './data-quality': './data-quality/duplicatePrevention.js',
  
  // Gemini mappings
  '../gemini': '../gemini/geminiApiClient.js',
  '../../gemini': '../../gemini/geminiApiClient.js',
  './gemini': './gemini/geminiApiClient.js',
  
  // Utils mappings
  '../utils': '../utils/index.js',
  '../../utils': '../../utils/index.js',
  './utils': './utils/index.js',
  
  // API mappings
  '../api': '../api/search/data.js',
  '../../api': '../../api/search/data.js',
  './api': './api/search/data.js',
};

// Specific service mappings
const SERVICE_MAPPINGS = {
  // Supabase services
  '../supabase/services/apiUsageService': '../supabase/services/apiUsageService.js',
  '../../supabase/services/apiUsageService': '../../supabase/services/apiUsageService.js',
  './supabase/services/apiUsageService': './supabase/services/apiUsageService.js',
  
  '../supabase/services/foodTruckService': '../supabase/services/foodTruckService.js',
  '../../supabase/services/foodTruckService': '../../supabase/services/foodTruckService.js',
  './supabase/services/foodTruckService': './supabase/services/foodTruckService.js',
  
  '../supabase/services/scrapingJobService': '../supabase/services/scrapingJobService.js',
  '../../supabase/services/scrapingJobService': '../../supabase/services/scrapingJobService.js',
  './supabase/services/scrapingJobService': './supabase/services/scrapingJobService.js',
  
  '../supabase/services/dataQualityService': '../supabase/services/dataQualityService.js',
  '../../supabase/services/dataQualityService': '../../supabase/services/dataQualityService.js',
  './supabase/services/dataQualityService': './supabase/services/dataQualityService.js',
  
  '../supabase/services/dataProcessingService': '../supabase/services/dataProcessingService.js',
  '../../supabase/services/dataProcessingService': '../../supabase/services/dataProcessingService.js',
  './supabase/services/dataProcessingService': './supabase/services/dataProcessingService.js',
  
  // Supabase utils
  '../supabase/utils/menuUtils': '../supabase/utils/menuUtils.js',
  '../../supabase/utils/menuUtils': '../../supabase/utils/menuUtils.js',
  './supabase/utils/menuUtils': './supabase/utils/menuUtils.js',
  
  '../supabase/utils/typeGuards': '../supabase/utils/typeGuards.js',
  '../../supabase/utils/typeGuards': '../../supabase/utils/typeGuards.js',
  './supabase/utils/typeGuards': './supabase/utils/typeGuards.js',
  
  // Data quality services
  '../data-quality/duplicatePrevention': '../data-quality/duplicatePrevention.js',
  '../../data-quality/duplicatePrevention': '../../data-quality/duplicatePrevention.js',
  './data-quality/duplicatePrevention': './data-quality/duplicatePrevention.js',
  
  '../data-quality/batchCleanup': '../data-quality/batchCleanup.js',
  '../../data-quality/batchCleanup': '../../data-quality/batchCleanup.js',
  './data-quality/batchCleanup': './data-quality/batchCleanup.js',
  
  // Gemini services
  '../gemini/geminiApiClient': '../gemini/geminiApiClient.js',
  '../../gemini/geminiApiClient': '../../gemini/geminiApiClient.js',
  './gemini/geminiApiClient': './gemini/geminiApiClient.js',
  
  '../gemini/promptTemplates': '../gemini/promptTemplates.js',
  '../../gemini/promptTemplates': '../../gemini/promptTemplates.js',
  './gemini/promptTemplates': './gemini/promptTemplates.js',
  
  '../gemini/responseParser': '../gemini/responseParser.js',
  '../../gemini/responseParser': '../../gemini/responseParser.js',
  './gemini/responseParser': './gemini/responseParser.js',
  
  '../gemini/usageLimits': '../gemini/usageLimits.js',
  '../../gemini/usageLimits': '../../gemini/usageLimits.js',
  './gemini/usageLimits': './gemini/usageLimits.js',
  
  // API services
  '../api/search/data': '../api/search/data.js',
  '../../api/search/data': '../../api/search/data.js',
  './api/search/data': './api/search/data.js',
  
  // Client files
  '../supabase/client': '../supabase/client.js',
  '../../supabase/client': '../../supabase/client.js',
  './supabase/client': './supabase/client.js',
  
  '../client': '../supabase/client.js',
  '../../client': '../../supabase/client.js',
  './client': './supabase/client.js',
};

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
  content = content.replace(relativeImportPattern, (match, importPath) => {
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
  for (const [directoryImport, fileImport] of Object.entries(DIRECTORY_IMPORT_MAPPINGS)) {
    const pattern = new RegExp(`from\\s+['"]${directoryImport.replace(/\./g, '\\.').replace(/\//g, '\\/')}['"]`, 'g');
    if (pattern.test(content)) {
      const newPattern = new RegExp(`from\\s+['"]${directoryImport.replace(/\./g, '\\.').replace(/\//g, '\\/')}['"]`, 'g');
      content = content.replace(newPattern, `from '${fileImport}'`);
      console.log(`  Fixed directory import: ${directoryImport} -> ${fileImport}`);
      fixesMade = true;
    }
  }
  
  // Fix 3: Handle specific service mappings
  for (const [serviceImport, fileImport] of Object.entries(SERVICE_MAPPINGS)) {
    const pattern = new RegExp(`from\\s+['"]${serviceImport.replace(/\./g, '\\.').replace(/\//g, '\\/')}['"]`, 'g');
    if (pattern.test(content)) {
      const newPattern = new RegExp(`from\\s+['"]${serviceImport.replace(/\./g, '\\.').replace(/\//g, '\\/')}['"]`, 'g');
      content = content.replace(newPattern, `from '${fileImport}'`);
      console.log(`  Fixed service import: ${serviceImport} -> ${fileImport}`);
      fixesMade = true;
    }
  }
  
  // Fix 4: Handle @/lib path aliases
  const dirPath = dirname(filePath);
  const distLibPath = join(__dirname, '../dist/lib');
  
  content = content.replace(
    /from\s+['"]@\/lib\/([^'"]+)['"]/g,
    (match, importPath) => {
      // Convert @/lib/path to relative path
      const targetPath = join(distLibPath, importPath);
      const relativePath = relative(dirPath, targetPath);
      const normalizedPath = relativePath.replace(/\\/g, '/');
      
      // Add .js extension if it's a file (not a directory)
      let finalPath = normalizedPath;
      if (!normalizedPath.includes('.') && !normalizedPath.endsWith('/')) {
        finalPath = `${normalizedPath}.js`;
      }
      
      console.log(`  Fixed @/lib alias: @/lib/${importPath} -> ${finalPath}`);
      fixesMade = true;
      return `from '${finalPath}'`;
    }
  );

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
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      totalFixed += fixAllImports(filePath);
    } else if (file.endsWith('.js')) {
      if (fixImports(filePath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

// Run the fix
const distLibPath = join(__dirname, '../dist/lib');
if (existsSync(distLibPath)) {
  console.log('🔍 Systematically fixing all ESM import issues in dist/lib...');
  console.log('============================================================');
  const fixedCount = fixAllImports(distLibPath);
  console.log('============================================================');
  console.log(`✅ Import fixing complete! Fixed ${fixedCount} files.`);
  console.log('\n🧪 Testing the fix...');
  console.log('Run: node scripts/github-action-scraper.js --help');
} else {
  console.log('❌ dist/lib directory not found');
  process.exit(1);
}
