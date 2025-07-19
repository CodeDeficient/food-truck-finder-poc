
const fs = require('fs');
const path = require('path');

const lintResultsPath = path.join('C:/AI/food-truck-finder-poc', 'lint-results.json');

try {
    const lintResults = JSON.parse(fs.readFileSync(lintResultsPath, 'utf8'));
    const errorCounts = {};

    lintResults.forEach(fileResult => {
        fileResult.messages.forEach(message => {
            if (message.ruleId && message.ruleId.startsWith('@typescript-eslint/no-unsafe-')) {
                errorCounts[message.ruleId] = (errorCounts[message.ruleId] || 0) + 1;
            }
        });
    });

    const sortedErrors = Object.entries(errorCounts).sort(([, countA], [, countB]) => countB - countA);

    if (sortedErrors.length > 0) {
        console.log('Top @typescript-eslint/no-unsafe-* errors:');
        sortedErrors.forEach(([ruleId, count]) => {
            console.log(`- ${ruleId}: ${count}`);
        });
    } else {
        console.log('No @typescript-eslint/no-unsafe-* errors found.');
    }

} catch (error) {
    console.error(`Error reading or parsing lint-results.json: ${error.message}`);
}
