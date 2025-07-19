const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const componentsDir = path.join(__dirname, '../components');

function addReadonlyToInterface(filePath) {
  fs.readFile(filePath, 'utf8', (err, code) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);

    const transformations = [];

    function visit(node) {
      if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
        for (const member of node.members) {
          if (
            ts.isPropertySignature(member) &&
            !member.modifiers?.some((mod) => mod.kind === ts.SyntaxKind.ReadonlyKeyword)
          ) {
            transformations.push({
              pos: member.getStart(sourceFile),
              end: member.getStart(sourceFile),
              text: 'readonly ',
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
          console.log(`Added "readonly" to props in ${filePath}`);
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
        } else if (filePath.endsWith('.tsx')) {
          addReadonlyToInterface(filePath);
        }
      });
    });
  });
}

walkDir(componentsDir);
