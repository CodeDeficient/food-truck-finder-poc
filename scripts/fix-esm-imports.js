#!/usr/bin/env node

/**
 * Script to fix ESM imports by adding .js extensions to relative imports
 * This is required for Node.js ESM modules to work correctly
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const LIB_DIR = 'lib';

function getAllTsFiles(dir) {
  const files = [];
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function fixImportsInFile(filePath) {
  console.log(`Processing: ${filePath}`);
  
  let content = readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Match import statements with relative paths
  const importRegex = /import\s+(?:(?:.*?from\s+['"`])|(?:['"`]))(\.[^'"`]+)['"`]/g;
  
  content = content.replace(importRegex, (match, importPath) => {
    // Skip if already has .js extension
    if (importPath.endsWith('.js')) {
      return match;
    }
    
    // Skip if it's importing node_modules or absolute paths
    if (!importPath.startsWith('.')) {
      return match;
    }
    
    // Add .js extension for relative imports
    const newMatch = match.replace(importPath, importPath + '.js');
    console.log(`  Fixed: ${importPath} -> ${importPath}.js`);
    modified = true;
    return newMatch;
  });
  
  // Also handle export from statements
  const exportRegex = /export\s+.*?from\s+['"`](\.[^'"`]+)['"`]/g;
  
  content = content.replace(exportRegex, (match, importPath) => {
    // Skip if already has .js extension
    if (importPath.endsWith('.js')) {
      return match;
    }
    
    // Skip if it's importing node_modules or absolute paths
    if (!importPath.startsWith('.')) {
      return match;
    }
    
    // Add .js extension for relative exports
    const newMatch = match.replace(importPath, importPath + '.js');
    console.log(`  Fixed export: ${importPath} -> ${importPath}.js`);
    modified = true;
    return newMatch;
  });
  
  if (modified) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`  ✅ Updated ${filePath}`);
  } else {
    console.log(`  ⏭️  No changes needed for ${filePath}`);
  }
}

function main() {
  console.log('🔧 Fixing ESM imports by adding .js extensions...\n');
  
  const tsFiles = getAllTsFiles(LIB_DIR);
  console.log(`Found ${tsFiles.length} TypeScript files to process\n`);
  
  for (const file of tsFiles) {
    fixImportsInFile(file);
  }
  
  console.log('\n✅ All imports have been fixed!');
  console.log('🔨 Now run `npm run build:lib` to rebuild the library');
}

main();
