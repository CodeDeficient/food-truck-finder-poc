const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const libDir = path.join(__dirname, '../lib');

function fixRequireAwait(filePath) {
  fs.readFile(filePath, 'utf8', (err, code) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

    const transformations = [];

    function visit(node) {
      if (
        (ts.isFunctionDeclaration(node) ||
          ts.isArrowFunction(node) ||
          ts.isMethodDeclaration(node)) &&
        node.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.AsyncKeyword)
      ) {
        let hasAwait = false;
        function checkAwait(node) {
          if (node.kind === ts.SyntaxKind.AwaitExpression) {
            hasAwait = true;
          }
          if (!hasAwait) {
            ts.forEachChild(node, checkAwait);
          }
        }
        checkAwait(node.body);

        if (!hasAwait) {
          const asyncModifier = node.modifiers.find(
            (mod) => mod.kind === ts.SyntaxKind.AsyncKeyword,
          );
          if (asyncModifier) {
            transformations.push({
              pos: asyncModifier.getStart(sourceFile),
              end: asyncModifier.getEnd(),
              text: '',
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    if (transformations.length > 0) {
      transformations.sort((a, b) => b.pos - a.pos);
      let newCode = code;
      for (const transform of transformations) {
        newCode = newCode.slice(0, transform.pos) + transform.text + newCode.slice(transform.end);
      }

      fs.writeFile(filePath, newCode, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`Fixed require-await in ${filePath}`);
        }
      });
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
        } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
          fixRequireAwait(filePath);
        }
      });
    });
  });
}

walkDir(libDir);
