## Brief overview
This rule set documents key operational learnings and best practices derived from recent interactions, focusing on improving efficiency and accuracy in code remediation and file system interactions. These are global rules applicable across tasks.

## Development workflow
- **Rule 1.1: Prioritize Fresh Linting Data**: Before initiating any linting fixes, always ensure the `lint-results.json` file is up-to-date. Outdated data leads to wasted effort on already resolved issues.
  - *Trigger Case*: When starting a new linting remediation session or after significant code changes.
  - *Example*: Run `npx eslint . --format json --output-file lint-results.json` immediately before analyzing errors.

- **Rule 1.2: Precision in `replace_in_file`**: When using `replace_in_file`, ensure `SEARCH` blocks are an exact, character-for-character match, including all whitespace and line endings. If unsure, re-read the file content immediately before constructing the `SEARCH` block.
  - *Trigger Case*: Any time `replace_in_file` is used.
  - *Example*: If a `replace_in_file` operation fails due to a non-matching `SEARCH` block, re-read the target file to get its exact current content.

- **Rule 1.3: Verify File System Paths**: Before attempting to create or write to a file/directory, verify its existence and type (file vs. directory) to prevent `ENOENT` errors or accidental overwrites.
  - *Trigger Case*: Before `mkdir` or `write_to_file` operations on paths whose nature is uncertain.
  - *Example*: Use `list_files` on the parent directory to confirm if a path is a file or a directory before attempting to create or write to it.

- **Rule 1.4: Maintain Type Safety During Refactoring**: When extracting functions or modifying code in TypeScript files, ensure that the changes do not introduce type errors.
  - *Trigger Case*: After refactoring TypeScript code.
  - *Example*: After extracting a function, check the new file for any type errors and resolve them promptly.

- **Rule 1.5: Adhere to `max-lines-per-function` Rule**: When refactoring, be mindful of the `max-lines-per-function` rule. If a file becomes too long after moving components into it, extract those components into their own files.
  - *Trigger Case*: After moving components into a file, or when a function exceeds the line limit.
  - *Example*: If `SearchFilterContent.tsx` exceeds the line limit after moving `MainSearchSection` into it, extract `MainSearchSection` into its own file.

- **Rule 1.6: Handle `strict-boolean-expressions` Explicitly**: When dealing with `strict-boolean-expressions` errors, ensure that nullable string values are explicitly checked for `null` and `undefined` before checking their length.
  - *Trigger Case*: When a conditional check on a nullable string value is flagged by the linter.
  - *Example*: Instead of `if (typeof myString === 'string' && myString.length > 0)`, use `if (myString !== null && myString !== undefined && myString.length > 0)`.

- **Rule 1.7: Simplify `unicorn/no-useless-undefined`**: For `unicorn/no-useless-undefined` errors, simplify conditional checks. Instead of `if (handle === undefined || handle.length === 0)`, use `if (!handle)` to handle `undefined`, `null`, and empty strings.
  - *Trigger Case*: When a conditional check with `undefined` is flagged by the linter.
  - *Example*: Change `if (handle === undefined || handle.length === 0)` to `if (!handle)`.

- **Rule 1.8: Be Aware of Stale Linter Errors**: Be aware that the `LINTING_FIX_PLAN.md` may contain stale errors. Always verify the errors against the current state of the code.
  - *Trigger Case*: When an error reported in the `LINTING_FIX_PLAN.md` is not present in the code.
  - *Example*: If `LINTING_FIX_PLAN.md` reports an unused import that is not present in the file, assume it's a stale error and move on.

- **Rule 1.9: Use `.tsx` for Files with JSX**: Ensure that files containing JSX syntax have a `.tsx` extension.
  - *Trigger Case*: When creating a new file with JSX, or when encountering JSX-related errors in a `.ts` file.
  - *Example*: Rename `status-helpers.ts` to `status-helpers.tsx` if it contains JSX.

- **Rule 1.10: Script Multiple File Operations**: When performing multiple file system operations (e.g., moving or deleting many files), create a batch script (`.bat` for Windows or `.sh` for Unix-like systems) to execute all commands at once. This improves efficiency and reduces manual errors.
  - *Trigger Case*: When more than two file `move` or `del` commands are needed.
  - *Example*: Create `move_files.bat` containing `move "file1.txt" "dest/file1.txt"` and `move "file2.txt" "dest/file2.txt"`, then execute `.\move_files.bat`.

- **Rule 1.11: Consistent Type Imports**: Always ensure that shared types (like `FoodTruck`, `MenuItem`, `DailyOperatingHours`) are imported from a single, authoritative source (`lib/types.ts`) across the entire codebase. Local re-declarations of interfaces can lead to subtle and hard-to-debug type incompatibilities.
  - *Trigger Case*: Encountering type incompatibility errors due to duplicate or conflicting interface definitions.
  - *Example*: Change `import { FoodTruck } from '@/lib/types/foodTruck';` to `import { FoodTruck } from '@/lib/types';` and remove any local `interface FoodTruck { ... }` definitions.

- **Rule 1.12: Type Guarding for `Math.min`/`Math.max`**: When using `Math.min` or `Math.max` on arrays that might contain `undefined` or `string` values (e.g., `MenuItem.price`), explicitly filter out non-numeric or `undefined` values using type guards (`.filter((item): item is number => typeof item === 'number' && item !== undefined)`) to ensure only numbers are passed to these functions.
  - *Trigger Case*: `TS2345` errors when passing arrays with mixed types to `Math.min` or `Math.max`.
  - *Example*: `const numericPrices = allItems.map(item => item.price).filter((price): price is number => typeof price === 'number' && price !== undefined);`

- **Rule 1.13: Flexible `formatPrice` Handling**: If a `price` property can be either a `number` or a `string` (e.g., for ranges like "$10-$20" or "Varies"), ensure that the `formatPrice` utility function is updated to handle both types gracefully.
  - *Trigger Case*: Type errors when passing string prices to `formatPrice` or when `formatPrice` is used in contexts expecting a number.
  - *Example*: Modify `formatPrice = (price: number | string) => { if (typeof price === 'string') return price; ... }`.

- **Rule 1.14: Comprehensive `DailyOperatingHours` Handling**: When working with `DailyOperatingHours`, ensure that components and utility functions (like `formatHours`) explicitly account for all possible variants of the type, especially `{ closed: true }`, and not just `{ open: string; close: string; closed: boolean }`. This prevents type mismatches when passing `DailyOperatingHours` objects around.
  - *Trigger Case*: Type errors related to `DailyOperatingHours` missing `open` or `close` properties when `closed` is true.
  - *Example*: Update `formatHours = (hours: DailyOperatingHours) => { if (!hours || hours.closed) return 'Closed'; ... }`.

- **Rule 1.15: Removing `@ts-expect-error` Directives**: Systematically remove `@ts-expect-error` directives. If errors reappear, investigate the underlying cause (missing package types, incorrect `tsconfig.json` configuration, or actual type mismatches) rather than suppressing them.
  - *Trigger Case*: Presence of `@ts-expect-error` comments in the codebase.
  - *Example*: Remove `// @ts-expect-error` and resolve the underlying TypeScript error by installing missing types, adjusting `tsconfig.json`, or correcting code.
