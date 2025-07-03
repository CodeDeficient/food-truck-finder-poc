const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function fixUnusedImports() {
  const tsconfigPath = ts.findConfigFile(process.cwd(), ts.sys.fileExists, 'tsconfig.json');
  if (!tsconfigPath) {
    throw new Error('Could not find a valid tsconfig.json.');
  }

  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  const parsedCommandLine = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(tsconfigPath),
  );

  const program = ts.createProgram(parsedCommandLine.fileNames, parsedCommandLine.options);
  const sourceFiles = program.getSourceFiles();

  for (const sourceFile of sourceFiles) {
    const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
    const unusedImportDiagnostics = diagnostics.filter(
      (diag) => diag.code === 6133 || diag.code === 6192,
    );

    if (unusedImportDiagnostics.length > 0) {
      const changes = [];
      for (const diagnostic of unusedImportDiagnostics) {
        changes.push({
          start: diagnostic.start,
          length: diagnostic.length,
        });
      }

      changes.sort((a, b) => b.start - a.start);
      let code = sourceFile.getFullText();
      for (const change of changes) {
        code = code.slice(0, change.start) + code.slice(change.start + change.length);
      }

      fs.writeFileSync(sourceFile.fileName, code, 'utf8');
      console.log(`Removed unused imports in ${sourceFile.fileName}`);
    }
  }
}

fixUnusedImports();
