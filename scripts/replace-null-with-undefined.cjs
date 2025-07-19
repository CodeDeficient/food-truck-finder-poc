const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../components');

function replaceInFile(filePath) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err);
      return;
    }

    const result = data.replace(/return null;/g, 'return undefined;');

    if (result !== data) {
      fs.writeFile(filePath, result, 'utf8', (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err);
        } else {
          console.log(`Replaced "return null;" with "return undefined;" in ${filePath}`);
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
          replaceInFile(filePath);
        }
      });
    });
  });
}

walkDir(componentsDir);
