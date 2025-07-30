import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scraperScript = path.join(__dirname, 'dist', 'github-action-scraper.js');

try {
  const result = spawnSync('node', [scraperScript], { stdio: 'inherit' });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`Scraper script exited with code ${result.status}`);
  }
} catch (error) {
  console.error(`Failed to run scraper script: ${error}`);
  process.exit(1);
}
