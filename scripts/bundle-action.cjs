const { exec } = require('child_process');

const { execSync } = require('child_process');
const path = require('path');

const outputDir = path.join(__dirname, '..', '.github', 'actions', 'scrape', 'dist');
const entrypoint = path.join(__dirname, '..', '.github', 'actions', 'scrape', 'index.js');

try {
  // Bundle the action
  execSync(`npx ncc build ${entrypoint} -o ${outputDir}`, { stdio: 'inherit' });
  console.log('Action bundled successfully.');
} catch (err) {
  console.error('Failed to bundle action:', err);
  process.exit(1);
}
