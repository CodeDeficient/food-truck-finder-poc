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

## Operational Learnings

- **Rule 1.1: Prioritize Fresh Linting Data**: Before initiating any linting fixes, always ensure the `lint-results.json` file is up-to-date. Outdated data leads to wasted effort on already resolved issues.

  - _Trigger Case_: When starting a new linting remediation session or after significant code changes.
  - _Example_: Run `npx eslint . --format json --output-file lint-results.json` immediately before analyzing errors.

- **Rule 1.2: Precision in `replace_in_file`**: When using `replace_in_file`, ensure `SEARCH` blocks are an exact, character-for-character match, including all whitespace and line endings. If unsure, re-read the file content immediately before constructing the `SEARCH` block.

  - _Trigger Case_: Any time `replace_in_file` is used.
  - _Example_: If a `replace_in_file` operation fails due to a non-matching `SEARCH` block, re-read the target file to get its exact current content.

- **Rule 1.3: Verify File System Paths**: Before attempting to create or write to a file/directory, verify its existence and type (file vs. directory) to prevent `ENOENT` errors or accidental overwrites.

  - _Trigger Case_: Before `mkdir` or `write_to_file` operations on paths whose nature is uncertain.
  - _Example_: Use `list_files` on the parent directory to confirm if a path is a file or a directory before attempting to create or write to it.

- **Rule 1.4: Maintain Type Safety During Refactoring**: When extracting functions or modifying code in TypeScript files, ensure that the changes do not introduce type errors.

  - _Trigger Case_: After refactoring TypeScript code.
  - _Example_: After extracting a function, check the new file for any type errors and resolve them promptly.

- **Rule 1.5: Adhere to `max-lines-per-function` Rule**: When refactoring, be mindful of the `max-lines-per-function` rule. If a file becomes too long after moving components into it, extract those components into their own files.

  - _Trigger Case_: After moving components into a file, or when a function exceeds the line limit.
  - _Example_: If `SearchFilterContent.tsx` exceeds the line limit after moving `MainSearchSection` into it, extract `MainSearchSection` into its own file.

- **Rule 1.6: Handle `strict-boolean-expressions` Explicitly**: When dealing with `strict-boolean-expressions` errors, ensure that nullable string values are explicitly checked for `null` and `undefined` before checking their length.

  - _Trigger Case_: When a conditional check on a nullable string value is flagged by the linter.
  - _Example_: Instead of `if (typeof myString === 'string' && myString.length > 0)`, use `if (myString !== null && myString !== undefined && myString.length > 0)`.

- **Rule 1.7: Simplify `unicorn/no-useless-undefined`**: For `unicorn/no-useless-undefined` errors, simplify conditional checks. Instead of `if (handle === undefined || handle.length === 0)`, use `if (!handle)` to handle `undefined`, `null`, and empty strings.

  - _Trigger Case_: When a conditional check with `undefined` is flagged by the linter.
  - _Example_: Change `if (handle === undefined || handle.length === 0)` to `if (!handle)`.

- **Rule 1.8: Be Aware of Stale Linter Errors**: Be aware that the `LINTING_FIX_PLAN.md` may contain stale errors. Always verify the errors against the current state of the code.

  - _Trigger Case_: When an error reported in the `LINTING_FIX_PLAN.md` is not present in the code.
  - _Example_: If `LINTING_FIX_PLAN.md` reports an unused import that is not present in the file, assume it's a stale error and move on.

- **Rule 1.9: Use `.tsx` for Files with JSX**: Ensure that files containing JSX syntax have a `.tsx` extension.

  - _Trigger Case_: When creating a new file with JSX, or when encountering JSX-related errors in a `.ts` file.
  - _Example_: Rename `status-helpers.ts` to `status-helpers.tsx` if it contains JSX.

- **Rule 1.10: Script Multiple File Operations**: When performing multiple file system operations (e.g., moving or deleting many files), create a batch script (`.bat` for Windows or `.sh` for Unix-like systems) to execute all commands at once. This improves efficiency and reduces manual errors.

  - _Trigger Case_: When more than two file `move` or `del` commands are needed.
  - _Example_: Create `move_files.bat` containing `move "file1.txt" "dest/file1.txt"` and `move "file2.txt" "dest/file2.txt"`, then execute `.\move_files.bat`.

- **Rule 1.11: Consistent Type Imports**: Always ensure that shared types (like `FoodTruck`, `MenuItem`, `DailyOperatingHours`) are imported from a single, authoritative source (`lib/types.ts`) across the entire codebase. Local re-declarations of interfaces can lead to subtle and hard-to-debug type incompatibilities.

  - _Trigger Case_: Encountering type incompatibility errors due to duplicate or conflicting interface definitions.
  - _Example_: Change `import { FoodTruck } from '@/lib/types/foodTruck';` to `import { FoodTruck } from '@/lib/types';` and remove any local `interface FoodTruck { ... }` definitions.

- **Rule 1.12: Type Guarding for `Math.min`/`Math.max`**: When using `Math.min` or `Math.max` on arrays that might contain `undefined` or `string` values (e.g., `MenuItem.price`), explicitly filter out non-numeric or `undefined` values using type guards (`.filter((item): item is number => typeof item === 'number' && item !== undefined)`) to ensure only numbers are passed to these functions.

  - _Trigger Case_: `TS2345` errors when passing arrays with mixed types to `Math.min` or `Math.max`.
  - _Example_: `const numericPrices = allItems.map(item => item.price).filter((price): price is number => typeof price === 'number' && price !== undefined);`

- **Rule 1.13: Flexible `formatPrice` Handling**: If a `price` property can be either a `number` or a `string` (e.g., for ranges like "$10-$20" or "Varies"), ensure that the `formatPrice` utility function is updated to handle both types gracefully.

  - _Trigger Case_: Type errors when passing string prices to `formatPrice` or when `formatPrice` is used in contexts expecting a number.
  - _Example_: Modify `formatPrice = (price: number | string) => { if (typeof price === 'string') return price; ... }`.

- **Rule 1.14: Comprehensive `DailyOperatingHours` Handling**: When working with `DailyOperatingHours`, ensure that components and utility functions (like `formatHours`) explicitly account for all possible variants of the type, especially `{ closed: true }`, and not just `{ open: string; close: string; closed: boolean }`. This prevents type mismatches when passing `DailyOperatingHours` objects around.

  - _Trigger Case_: Type errors related to `DailyOperatingHours` missing `open` or `close` properties when `closed` is true.
  - _Example_: Update `formatHours = (hours: DailyOperatingHours) => { if (!hours || hours.closed) return 'Closed'; ... }`.

- **Rule 1.15: Removing `@ts-expect-error` Directives**: Systematically remove `@ts-expect-error` directives. If errors reappear, investigate the underlying cause (missing package types, incorrect `tsconfig.json` configuration, or actual type mismatches) rather than suppressing them.

  - _Trigger Case_: Presence of `@ts-expect-error` comments in the codebase.
  - _Example_: Remove `// @ts-expect-error` and resolve the underlying TypeScript error by installing missing types, adjusting `tsconfig.json`, or correcting code.

- **Rule 1.16: Consolidate Action Plans**: To prevent document proliferation, all new, detailed, multi-step action plans for linting or refactoring should be added directly to the `docs/LINTING_AND_CODE_QUALITY_GUIDE.md` instead of being created in new, separate files.

  - _Trigger Case_: When a new, complex remediation effort is initiated.
  - _Example_: Instead of creating `LINTING_FIX_PLAN.md`, embed the plan within `LINTING_AND_CODE_QUALITY_GUIDE.md`.

- **Rule 1.17 (Refinement): Isolate and Conquer for Complex Files**: When refactoring a file with a high error count or significant complexity, adopt an "isolate and conquer" strategy. Fix only one type of error at a time, then immediately run a targeted lint check on that file to verify the fix and ensure no new errors were introduced before proceeding. Prioritize the easiest and highest-confidence errors (e.g., `sonarjs/different-types-comparison`, unused variables) before tackling structural refactoring (`max-lines-per-function`, `cognitive-complexity`).

  - _Trigger Case_: When a refactoring attempt on a complex file results in a neutral or negative change to the error count, or when facing multiple different error types in a single file.
  - _Example_: `npx eslint lib/data-quality/batchCleanup.ts` after fixing only the `sonarjs/different-types-comparison` errors in that file.

- **Rule 1.18: Handling Stubborn Lint Rules & False Positives**: When a lint rule proves difficult to fix or is identified as a potential false positive (e.g., `sonarjs/no-invariant-returns`, `@typescript-eslint/strict-boolean-expressions`, `@typescript-eslint/no-misused-promises` in `setInterval`/`setTimeout` contexts), follow this protocol:

  1. Attempt standard inline suppression (`// eslint-disable-next-line` or `/* eslint-disable */`).
  2. If suppression fails or is inappropriate, document the rule and the reason for its difficulty/false positive nature in `docs/LINTING_AND_CODE_QUALITY_GUIDE.md` under "Known Linter False Positives."
  3. Proceed with other remediation tasks, revisiting the stubborn rule only after significant progress has been made on other errors, or if a new understanding emerges.

  - _Trigger Case_: Persistent lint errors after multiple targeted fix attempts, or when a rule seems to misinterpret intentional code patterns.
  - _Example_: Documenting `sonarjs/no-invariant-returns` as a false positive in `lib/api/test-integration/pipelineRunner.ts` after multiple suppression attempts failed.

- **Rule 1.20: Explicit Callbacks for Array Methods**: When using array methods like `filter`, `map`, or `forEach` with a type guard or predicate function, prefer an explicit arrow function callback (e.g., `.filter((item): item is MyType => isMyType(item))` or `.filter((item) => isMyType(item))`) over a direct function reference (`.filter(isMyType)`). This improves readability, provides better type inference, and resolves `unicorn/no-array-callback-reference` warnings.

  - _Trigger Case_: `unicorn/no-array-callback-reference` warnings when passing a function reference directly to an array method.
  - _Example_: Change `recentJobs.filter(isScrapingJob)` to `recentJobs.filter((job) => isScrapingJob(job))`.

- **Rule 1.19: Prioritizing TypeScript Errors**: Any TypeScript errors (`ts Error`) introduced during refactoring or development must be addressed immediately and are considered critical linting issues, even if they do not appear in the ESLint `error-analysis.json` report.

  - _Trigger Case_: New TypeScript errors appear in the IDE or during `tsc --noEmit` checks.
  - _Example_: If removing `?? ''` causes a `TS2345` error, re-add the nullish coalescing or provide an explicit type guard to resolve the TypeScript error first.

- **Rule 1.21: Resolve Type Mismatches Caused by Lint Fixes**: When a linting fix (e.g., replacing `null` with `undefined` for `unicorn/no-null`) introduces a TypeScript error in a consuming component (e.g., a prop type mismatch), the TypeScript error must be resolved immediately. This may involve updating the type definitions in the consuming component or related files to align with the new value type.

  - _Trigger Case_: A TypeScript error appears immediately after a linting rule is fixed.
  - _Example_: After changing a prop value from `user ?? null` to `user ?? undefined` in a parent component, a `ts Error` appears. The child component's prop type must be updated from `User | null` to `User | undefined` to resolve the mismatch.

- **Rule 1.22: Handle Supabase Type Mismatches in Complex Structures**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.

  - _Trigger Case_: `TS2345` errors when assigning Supabase query results to interfaces containing nested array types that Supabase returns as generic `any[]` or `Record<string, any>[]`.
  - _Example_: Change `dietary_tags: string[]` to `dietary_tags: any[]` in `MenuItem` interface, or `cuisine_type: string[]` to `cuisine_type: any[]` in `FoodTruckSchema`, followed by explicit array transformation in data processing functions.

- **Rule 1.23: Autofix for Unused Imports**: Always use ESLint's autofix feature (`npx eslint . --fix`) as the primary method for resolving `sonarjs/unused-import` and `@typescript-eslint/no-unused-vars` errors related to imports. This is the fastest, safest, and most reliable approach.

  - _Trigger Case_: Presence of `unused-import` or `no-unused-vars` (for imports) errors in the lint report.
  - _Example_: `npx eslint . --fix`

- **Rule 1.24: Correcting Different Types Comparison**: For `sonarjs/different-types-comparison` errors, do not use type coercion or suppress the rule. Instead, correct the underlying logic by ensuring that the variables being compared are of the same type. This often involves fixing redundant checks or addressing issues in the data model.

  - _Trigger Case_: `sonarjs/different-types-comparison` errors reported by the linter.
  - _Example_: Instead of `if (myString !== undefined && myString !== '')`, use `if (myString)`.

- **Rule 1.25: Handle Supabase Type Mismatches in Complex Structures**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.
  - _Trigger Case_: `TS2345` errors when assigning Supabase query results to interfaces containing nested array types that Supabase returns as generic `any[]` or `Record<string, any>[]`.
  - _Example_: Change `dietary_tags: string[]` to `dietary_tags: any[]` in `MenuItem` interface, or `cuisine_type: string[]` to `cuisine_type: any[]` in `FoodTruckSchema`, followed by explicit array transformation in data processing functions.
- **Rule 1.26: Handle Supabase Service Return Types**: When calling Supabase service methods (e.g., `FoodTruckService.getAllTrucks()`, `FoodTruckService.getTruckById()`), explicitly check for the `error` property in the returned object. If an error exists, throw a new error with a descriptive message to ensure proper error propagation and type integrity for subsequent operations.

  - _Trigger Case_: Type errors when consuming results from Supabase service methods that can return an `{ error: string }` object.
  - _Example_:
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

- **Rule 1.27: Verify File Paths and Use Search as a Fallback**: Before attempting to read or write a file, verify its existence. If a `read_file` operation fails with a "File not found" error, do not assume the file is missing. Instead, use `search_files` to locate the file or confirm its absence. This prevents errors caused by incorrect path assumptions.

  - _Trigger Case_: A `read_file` operation fails, or when the exact path of a file is uncertain.
  - _Example_: If `read_file('app/api/auth/callback/route.ts')` fails, use `search_files(regex='handleSuccessfulAuth')` to find the correct file where the function is being called.

- **Rule 1.28: Immediate Re-Read After `replace_in_file` Failure**: If a `replace_in_file` operation fails for any reason (e.g., non-matching `SEARCH` block, merge conflict), _immediately_ re-read the file using `read_file` before attempting another modification. Do not assume the file's state is known. This prevents cascading failures due to stale context.

  - _Trigger Case_: Any `replace_in_file` operation that fails.
  - _Example_: If a `replace_in_file` operation on `lib/supabase.ts` fails, immediately call `read_file('lib/supabase.ts')` before constructing a new `replace_in_file` request.

- **Rule 1.29: Validate `await` Usage Against Function Return Types**: Before using `await` on a function call, verify that the function is `async` and returns a `Promise`. Redundant `await` keywords on non-Promise-returning functions can lead to linting errors and unnecessary complexity.

  - _Trigger Case_: Encountering `@typescript-eslint/await-thenable` or `sonarjs/no-invalid-await` errors.
  - _Example_: If `myFunction()` returns `void` or a non-Promise value, avoid `await myFunction();`. If `myAsyncFunction()` returns `Promise<T>`, then `await myAsyncFunction();` is appropriate.

- **Rule 1.35: Validate `await` Usage Against Function Return Types**: Before using `await` on a function call, verify that the function is `async` and returns a `Promise`. Redundant `await` keywords on non-Promise-returning functions can lead to linting errors and unnecessary complexity.

  - _Trigger Case_: Encountering `@typescript-eslint/await-thenable` or `sonarjs/no-invalid-await` errors.
  - _Example_: If `myFunction()` returns `void` or a non-Promise value, avoid `await myFunction();`. If `myAsyncFunction()` returns `Promise<T>`, then `await myAsyncFunction();` is appropriate.

- **Rule 1.30: Avoid Redundant Optional Type Declarations**: When declaring TypeScript properties, avoid using both optional property syntax (`?:`) and union with `undefined` (`| undefined`) simultaneously, as this creates redundant type information.

  - _Trigger Case_: `sonarjs/no-redundant-optional` errors when a property is declared as `prop?: T | undefined`.
  - _Example_: Change `lat?: number | undefined` to either `lat?: number` or `lat: number | undefined`, but not both.

- **Rule 1.31: Safe Error Object Stringification**: When converting error objects to strings for logging or error messages, avoid using `String(error)` on `unknown` or `any` typed errors. Use proper type guards and `JSON.stringify()` for complex objects.

  - _Trigger Case_: `@typescript-eslint/no-base-to-string` errors when stringifying error objects.
  - _Example_: Instead of `String(error)`, use `error instanceof Error ? error.message : JSON.stringify(error)`.

- **Rule 1.32: Optimize Return Statements for Undefined**: For functions that return `undefined`, use `return;` instead of `return undefined;` to avoid unnecessary explicit undefined usage.

  - _Trigger Case_: `unicorn/no-useless-undefined` errors in return statements.
  - _Example_: Change `return undefined;` to `return;` when the function implicitly returns `undefined`.

- **Rule 1.33: ESLint Auto-fix Requires Multiple Passes**: ESLint's `--fix` option may not catch all auto-fixable issues in a single pass. When dealing with complex interdependent issues, run auto-fix multiple times or target specific files for more thorough correction.

  - _Trigger Case_: When auto-fix appears to miss obvious fixable issues.
  - _Example_: Run `npx eslint . --fix` multiple times, or use `npx eslint specific-file.ts --fix` for targeted fixes.

- **Rule 1.34: Stabilize `react-leaflet` in React Strict Mode**: To prevent the "Map container is already initialized" error in `react-leaflet` when using React's Strict Mode, manage the map instance using a state variable and the `ref` prop on the `MapContainer`. Conditionally render map children (like `TileLayer`, `Marker`, etc.) only after the map instance has been successfully created.

  - _Trigger Case_: The application throws a "Map container is already initialized" error.
  - _Example_:

    ```typescript
    const [map, setMap] = useState<Map | null>(null);

    return (
      <MapContainer ref={setMap}>
        {map ? (
          <>
            <TileLayer ... />
            <Marker ... />
          </>
        ) : null}
      </MapContainer>
    );
    ```

- **Rule 1.35: Validate `await` Usage Against Function Return Types**: Before using `await` on a function call, verify that the function is `async` and returns a `Promise`. Redundant `await` keywords on non-Promise-returning functions can lead to linting errors and unnecessary complexity.

  - _Trigger Case_: Encountering `@typescript-eslint/await-thenable` or `sonarjs/no-invalid-await` errors.
  - _Example_: If `myFunction()` returns `void` or a non-Promise value, avoid `await myFunction();`. If `myAsyncFunction()` returns `Promise<T>`, then `await myAsyncFunction();` is appropriate.

- **Rule 1.36: Never Merge with Build Errors**: Do not merge to main or deploy if the build is failing. All build errors must be resolved before merging.

- **Rule 1.37: Adopt a 'Global View' for TypeScript Debugging**: To avoid the inefficient cycle of fixing one build error at a time, use `npx tsc --noEmit` to get a comprehensive list of all TypeScript errors across the project before starting to fix them. This provides a complete picture of the work required and prevents rework.

- **Rule 1.38: Handle Missing ESLint Plugins**: If ESLint fails with a `MODULE_NOT_FOUND` error, it indicates that a required plugin is missing. Run `npm install` to restore any missing packages.

  - _Trigger Case_: ESLint fails with a `MODULE_NOT_FOUND` error.
  - _Example_: If `eslint-plugin-unicorn` is missing, run `npm install` to restore it.

- **Rule 1.39: ESM Import Best Practices**: Always use explicit file extensions (`.js`) in relative imports and never import directly from directories. Use dynamic imports for modules that require environment variables to be loaded first.

  - _Trigger Case_: ESM import resolution errors (`ERR_UNSUPPORTED_DIR_IMPORT`, `ERR_MODULE_NOT_FOUND`).
  - _Example_: Instead of `import { APIUsageService } from '../supabase'`, use `import { APIUsageService } from '../supabase/services/apiUsageService.js'`.

- **Rule 1.40: Environment Variable Loading in ESM**: Load environment variables before importing modules that depend on them. Use dynamic imports (`await import()`) for modules requiring environment variables, and initialize them after dotenv configuration.

  - _Trigger Case_: Modules failing to initialize due to missing environment variables.
  - _Example_: 
    ```javascript
    import dotenv from 'dotenv';
    dotenv.config({ path: '.env.local' });
    const { processScrapingJob } = await import('../dist/lib/pipeline/scrapingProcessor.js');
    ```

- **Rule 1.41: Unicode Normalization for Data Validation**: When comparing text data for duplicates or matches, always normalize Unicode characters (especially apostrophes, quotes, and special characters) before comparison to prevent false negatives due to character encoding differences.

  - _Trigger Case_: Duplicate detection failing due to different Unicode representations of the same character.
  - _Example_: Normalize apostrophes: `name.replace(/[\u2018\u2019\u0060\u00B4]/g, "'")`

- **Rule 1.42: Intelligent Data Filtering and Quality Scoring**: Implement multi-tier filtering systems with quality scoring to prevent resource waste on poor-quality data sources. Use pre-filtering to reject obviously invalid data before expensive processing.

  - _Trigger Case_: Repeated processing of URLs that consistently fail or produce invalid data.
  - _Example_: URL quality scoring system that increases/decreases scores based on success/failure and automatically blacklists poor performers.

- **Rule 1.43: Proper Invalid Data Handling**: Instead of creating placeholder entries for invalid data, implement proper validation that discards invalid data with appropriate logging and job status updates.

  - _Trigger Case_: Pipeline creating "Unknown" or placeholder entries for invalid data.
  - _Example_: Check for null/empty required fields and discard with proper job status update rather than creating fallback entries.

- **Rule 1.44: Comprehensive Duplicate Prevention**: Implement advanced duplicate detection using normalization, fuzzy matching, and similarity scoring to catch duplicates that simple exact matching would miss.

  - _Trigger Case_: Duplicate entries with slight variations in spelling, capitalization, or punctuation.
  - _Example_: Combine case-insensitive matching, Unicode normalization, suffix removal, and Levenshtein distance for robust duplicate detection.

- **Rule 1.45: Safe Job Creation with Error Handling**: When creating jobs or database entries, ensure all required fields are properly set and implement comprehensive error handling with appropriate status updates.

  - _Trigger Case_: Job creation failing due to missing required fields or database errors.
  - _Example_: Always set required fields like `job_type` and handle database errors gracefully with proper logging and status updates.

- **Rule 1.46: Consistent Duplicate Prevention Logic**: Ensure that both real-time and batch duplicate detection systems use the same logic and thresholds to maintain consistency. Copy duplicate prevention algorithms directly into batch scripts when import dependencies are problematic.

  - _Trigger Case_: Batch deduplication scripts producing different results than real-time duplicate prevention.
  - _Example_: Copy `calculateSimilarity` and related functions directly into batch scripts to ensure identical duplicate detection logic.

- **Rule 1.47: Proper ESM/CJS Interop**: When mixing ESM and CommonJS modules, use appropriate import/export syntax for each context. CommonJS files should use `require()` and `module.exports`, while ESM files should use `import` and `export`.

  - _Trigger Case_: Mixing `import`/`export` syntax in CommonJS files or vice versa.
  - _Example_: Use `require('dotenv').config()` in `.cjs` files instead of `import('dotenv/config')`.

- **Rule 1.48: Robust Data Quality Validation**: Implement comprehensive validation at multiple pipeline stages to catch and handle invalid data before it pollutes the database. Use explicit checks rather than relying on fallback values.

  - _Trigger Case_: Invalid data creating placeholder entries or corrupting existing records.
  - _Example_: Check for required fields like `name` before processing and discard invalid data with proper logging rather than creating "Unknown" entries.

- **Rule 1.49: Regular Job Queue Maintenance**: Implement regular monitoring and cleanup of job queues to prevent resource waste from duplicate jobs. Create diagnostic and cleanup tools for ongoing pipeline health.

  - _Trigger Case_: Discovery of duplicate jobs causing resource waste and processing inefficiency.
  - _Example_: Create `check-duplicate-jobs.js` and `cleanup-duplicate-jobs.js` scripts to identify and remove duplicate pending jobs, keeping only the most recent job for each URL.

- **Rule 1.50: Database-Level Constraints for Data Integrity**: Implement database-level unique constraints to enforce data integrity and prevent duplicate entries at the source. This is more reliable than application-level duplicate prevention and eliminates race conditions.

  - _Trigger Case_: Duplicate entries being created despite application-level duplicate prevention logic.
  - _Example_: Add unique constraint on food truck names: `ALTER TABLE food_trucks ADD CONSTRAINT unique_food_truck_name UNIQUE (name);` and handle constraint violations in application code by updating existing entries instead of creating duplicates.

- **Rule 1.51: GitHub Actions Branch Management**: When making changes that affect GitHub Actions workflows, always push to the current feature branch and use `gh` CLI commands with `--ref` option to ensure you're testing the correct workflow version. Never assume local changes will automatically trigger the correct remote workflow without explicit branch specification.

  - _Trigger Case_: Making changes to GitHub Actions workflows or related scripts that need testing.
  - _Example_: After modifying `scripts/github-action-scraper.js`, push to current branch and run `gh workflow run scrape-food-trucks.yml --ref feature/your-branch-name` to test the specific branch version.

- **Rule 1.52: Pending Jobs Fetching Verification**: Always verify that pending jobs are being fetched correctly from Supabase before processing. Implement proper error handling and logging to detect mismatches between expected and actual job counts.

  - _Trigger Case_: GitHub Actions workflow showing unexpected job processing behavior or "no pending jobs" messages.
  - _Example_: Add logging to show job count before and after fetching, and verify job status filtering is working correctly: `console.log(`Found ${pendingJobs.length} pending jobs with status: ${status}`);`

- **Rule 1.53: ESM Module Resolution in GitHub Actions**: Ensure all ESM imports in GitHub Actions scripts use explicit `.js` file extensions and avoid directory imports. Test scripts locally with `node` command before running in GitHub Actions to catch import resolution issues early.

  - _Trigger Case_: `ERR_UNSUPPORTED_DIR_IMPORT` or `ERR_MODULE_NOT_FOUND` errors in GitHub Actions logs.
  - _Example_: Instead of `import { ScrapingJobService } from '../dist/lib/supabase/services'`, use `import { ScrapingJobService } from '../dist/lib/supabase/services/scrapingJobService.js'`

- **Rule 1.54: Environment Variable Validation in GitHub Actions**: Always validate that required environment variables are present and correctly loaded before initializing modules that depend on them. Use explicit error messages to identify missing configuration.

  - _Trigger Case_: GitHub Actions failing due to missing API keys or configuration values.
  - _Example_: Check for required vars before module initialization: `if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is required');`
