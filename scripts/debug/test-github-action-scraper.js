import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Now run the GitHub Actions scraper
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scraperPath = path.join(__dirname, '.github', 'actions', 'scrape', 'dist', 'github-action-scraper.js');

const child = spawn('node', [scraperPath, '--limit', '3'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  console.log(`GitHub Actions scraper exited with code ${code}`);
});
