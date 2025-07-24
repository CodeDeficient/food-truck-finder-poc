const { exec } = require('child_process');

exec('npx ncc build ./.github/actions/scrape/github-action-scraper.js -o ./.github/actions/scrape/dist --target es2020', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
