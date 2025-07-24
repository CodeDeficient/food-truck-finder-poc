import { exec } from 'child_process';

exec('npx ncc build ./.github/actions/scrape/github-action-scraper.js -o ./.github/actions/scrape/dist --target es5 --no-minify', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
