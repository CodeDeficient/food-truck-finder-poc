import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Extracts component import names from a given file.
 * @example
 * getComponentImports('path/to/file.js')
 * ['ComponentA', 'ComponentB', 'ComponentC']
 * @param {string} filePath - The path to the file from which to extract component imports.
 * @returns {Array<string>} An array of import names excluding default imports.
 * @description
 *   - Parses the file content using a regex to identify component imports.
 *   - Handles both named imports and reassigns them into an array.
 *   - Ignores `default` imports during extraction.
 */
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
/**
* Recursively retrieves all '.tsx' files within a given directory.
* @example
* getAllTSXFiles('./src')
* ['src/components/MyComponent.tsx', 'src/pages/Index.tsx']
* @param {string} dirPath - Path to the directory to search for '.tsx' files.
* @returns {Array<string>} List of file paths with '.tsx' extension found in the directory.
* @description
*   - Uses synchronous file system operations to ensure all directory entries are processed.
*   - Recursion is employed to traverse subdirectories and gather files.
*   - Filters out non '.tsx' files from the final result.
*/
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
/**
 * Identifies and logs potentially duplicate component names across multiple files.
 * @example
 * findDuplicateComponents()
 * Potentially duplicate components across files:
 * - ComponentA: Used in the following files:
 *   - /path/to/file1.tsx
 *   - /path/to/file2.tsx
 * @param {none} {} - This function does not take any arguments.
 * @returns {void} This function does not return a value.
 * @description
 *   - Scans all `.tsx` files within the specified components directory.
 *   - Collects import statements of components from each file.
 *   - Counts occurrences of each imported component name.
 *   - Logs component names found in more than one file.
 */
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
