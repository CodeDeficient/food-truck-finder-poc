import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scraperScript = path.join(__dirname, 'github-action-scraper.js');

try {
  const result = spawnSync('node', [scraperScript], { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Scraper script exited with code ${result.status}`);
  }
} catch (err) {
  console.error(`Failed to run scraper script: ${err}`);
  process.exit(1);
}
