const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const tsconfigPath = path.join(rootDir, 'tsconfig.base.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
const paths = tsconfig.compilerOptions.paths;

function resolveAlias(importPath, filePath) {
  for (const alias in paths) {
    if (importPath.startsWith(alias.replace('*', ''))) {
      const realPath = paths[alias][0].replace('*', '');
      const relativePath = path.relative(path.dirname(filePath), path.join(rootDir, realPath));
      return importPath.replace(alias.replace('*', ''), `${relativePath}/`);
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
        let resolvedPath = resolveAlias(p1, filePath);
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

addJsExtensions(path.join(rootDir, 'lib'));
addJsExtensions(path.join(rootDir, '.github', 'actions', 'scrape'));
