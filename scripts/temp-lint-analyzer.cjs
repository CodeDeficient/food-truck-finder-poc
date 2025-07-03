const results = require('../test-results/lint-results.json');
const filesWithErrors = results.filter((r) => r.errorCount > 0);
console.log(JSON.stringify(filesWithErrors, null, 2));
