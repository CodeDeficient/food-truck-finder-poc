const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const directoriesToScan = [
  path.join(__dirname, '../components'),
  path.join(__dirname, '../lib'),
  path.join(__dirname, '../app'),
  path.join(__dirname, '../hooks'),
];

function fixFilenameCase(filePath) {
  const basename = path.basename(filePath);
  const dirname = path.dirname(filePath);
  const ext = path.extname(filePath);
  const filename = path.basename(filePath, ext);

  if (filename.includes('-')) {
    const newFilename = filename.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
    const newFilePath = path.join(dirname, newFilename + ext);
    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        console.error(`Error renaming file ${filePath}:`, err);
      } else {
        console.log(`Renamed ${filePath} to ${newFilePath}`);
      }
    });
  }
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
          fixFilenameCase(filePath);
        }
      });
    });
  });
}

directoriesToScan.forEach(walkDir);
