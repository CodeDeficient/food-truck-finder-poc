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

- **Rule 1.16: Consolidate Action Plans**: To prevent document proliferation, all new, detailed, multi-step action plans for linting or refactoring should be added directly to the `docs/LINTING_AND_CODE_QUALITY_GUIDE.md` instead of being created in new, separate files.
  - *Trigger Case*: When a new, complex remediation effort is initiated.
  - *Example*: Instead of creating `LINTING_FIX_PLAN.md`, embed the plan within `LINTING_AND_CODE_QUALITY_GUIDE.md`.

- **Rule 1.17 (Refinement): Isolate and Conquer for Complex Files**: When refactoring a file with a high error count or significant complexity, adopt an "isolate and conquer" strategy. Fix only one type of error at a time, then immediately run a targeted lint check on that file to verify the fix and ensure no new errors were introduced before proceeding. Prioritize the easiest and highest-confidence errors (e.g., `sonarjs/different-types-comparison`, unused variables) before tackling structural refactoring (`max-lines-per-function`, `cognitive-complexity`).
  - *Trigger Case*: When a refactoring attempt on a complex file results in a neutral or negative change to the error count, or when facing multiple different error types in a single file.
  - *Example*: `npx eslint lib/data-quality/batchCleanup.ts` after fixing only the `sonarjs/different-types-comparison` errors in that file.

- **Rule 1.18: Handling Stubborn Lint Rules & False Positives**: When a lint rule proves difficult to fix or is identified as a potential false positive (e.g., `sonarjs/no-invariant-returns`, `@typescript-eslint/strict-boolean-expressions`, `@typescript-eslint/no-misused-promises` in `setInterval`/`setTimeout` contexts), follow this protocol:
  1. Attempt standard inline suppression (`// eslint-disable-next-line` or `/* eslint-disable */`).
  2. If suppression fails or is inappropriate, document the rule and the reason for its difficulty/false positive nature in `docs/LINTING_AND_CODE_QUALITY_GUIDE.md` under "Known Linter False Positives."
  3. Proceed with other remediation tasks, revisiting the stubborn rule only after significant progress has been made on other errors, or if a new understanding emerges.
  - *Trigger Case*: Persistent lint errors after multiple targeted fix attempts, or when a rule seems to misinterpret intentional code patterns.
  - *Example*: Documenting `sonarjs/no-invariant-returns` as a false positive in `lib/api/test-integration/pipelineRunner.ts` after multiple suppression attempts failed.

- **Rule 1.20: Explicit Callbacks for Array Methods**: When using array methods like `filter`, `map`, or `forEach` with a type guard or predicate function, prefer an explicit arrow function callback (e.g., `.filter((item): item is MyType => isMyType(item))` or `.filter((item) => isMyType(item))`) over a direct function reference (`.filter(isMyType)`). This improves readability, provides better type inference, and resolves `unicorn/no-array-callback-reference` warnings.
  - *Trigger Case*: `unicorn/no-array-callback-reference` warnings when passing a function reference directly to an array method.
  - *Example*: Change `recentJobs.filter(isScrapingJob)` to `recentJobs.filter((job) => isScrapingJob(job))`.

- **Rule 1.19: Prioritizing TypeScript Errors**: Any TypeScript errors (`ts Error`) introduced during refactoring or development must be addressed immediately and are considered critical linting issues, even if they do not appear in the ESLint `error-analysis.json` report.
  - *Trigger Case*: New TypeScript errors appear in the IDE or during `tsc --noEmit` checks.
  - *Example*: If removing `?? ''` causes a `TS2345` error, re-add the nullish coalescing or provide an explicit type guard to resolve the TypeScript error first.

- **Rule 1.21: Resolve Type Mismatches Caused by Lint Fixes**: When a linting fix (e.g., replacing `null` with `undefined` for `unicorn/no-null`) introduces a TypeScript error in a consuming component (e.g., a prop type mismatch), the TypeScript error must be resolved immediately. This may involve updating the type definitions in the consuming component or related files to align with the new value type.
    - *Trigger Case*: A TypeScript error appears immediately after a linting rule is fixed.
    - *Example*: After changing a prop value from `user ?? null` to `user ?? undefined` in a parent component, a `ts Error` appears. The child component's prop type must be updated from `User | null` to `User | undefined` to resolve the mismatch.

- **Rule 1.22: Handle Supabase Type Mismatches in Complex Structures**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.
  - *Trigger Case*: `TS2345` errors when assigning Supabase query results to interfaces containing nested array types that Supabase returns as generic `any[]` or `Record<string, any>[]`.
  - *Example*: Change `dietary_tags: string[]` to `dietary_tags: any[]` in `MenuItem` interface, or `cuisine_type: string[]` to `cuisine_type: any[]` in `FoodTruckSchema`, followed by explicit array transformation in data processing functions.

- **Rule 1.23: Autofix for Unused Imports**: Always use ESLint's autofix feature (`npx eslint . --fix`) as the primary method for resolving `sonarjs/unused-import` and `@typescript-eslint/no-unused-vars` errors related to imports. This is the fastest, safest, and most reliable approach.
  - *Trigger Case*: Presence of `unused-import` or `no-unused-vars` (for imports) errors in the lint report.
  - *Example*: `npx eslint . --fix`

- **Rule 1.24: Correcting Different Types Comparison**: For `sonarjs/different-types-comparison` errors, do not use type coercion or suppress the rule. Instead, correct the underlying logic by ensuring that the variables being compared are of the same type. This often involves fixing redundant checks or addressing issues in the data model.
  - *Trigger Case*: `sonarjs/different-types-comparison` errors reported by the linter.
  - *Example*: Instead of `if (myString !== undefined && myString !== '')`, use `if (myString)`.

- **Rule 1.25: Handle Supabase Type Mismatches in Complex Structures**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.
  - *Trigger Case*: `TS2345` errors when assigning Supabase query results to interfaces containing nested array types that Supabase returns as generic `any[]` or `Record<string, any>[]`.
  - *Example*: Change `dietary_tags: string[]` to `dietary_tags: any[]` in `MenuItem` interface, or `cuisine_type: string[]` to `cuisine_type: any[]` in `FoodTruckSchema`, followed by explicit array transformation in data processing functions.
- **Rule 1.26: Handle Supabase Service Return Types**: When calling Supabase service methods (e.g., `FoodTruckService.getAllTrucks()`, `FoodTruckService.getTruckById()`), explicitly check for the `error` property in the returned object. If an error exists, throw a new error with a descriptive message to ensure proper error propagation and type integrity for subsequent operations.
  - *Trigger Case*: Type errors when consuming results from Supabase service methods that can return an `{ error: string }` object.
  - *Example*:
    ```typescript
    // Before
    const result = await FoodTruckService.getAllTrucks();
    return result.trucks; // Type error if result is { error: string }
    // After
    const result = await FoodTruckService.getAllTrucks();
    if ('error' in result) {
      throw new Error(`Failed to fetch trucks: ${result.error}`);
    }
    return result.trucks;
    ```
