import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to fix imports in a file
function fixImports(filePath) {
  if (!existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Fix missing .js extensions in relative imports
  content = content.replace(
    /from\s+['"](\.\/[^'"]+)['"]/g,
    (match, importPath) => {
      // Don't add .js if it already has an extension or is a directory import
      if (!importPath.includes('.') && !importPath.endsWith('/')) {
        return `from '${importPath}.js'`;
      }
      return match;
    }
  );
  
  content = content.replace(
    /from\s+['"](\.\.\/[^'"]+)['"]/g,
    (match, importPath) => {
      // Don't add .js if it already has an extension or is a directory import
      if (!importPath.includes('.') && !importPath.endsWith('/')) {
        return `from '${importPath}.js'`;
      }
      return match;
    }
  );

  // Fix directory imports that should point to specific files
  const directoryFixes = [
    ['./supabase', './supabase/services/apiUsageService.js'],
    ['./gemini', './gemini/index.js'], // or the main file
    ['./data-quality', './data-quality/index.js'],
    ['./utils', './utils/index.js'],
    ['./services', './services/index.js'],
  ];

  for (const [dirImport, fileImport] of directoryFixes) {
    const pattern = new RegExp(`from\\s+['"]${dirImport.replace(/\./g, '\\.')}['"]`, 'g');
    content = content.replace(pattern, `from '${fileImport}'`);
  }

  // Fix specific known path aliases
  const fixes = [
    // Supabase services
    [/@\/lib\/supabase/g, '../../supabase'],
    [/@\/lib\/fallback\/supabaseFallback/g, '../../fallback/supabaseFallback'],
    [/@\/lib\/security\/auditLogger/g, '../../security/auditLogger'],
    [/@\/lib\/supabaseMiddleware/g, '../../supabaseMiddleware'],
    [/@\/lib\/performance\/databaseCache/g, '../../performance/databaseCache'],
    [/@\/lib\/monitoring\/apiMonitor/g, '../../monitoring/apiMonitor'],
    [/@\/lib\/data-quality\/duplicatePrevention/g, '../../data-quality/duplicatePrevention'],
    [/@\/lib\/data-quality\/batchCleanup/g, '../../data-quality/batchCleanup'],
    [/@\/lib\/firecrawl/g, '../../firecrawl'],
    [/@\/lib\/gemini/g, '../../gemini'],
    [/@\/lib\/pipelineProcessor/g, '../../pipelineProcessor'],
    [/@\/lib\/autoScraper/g, '../../autoScraper'],
    [/@\/lib\/scheduler/g, '../../scheduler'],
    [/@\/lib\/activityLogger/g, '../../activityLogger'],
    [/@\/lib\/config/g, '../../config'],
    [/@\/lib\/discoveryEngine/g, '../../discoveryEngine'],
    [/@\/lib\/ScraperEngine/g, '../../ScraperEngine'],
    [/@\/lib\/supabase/g, '../../supabase'],
    [/@\/lib\/utils\/typeGuards/g, '../../utils/typeGuards'],
    [/@\/lib\/utils\/menuUtils/g, '../../utils/menuUtils'],
    [/@\/lib\/utils\/index/g, '../../utils/index'],
    [/@\/lib\/supabase\/services\/apiUsageService/g, '../../supabase/services/apiUsageService'],
    [/@\/lib\/supabase\/services\/scrapingJobService/g, '../../supabase/services/scrapingJobService'],
    [/@\/lib\/supabase\/services\/foodTruckService/g, '../../supabase/services/foodTruckService'],
    [/@\/lib\/supabase\/services\/dataQualityService/g, '../../supabase/services/dataQualityService'],
    [/@\/lib\/supabase\/services\/dataProcessingService/g, '../../supabase/services/dataProcessingService'],
    [/@\/lib\/supabase\/client/g, '../../supabase/client'],
    [/@\/lib\/supabase\/utils\/index/g, '../../supabase/utils/index'],
    [/@\/lib\/supabase\/utils\/menuUtils/g, '../../supabase/utils/menuUtils'],
    [/@\/lib\/supabase\/utils\/typeGuards/g, '../../supabase/utils/typeGuards'],
    [/@\/lib\/api\/search\/data/g, '../../api/search/data'],
    [/@\/lib\/api\/search\/filters/g, '../../api/search/filters'],
    [/@\/lib\/performance\/databaseCache\.js/g, '../../performance/databaseCache.js'],
  ];

  for (const [pattern, replacement] of fixes) {
    content = content.replace(new RegExp(pattern.source || pattern, 'g'), replacement);
  }

  // Fix any remaining @/lib imports by converting to relative paths
  // This is a more general approach for any @/lib imports
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
      if (!normalizedPath.includes('.') && !normalizedPath.endsWith('/')) {
        return `from '${normalizedPath}.js'`;
      }
      return `from '${normalizedPath}'`;
    }
  );

  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${filePath}`);
  }
}

// Recursively fix all .js files in dist/lib
function fixAllImports(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      fixAllImports(filePath);
    } else if (file.endsWith('.js')) {
      fixImports(filePath);
    }
  }
}

// Run the fix
const distLibPath = join(__dirname, '../dist/lib');
if (existsSync(distLibPath)) {
  console.log('Fixing imports in dist/lib...');
  fixAllImports(distLibPath);
  console.log('Import fixing complete!');
} else {
  console.log('dist/lib directory not found');
}
