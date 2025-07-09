const fs = require('fs');

const inputFile = 'temp-lint-results.json';
const outputFile = 'lint-results.json';

try {
  const data = fs.readFileSync(inputFile, 'utf8');
  const parsed = JSON.parse(data);
  fs.writeFileSync(outputFile, JSON.stringify(parsed, null, 2), 'utf8');
  console.log(`Successfully pretty-printed ${inputFile} to ${outputFile}`);
} catch (e) {
  console.error(`Error processing ${inputFile}:`, e);
}