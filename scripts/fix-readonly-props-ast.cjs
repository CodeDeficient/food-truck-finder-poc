const fs = require('fs');
const path = require('path');
const { parse, TSESTree } = require('@typescript-eslint/typescript-estree');
const estraverse = require('estraverse');

const componentsDir = path.join(__dirname, '../components');

function addReadonlyToInterface(filePath) {
  fs.readFile(filePath, 'utf8', (err, code) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    try {
      const ast = parse(code, {
        jsx: true,
        useJSXTextNode: true,
        loc: true,
        range: true,
      });

      let modified = false;

      estraverse.traverse(ast, {
        enter: (node) => {
          if (node.type === 'TSInterfaceDeclaration' && node.id.name.endsWith('Props')) {
            for (const property of node.body.body) {
              if (property.type === 'TSPropertySignature' && !property.readonly) {
                property.readonly = true;
                modified = true;
              }
            }
          }
        },
      });

      if (modified) {
        const { code: newCode } = require('escodegen').generate(ast);
        fs.writeFile(filePath, newCode, 'utf8', (err) => {
          if (err) {
            console.error(`Error writing file ${filePath}:`, err);
          } else {
            console.log(`Added "readonly" to props in ${filePath}`);
          }
        });
      }
    } catch (e) {
      console.error(`Error parsing or traversing ${filePath}:`, e);
    }
  });
}

function walkDir(dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      fs.stat(filePath, (err, stat) => {
        if (err) {
          console.error(`Error stating file ${filePath}:`, err);
          return;
        }

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (filePath.endsWith('.tsx')) {
          addReadonlyToInterface(filePath);
        }
      });
    });
  });
}

walkDir(componentsDir);
