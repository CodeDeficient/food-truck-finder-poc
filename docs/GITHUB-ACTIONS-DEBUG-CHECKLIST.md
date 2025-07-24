# GitHub Actions Import Error Debug Checklist

## Problem:
The GitHub Actions workflow for scraping food trucks (`scrape-food-trucks.yml`) consistently failed with an `ERR_MODULE_NOT_FOUND` error for internal modules (e.g., `scrapingProcessor.js`, `scrapingJobService.js`), despite local TypeScript compilation being successful. This indicated a module resolution issue within the GitHub Actions runtime environment.

## Initial Hypothesis:
The problem likely stemmed from incorrect relative import paths in the compiled JavaScript files when executed within the GitHub Actions runner, specifically due to the `dist` directory structure created during the build process.

## Progress Made:
1.  **Verified `package.json` `type: "module"`**: Confirmed that `package.json` correctly specifies `"type": "module"` for ESM handling.
2.  **Examined `scrape-food-trucks.yml`**: Reviewed the workflow file and noted that it directly executes the compiled JavaScript (`node ./.github/actions/scrape/github-action-scraper.js`), bypassing the `uses:` directive.
3.  **Inspected `github-action-scraper.js`**: Analyzed the compiled JavaScript file and confirmed that its internal import paths were `../../dist/lib/...`, which were incorrect relative to its execution location (`./.github/actions/scrape/`).
4.  **Attempted Direct `package.json` Script Modification (Failed)**:
    *   Modified the `postbuild:action` script in `package.json` to use PowerShell `Get-Content` and `-replace` commands to directly adjust the import paths within `github-action-scraper.js` after copying.
    *   **Outcome**: This attempt failed in the GitHub Actions workflow with a `JSON.parse` error during `npm ci`, indicating that the PowerShell string escaping within the `package.json` JSON was incorrect.
5.  **Reverted `package.json`**: Reverted `package.json` to its state before the problematic PowerShell script modification to ensure a clean starting point.
6.  **Created Dedicated PowerShell Script**: Created a new PowerShell script (`scripts/fix-github-action-imports.ps1`) to encapsulate the import path replacement logic. This script takes the file path as a parameter.
7.  **Updated `package.json` to Call New Script**: Modified the `postbuild:action` script in `package.json` to call the newly created PowerShell script, passing the path to `github-action-scraper.js`.
8.  **Committed and Pushed Changes**: Committed the changes to `scripts/fix-github-action-imports.ps1` and `package.json`, and pushed them to the remote repository.
9.  **Triggered Workflow**: Manually triggered the "Scrape Food Trucks" workflow in GitHub Actions.

## Next Steps:
1.  **Monitor and Analyze Workflow Logs**: Immediately check the logs of the latest workflow run to determine if the `ERR_MODULE_NOT_FOUND` error is finally resolved.
2.  **If Error Persists**:
    *   Analyze the new logs for any different error messages or changes in the reported file paths.
    *   Based on the new information, conduct further research into Node.js module resolution in GitHub Actions, considering alternative bundling strategies (e.g., `ncc`, `esbuild`) if the current approach continues to be problematic.
    *   Prepare for a "brute-force" testing approach if necessary, systematically trying different import path variations or build configurations.