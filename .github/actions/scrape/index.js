const { execSync } = require('child_process');
const path = require('path');

const scraperScript = path.join(__dirname, 'github-action-scraper.js');

try {
  execSync(`node ${scraperScript}`, { stdio: 'inherit' });
} catch (err) {
  console.error(`Failed to run scraper script: ${err}`);
  process.exit(1);
}
