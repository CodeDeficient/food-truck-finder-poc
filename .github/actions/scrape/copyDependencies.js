import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source directory (main project dist/lib)
const sourceDir = path.join(__dirname, '../../../dist/lib');

// Destination directory (action dist/lib)
const destDir = path.join(__dirname, 'dist/lib');

// Files to copy
const filesToCopy = [
  'firecrawl.js',
  'firecrawl.d.ts',
  'gemini.js',
  'gemini.d.ts',
  'pipeline/scrapingProcessor.js',
  'pipeline/scrapingProcessor.d.ts',
  'pipeline/pipelineHelpers.js',
  'pipeline/pipelineHelpers.d.ts',
  'supabase.js',
  'supabase.d.ts',
  'supabaseMiddleware.js',
  'supabaseMiddleware.d.ts',
  'utils.js',
  'utils.d.ts',
  'config.js',
  'config.d.ts',
  'types.js',
  'types.d.ts',
  'activityLogger.js',
  'activityLogger.d.ts',
  'discoveryEngine.js',
  'discoveryEngine.d.ts',
  'ScraperEngine.js',
  'ScraperEngine.d.ts',
  'scheduler.js',
  'scheduler.d.ts',
  'pipelineManager.js',
  'pipelineManager.d.ts',
  'autoScraper.js',
  'autoScraper.d.ts',
  'cva.js',
  'cva.d.ts',
  'database.types.js',
  'database.types.d.ts'
];

// Directories to copy recursively
const dirsToCopy = [
  'gemini',
  'supabase',
  'data-quality',
  'monitoring',
  'utils',
  'api',
  'data',
  'fallback',
  'mappers',
  'middleware',
  'performance',
  'schemas',
  'security'
];

console.log('Copying dependencies from main dist/lib to action dist/lib...');

// Copy individual files
for (const file of filesToCopy) {
  const sourceFile = path.join(sourceDir, file);
  const destFile = path.join(destDir, file);
  
  if (existsSync(sourceFile)) {
    // Ensure destination directory exists
    const destFileDir = path.dirname(destFile);
    if (!existsSync(destFileDir)) {
      mkdirSync(destFileDir, { recursive: true });
    }
    
    copyFileSync(sourceFile, destFile);
    console.log(`  ✅ Copied ${file}`);
  } else {
    console.log(`  ⚠️  File not found: ${file}`);
  }
}

// Copy directories recursively
function copyDirRecursive(src, dest) {
  if (!existsSync(src)) return;
  
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy directories
for (const dir of dirsToCopy) {
  const sourceDirPath = path.join(sourceDir, dir);
  const destDirPath = path.join(destDir, dir);
  
  if (existsSync(sourceDirPath)) {
    copyDirRecursive(sourceDirPath, destDirPath);
    console.log(`  📁 Copied directory ${dir}`);
  } else {
    console.log(`  ⚠️  Directory not found: ${dir}`);
  }
}

console.log('✅ Dependency copying complete!');
