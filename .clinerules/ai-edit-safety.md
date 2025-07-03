## Brief overview
Project-specific guidelines for preventing diff mismatches when using AI-assisted code modifications.

## Replacement strategies
- **Exact character matching**: Ensure `replace_in_file` operations use exact pattern matches including whitespace and line endings.
  - Example: When replacing `const x = 5;` with `const x = 6;`, the entire line must be matched to prevent accidental changes in multi-line statements.
- **SEARCH block verification**:Always read the file immediately before constructing `replace_in_file` operations to capture current code structure.
- **Version control integration**: Compare against current version prior to replacing to verify structural alignment

## Type enforcement
- **Explicit typing**: Declare all variable and function types when adding/refactoring code to avoid unintended type changes.
  - Example: Use `const data: MyType = await response.json();` instead of implicit typing.
- **Nullish explicit handling**: Handle `null`/`undefined` through conditional checks rather than implicit coercion.
  - Example: Replace `if (value)` with `if (value ?? false)` or `if (value !== undefined)`.

## Linting automation
- **Multi-pass auto-fixing**: Run `npx eslint . --fix` multiple times or target specific files for thorough correction.
  - Example: After `unicorn/no-useless-undefined` fixes, re-run on modified files to catch subsequent issues.
