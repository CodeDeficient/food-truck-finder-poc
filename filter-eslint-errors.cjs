const fs = require('fs');
const results = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));
const strictBooleanErrors = results.flatMap(file => file.messages).filter(msg => msg.ruleId === '@typescript-eslint/strict-boolean-expressions');
console.log(JSON.stringify(strictBooleanErrors, null, 2));