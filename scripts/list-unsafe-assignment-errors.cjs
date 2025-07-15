
const fs = require('fs');
const path = require('path');

const lintResultsPath = path.join('C:/AI/food-truck-finder-poc', 'lint-results.json');

try {
    const lintResults = JSON.parse(fs.readFileSync(lintResultsPath, 'utf8'));
    const unsafeAssignmentErrors = [];

    lintResults.forEach(fileResult => {
        fileResult.messages.forEach(message => {
            if (message.ruleId === '@typescript-eslint/no-unsafe-assignment') {
                unsafeAssignmentErrors.push({
                    filePath: fileResult.filePath,
                    line: message.line,
                    column: message.column,
                    message: message.message
                });
            }
        });
    });

    if (unsafeAssignmentErrors.length > 0) {
        console.log('Files with @typescript-eslint/no-unsafe-assignment errors:');
        unsafeAssignmentErrors.forEach(error => {
            console.log(`- ${error.filePath}:${error.line}:${error.column} - ${error.message}`);
        });
    } else {
        console.log('No @typescript-eslint/no-unsafe-assignment errors found.');
    }

} catch (error) {
    console.error(`Error reading or parsing lint-results.json: ${error.message}`);
}
