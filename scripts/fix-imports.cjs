const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, '..', 'lib');
const tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const paths = tsconfig.compilerOptions.paths;

function resolveAlias(importPath) {
  for (const alias in paths) {
    if (importPath.startsWith(alias.replace('*', ''))) {
      const realPath = paths[alias][0].replace('*', '');
      return importPath.replace(alias.replace('*', ''), `../${realPath}`);
    }
  }
  return importPath;
}

function addJsExtensions(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      addJsExtensions(filePath);
    } else if (filePath.endsWith('.js')) {
      let content = fs.readFileSync(filePath, 'utf8');
      const importRegex = /from\s+['"](.*?)['"]/g;
      let changed = false;

      content = content.replace(importRegex, (match, p1) => {
        let resolvedPath = resolveAlias(p1);
        if (resolvedPath.startsWith('.') && !resolvedPath.endsWith('.js')) {
          changed = true;
          return `from '${resolvedPath}.js'`;
        }
        return match;
      });

      if (changed) {
        console.log(`Fixing imports in ${filePath}`);
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  }
}

addJsExtensions(libDir);
