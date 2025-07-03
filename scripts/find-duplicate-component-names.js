import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

function getComponentImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const regex = /import\s+(?:[{'"](.*)['"}])\s+from\s+(['"]@?\/?components\/.*?['"])/g;
  const imports = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    // Process named or default imports
    const componentNames = match[1].split(',').map(name => name.trim());
    for (const name of componentNames) {
      if (name !== 'default') {
        imports.push(name);
      }
    }
  }
  return imports;
}

// Find all .tsx files
function getAllTSXFiles(dirPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  return files.reduce((acc, file) => {
    const fullPath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      return acc.concat(getAllTSXFiles(fullPath));
    } else if (path.extname(fullPath) === '.tsx') {
      return acc.concat(fullPath);
    }
    return acc;
  }, []);
}

// Main function
function findDuplicateComponents() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const allFiles = getAllTSXFiles(path.join(__dirname, '../components').replace(/\\/g, '/'));

  const componentUsageCounter = {};

  for (const filePath of allFiles) {
    const imports = getComponentImports(filePath);
    for (const componentName of imports) {
      if (!componentUsageCounter[componentName]) {
        componentUsageCounter[componentName] = [];
      }
      componentUsageCounter[componentName].push(filePath);
    }
  }

  const duplicateComponents = Object.entries(componentUsageCounter).filter(([, files]) => files.length > 1);

  if (duplicateComponents.length > 0) {
    console.log('Potentially duplicate components across files:');
    for (const [componentName, files] of duplicateComponents) {
      console.log(`- ${componentName}: Used in the following files:`);
      for (const file of files) {
        console.log(`  - ${file}`);
      }
    }
  } else {
    console.log('No duplicate component names found across files.');
  }
}

// Execute
findDuplicateComponents();
