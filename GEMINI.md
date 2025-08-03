# Gemini Operational Guidelines

This file documents the rules, best practices, and key learnings I develop while working on this codebase. Adhering to these rules ensures consistency, quality, and alignment with project governance.

## AI Edit Safety

### Brief overview
Project-specific guidelines for preventing diff mismatches when using AI-assisted code modifications.

### Replacement strategies
- **Exact character matching**: Ensure `replace_in_file` operations use exact pattern matches including whitespace and line endings.
  - Example: When replacing `const x = 5;` with `const x = 6;`, the entire line must be matched to prevent accidental changes in multi-line statements.
- **SEARCH block verification**:Always read the file immediately before constructing `replace_in_file` operations to capture current code structure.
- **Version control integration**: Compare against current version prior to replacing to verify structural alignment

### Type enforcement
- **Explicit typing**: Declare all variable and function types when adding/refactoring code to avoid unintended type changes.
  - Example: Use `const data: MyType = await response.json();` instead of implicit typing.
- **Nullish explicit handling**: Handle `null`/`undefined` through conditional checks rather than implicit coercion.
  - Example: Replace `if (value)` with `if (value ?? false)` or `if (value !== undefined)`.

### Linting automation
- **Multi-pass auto-fixing**: Run `npx eslint . --fix` multiple times or target specific files for thorough correction.
  - Example: After `unicorn/no-useless-undefined` fixes, re-run on modified files to catch subsequent issues.

## Cline's Operational Rules & Learnings

### Rule Set: Linting Remediation

#### 1. Prioritization Protocol

- **Rule 1.1:** Always prioritize manual refactoring for `max-lines-per-function` and `sonarjs/cognitive-complexity` errors over any other linting rule. These require architectural judgment and are unsafe to automate.
- **Rule 1.2:** Address high-confidence automatable errors (e.g., `unused-import`, `no-null`) before tackling medium-confidence or manual errors to achieve the quickest reduction in error count.
- **Rule 1.3:** When addressing manual errors, use the output of `scripts/get-high-impact-files.cjs` to systematically target files with the highest error counts first.

#### 2. Automation Governance

- **Rule 2.1:** Do not automate fixes for `@typescript-eslint/strict-boolean-expressions`. The risk of introducing logical errors by misinterpreting developer intent with nullable values is too high. This was learned from the `revert-boolean-fixer-damage.cjs` script, which was created to undo previous failed automation attempts.
- **Rule 2.2:** Automation for type-safety rules (`no-explicit-any`, `no-unsafe-assignment`) must be treated as medium-confidence. While some patterns can be fixed, a full solution requires manual type annotation and contextual understanding.
- **Rule 2.3:** For error object stringification, use `JSON.stringify()` instead of `String()` when the error type is `unknown` or `any`. The `@typescript-eslint/no-base-to-string` rule prevents unsafe stringification of objects that could result in `[object Object]` output.

#### 3. Refactoring & Code Modification

- **Rule 3.1:** When a function exceeds the `max-lines-per-function` limit, apply the following refactoring patterns in order of preference:
  1.  **Component Extraction:** If the code is in a React component, extract JSX into smaller, focused sub-components.
  2.  **Custom Hook Extraction:** Encapsulate state management, data fetching, or complex business logic within custom hooks (`use...`).
  3.  **Service/Helper Function Extraction:** Decompose non-UI logic into separate service modules or utility functions with single responsibilities.
- **Rule 3.2:** When fixing `sonarjs/prefer-read-only-props`, carefully assess the mutability requirements of the object. Applying `readonly` incorrectly can cause cascading issues. Prioritize `readonly` for props objects and data models that are not intended to be mutated.

### Rule Set: General Operations

#### 1. Command & Script Execution

- **Rule 1.1:** Before running any fixing script, always get a baseline error count using `node scripts/count-errors.cjs`. After the script runs, get a new count to precisely measure the impact of the changes.
- **Rule 1.2:** Use the `scripts/analyze-error-patterns.cjs` script to get a detailed breakdown of error types. This is the source of truth for identifying automation candidates.

#### 2. Documentation & Reporting

- **Rule 2.1:** All significant actions, analyses, and status changes must be logged in `🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md`. This is the central coordination point.
- **Rule 2.2:** Any new, broadly applicable learning or operational standard must be codified and added to this `.clinerules` file.
- **Rule 2.3:** All complex tasks must be broken down into a detailed Work Breakdown Structure (WBS) following the guidelines in `.clinerules/wbs-task-breakdown.md`.

### Rule Set: Code Style

#### 1. Function Length

    - **Rule 1.1:** New functions cannot exceed 50 lines.
    - **Rule 1.2:** This rule is enforced by the `max-lines-per-function` linting rule.

## Supabase Operational Notes

### Brief overview
This section documents key operational learnings and best practices derived from recent interactions with Supabase, focusing on improving the reliability and efficiency of database migrations and administration.

### Development Workflow
- **Rule 1.1: Prioritize Manual SQL Execution:** When Supabase CLI (`db push`, `db pull`) or MCP tools consistently fail due to environmental issues (e.g., Docker dependency, authentication errors), the primary fallback is to generate a manual SQL script. This script should be executed directly in the Supabase dashboard's SQL Editor to ensure reliable schema changes.
- **Rule 1.2: Verify All Schema Changes with SQL Queries:** After applying any schema changes (manually or via tooling), always run `SELECT` queries against the appropriate `pg_` catalog tables (`pg_indexes`, `pg_policies`, etc.) to verify that the changes have been applied correctly. Do not assume success.
- **Rule 1.3: Incremental and Idempotent Migrations:** All migration scripts, whether manual or file-based, should be written to be idempotent (i.e., safe to run multiple times). Use `IF NOT EXISTS` for table/index/extension creation and `IF EXISTS` for dropping objects. This prevents errors when re-running scripts.
- **Rule 1.4: Resolve Migration History Mismatches Methodically:** If the Supabase CLI reports a migration history mismatch, follow this specific sequence:
  1.  Delete all local migration files in `supabase/migrations`.
  2.  Run `npx supabase migration repair` with the `--status reverted` flag for all migrations listed in the error message.
  3.  Run `npx supabase db pull` to generate a clean, consolidated schema file.
  4.  Re-create any new, pending migrations with fresh timestamps.
- **Rule 1.5: Refer to `.clinerules/supabase-best-practices.md`:** For a more detailed and comprehensive set of rules and best practices, refer to the `.clinerules/supabase-best-practices.md` file.

## Code Duplication Detection

### SocialMediaSection Deduplication
- 📌 Moved SocialMediaSection to components/ui/SocialMediaSection.tsx
- 📌 Removed duplicate implementation in components/trucks/SocialMediaSection.tsx

<-- 2025-07-03 - Analysis2 task complete (SocialMediaSection duplication resolved) -->

## Component Deduplication

### Brief overview
This rules set outlines the process for deduplicating UI components and normalizing their imports to comply with the project's architecture requirements, specifically targeting Card and Badge components. The guidelines ensure that we eliminate redundant components and standardize file locations to improve maintainability and readability.

### Development workflow
  - **Identify and prioritize duplicates**: Use scripts/find-duplicate-component-names.js to identify components that exist in multiple directories. Prioritize UI primitives ( Cards, Buttons, Badges ) first.
  - **Refactor imports and locations**: Move duplicate components to the shared directory (components/UI).
  - **Verify and commit**: Ensure that all references to these components are updated to point to the new location. Re-run scripts/find-duplicates for confirmation.
  - **Fallback procedure**: If a direct script operation isn't viable, manually consolidate components. Log these actions in `docs/DUPLICATION_REMEDIATION_GUIDE.md` for documentation and future reference.

### Validation strategy
  - **Cross-check imports**: Run a comprehensive check to ensure consistent import paths across modules.
  - **Codebase-wide analysis**: Utilize the `search-files` tool to verify the removal of duplication and standardization of imports. Use the search patterns:
    ```
    SEARCH: import Card from `.*/Card` 
    REPLACE: import {Card} from @/components/ui/card
    ```
    ```
    SEARCH: import Badge from `.*\Badge`
    REPLACE: import {Badge} from @/components/ui/badge
    ```
  - **Commit confirmation**: Once all duplicate entries are identified, replace and re-run scripts/find-duplicates to validate that no duplications exist.

### Code pattern examples
  - **Move Card**:
    - Move `components/trucks/TruckCard.tsx` to `components/ui/TruckCard.tsx`
    - Update imports in `components/admin/pipeline/*` to reference `@/components/ui/TruckCard`

  - **Move Badge**:
    - Move `components/status-indicator/Badge.tsx` to `@/components/ui/Badge.tsx`
    - Update imports in `components/analytics/DailyStats.tsx` to reference `@/components/ui/Badge`

## Component Props Validation Guidelines

### Purpose
This document outlines the standards and procedures for validating props passed into UI components, particularly focusing on ensuring type safety and preventing `undefined`-related errors during component rendering.

### Validation Strategy
- **Explicit Prop Types**: Always define component prop types using explicit `interface` or `type` definitions rather than TypeScript's implicit `any` type. This enforces required properties and prevents missing prop errors.

- **Mandatory Props**: When components require specific props to function properly (e.g., TruckCard needing `price` and `image_url`), explicitly type these props and add validation logic where appropriate.

- **Fallback Mechanisms**: Use default prop values or graceful fallback behaviors when optional props might be `undefined`. For example, use default images or placeholder pricing information.

### Implementation Steps
1. **Component Interface**:
   - Define strict interfaces for all components that render conditional content based on passed props.

   ```typescript
   interface TruckCardContentProps {
     readonly truckName: string;
     readonly cuisineType: string;
     readonly averageRating: number;
     readonly totalReviews: number;
     readonly pricing: string; // e.g., '$', '$$', '$$$'
     readonly imageUrl: string | undefined;
     // Additional properties...
   }

   interface OperatingHours {
     dayOfWeek: 'Monday' | 'Tuesday' | ... | 'Sunday';
     isOpenToday: boolean;
     startTime: string; // e.g., '10:00 AM'
     endTime: string; // e.g., '8:00 PM'
   }

   interface TruckHoursDisplayProps {
     dailyHours: OperatingHours[];
     currentDate: string | Date; // ISO date string or Date object
     displayType: 'list' | 'grid';
   }
   ```

2. **Type Checks**:
   - Perform explicit type checks before JSX rendering
   ```typescript
   const TruckCardContent: React.FC<TruckCardContentProps> = ({ truckName, cuisineType, ...props }) => {
     if (!truckName || !cuisineType) {
       // Handle missing props with a fallback or error display
       return <div>Invalid Truck Information</div>;
     }

     const displayImage = props.imageUrl ?? DEFAULT_TRUCK_IMAGE;
     // Render with valid props
     return (
       <div>
         <h2>{truckName}</h2>
         <p>{cuisineType}</p>
         {displayImage && <img src={displayImage} alt={`${truckName} truck`} />}
         // Additional content here...
       </div>
     );
   };
   ```

3. **Error Handling**:
   - Implement prop validation utilities to check for missing properties
   - Add checks at component entry points (e.g., constructor) to validate passed props.

### Logging & Monitoring
- Log all prop validation errors to `ErrorBoundary` for real-time UI feedback.

### Related Rules
- **Component Deduplication**: Refer to `./component-deduplication.md` when managing consolidated props between similar components.
- **Type Safety**: Complement with `./type-safety.md` guidelines for handling external data.

### Conclusion
Enforcing strict prop validation across UI components ensures architectural integrity and reduces runtime errors. Proper type checking and default fallback strategies are essential for maintaining a high-quality codebase.

## Development Conventions

### Brief overview
This document outlines project-specific development conventions and best practices for maintaining high-quality and consistent code throughout the 'food-truck-finder' project. These guidelines have emerged from the collaborative efforts to resolve linting errors, eliminate code duplication, and implement effective type safety enhancements.

### Communication style
- **Concise responses**: All interactions should be clear and to-the-point, focusing on actionable solutions with brief explanations to ensure efficient problem-solving cycles.
- **No speculative preferences**: Avoid adding rules based on assumptions. All included guidelines are directly derived from observed project development needs.

### Development workflow
- **Strict TypeScript setup**: Ensure `tsconfig.json` enforces `strict: true` with all related flags enabled.
- **Component separation**: Use dedicated hooks for business logic to maintain modular component design (`e.g., hooks/* use...`).
- **Automated code fixes**: Prioritize the usage of automated fix scripts (`scripts/fix-scripts`) during linting sessions for bulk error correction.

### Coding best practices
- **Explicit prop typing**: Always define component props using `type` or `interface` to improve type safety and readability.
- **Component naming**: Use `KebabCase` for CSS classes and styles. Follow `PascalCase` syntax for React components and hooks.
- **Avoid `any` types**: Replace generic `any` type declarations with explicit type definitions or use `Record<string, unknown>` when generics are required.

### Linting & formatting strategies
- **Batch linting**: Combine lint checks (`scripts/batch-lint.sh`) with automated formatters (`prettier`). Include linter errors threshold configurations.
- **Duplicate detection**: Regularly run duplication detection tools (`scripts/find-duplicate-component-names.js`) to maintain architectural alignment per duplication remediation guidelines.

### Architectural guidelines
- **Feature first architecture**: Isolate feature-specific UI components within dedicated directories (`components/feature-name/`).
- **Middleware patterns**: Wrap custom middleware layers around Supabase client operations using `@lib/supabaseMiddleware.ts`.

### UI/UX preferences
- **Semantic component structure**: Utilize semantic layout components (`Header`, `Main`, `Section`) to structure content according to accessibility standards.

### Comment verbosity
- **Purpose-driven comments**: Add brief inline comments for complex logic blocks that aren't self-explanatory, adhering to SOTA (State of the Art) documentation practices.

## Mermaid Syntax

### Brief overview

This rule set outlines guidelines for writing Mermaid diagrams to ensure they render correctly.

### Development workflow

- **Rule 1.1: Escape Special Characters in Mermaid Diagrams**: When creating Mermaid diagrams, ensure that any node text containing special characters (e.g., `(`, `)`, `[`, `]`, `{`, `}`) is enclosed in double quotes (`""`) to prevent parsing errors.
  - _Trigger Case_: When a Mermaid diagram fails to render due to a parsing error.
  - _Example_: Instead of `C[Frontend (Next.js)]`, use `C["Frontend (Next.js)"]`.

## Operational Learnings

### Brief overview

This rule set documents key operational learnings and best practices derived from recent interactions, focusing on improving efficiency and accuracy in code remediation and file system interactions. These are global rules applicable across tasks.

### Development workflow

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

## Leaflet Map Rendering

### Brief overview
This rule set outlines guidelines for ensuring `react-leaflet` maps render correctly within a Next.js application, preventing common issues like the "Map container is already initialized" error and visibility problems.

### Development workflow
- **Rule 1.1: Dependency Alignment**: Ensure that the versions of `next`, `react`, `react-dom`, and their corresponding `@types` packages are compatible. Mismatches, especially between major versions (e.g., Next.js 15 with React 18), can cause subtle and difficult-to-diagnose type resolution errors.
  - _Trigger Case_: When encountering unexpected TypeScript errors related to core React hooks (`useState`, `useEffect`) or JSX types.
  - _Example_: If `next` is at version 14, ensure `react` and `react-dom` are at version 18. If `next` is at version 15, ensure `react` and `react-dom` are at version 19.

- **Rule 1.2: Use `leaflet-defaulticon-compatibility`**: To prevent issues with Leaflet's default marker icons not appearing, install and import the `leaflet-defaulticon-compatibility` package. This is a more robust solution than manual workarounds.
  - _Trigger Case_: When marker icons are not visible on the map.
  - _Example_:
    ```typescript
    import 'leaflet/dist/leaflet.css';
    import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
    import 'leaflet-defaulticon-compatibility';
    ```

- **Rule 1.3: Set Explicit Height on Map Container**: The `MapContainer` component from `react-leaflet` must have an explicit height set via its `style` prop. Percentage-based heights (e.g., `height: '100%'`) will not work unless the parent container has a defined height.
  - _Trigger Case_: The map does not appear on the page, and inspecting the DOM reveals that the `.leaflet-container` element has a height of `0px`.
  - _Example_:
    ```typescript
    <MapContainer
      style={{ height: '400px', width: '100%' }}
      ...
    />
    ```

- **Rule 1.4: Use `isMounted` State for Client-Side Rendering**: To prevent issues with React's Strict Mode and server-side rendering, use a state variable to ensure the `MapContainer` is only rendered on the client side after the component has mounted.
  - _Trigger Case_: The map fails to initialize correctly, or the "Map container is already initialized" error appears.
  - _Example_:
    ```typescript
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
    }, []);

    if (!isMounted) {
      return <p>Loading map...</p>;
    }

    return <MapContainer ... />;
    ```

## Type Safety

### Brief overview

This rule set outlines guidelines for maintaining type safety in TypeScript files, particularly during refactoring and when dealing with external data.

### Development workflow

- **Rule 1.1: Explicit Type Annotations**: Always provide explicit type annotations for variables, function parameters, and return types, especially when dealing with data from external sources (APIs, databases) or when refactoring existing code. This helps prevent `no-unsafe-assignment`, `no-explicit-any`, and `no-unsafe-member-access` errors.

  - _Trigger Case_: When consuming data from `fetch` responses, database queries, or when `any` types are inferred.
  - _Example_: Instead of `const data = await response.json();`, use `const data: MyType = await response.json();`. For dynamic data from `request.json()` in Next.js API routes, type as `unknown` and use type guards: `const body: unknown = await request.json(); if (typeof body === 'object' && body !== null && 'action' in body) { const action = (body as { action: string }).action; /* ... */ }`.

- **Rule 1.2: Handle Nullish Values Explicitly**: Avoid implicit boolean coercion of nullable values. Always use explicit comparisons (`=== null`, `!== undefined`, `??`) or type conversions (`Boolean(value)`) to handle `null` or `undefined`. This addresses `strict-boolean-expressions` and `unicorn/no-null` errors.

  - _Trigger Case_: In `if` statements, ternary operations, or logical expressions involving potentially nullish values.
  - _Example_: Instead of `if (value)`, use `if (value !== undefined)` or `if (value ?? false)`.

- **Rule 1.3: Address Unbound Methods**: When referencing class methods, ensure they are bound to the class instance to avoid `unbound-method` errors. Use arrow functions for class methods or explicitly bind them in the constructor.
  - _Trigger Case_: When passing class methods as callbacks (e.g., event handlers, `useEffect` dependencies).
  - _Example_: Change `myMethod() { ... }` to `myMethod = () => { ... }` or `this.myMethod = this.myMethod.bind(this);` in the constructor.
