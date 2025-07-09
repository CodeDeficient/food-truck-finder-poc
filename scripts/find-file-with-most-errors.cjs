const fs = require('fs');

const results = JSON.parse(fs.readFileSync('lint-results.json', 'utf8'));

const targetRuleIds = [
  '@typescript-eslint/no-unsafe-assignment',
  '@typescript-eslint/no-unsafe-call',
  '@typescript-eslint/no-unsafe-member-access',
  '@typescript-eslint/no-unnecessary-type-assertion',
  'sonarjs/no-unused-vars',
  'sonarjs/no-dead-store',
  '@typescript-eslint/no-unsafe-argument',
  '@typescript-eslint/no-unsafe-return',
  'sonarjs/no-redundant-assignments',
];

targetRuleIds.forEach(ruleId => {
  const fileErrorCounts = {};

  for (const file of results) {
    for (const message of file.messages) {
      if (message.ruleId === ruleId) {
        fileErrorCounts[file.filePath] = (fileErrorCounts[file.filePath] || 0) + 1;
      }
    }
  }

  const sortedFiles = Object.entries(fileErrorCounts).sort((a, b) => b[1] - a[1]);

  console.log(`\nTop files for ${ruleId}:`);
  if (sortedFiles.length > 0) {
    sortedFiles.slice(0, 5).forEach(([filePath, count]) => {
      console.log(`- ${filePath.replace(process.cwd(), '').replace(/\\/g, '/')}: ${count} errors`);
    });
  } else {
    console.log(`No files with ${ruleId} errors found.`);
  }
});