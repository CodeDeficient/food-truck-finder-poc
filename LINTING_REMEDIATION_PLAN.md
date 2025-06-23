# Linter Error Remediation Plan

This document outlines the plan for systematically addressing the remaining linter errors in the project, categorized by type and prioritized for efficient resolution.

## Current Error Overview

Based on the latest `lint-results.json` (as of 2025-06-23):

*   `@typescript-eslint/no-unused-vars`: 9 occurrences (Warnings)
*   `sonarjs/unused-import`: 7 occurrences (Errors)
*   `sonarjs/prefer-read-only-props`: 14 occurrences (Errors)
*   `max-lines-per-function`: 14 occurrences (Errors)
*   `@typescript-eslint/strict-boolean-expressions`: 14 occurrences (Errors)
*   `unicorn/filename-case`: 4 occurrences (Errors)
*   `@typescript-eslint/no-unsafe-assignment`: 6 occurrences (Errors)
*   `@typescript-eslint/no-explicit-any`: 5 occurrences (Errors)
*   `sonarjs/different-types-comparison`: 6 occurrences (Errors)
*   `@typescript-eslint/await-thenable`: 1 occurrence (Error)
*   `sonarjs/no-invalid-await`: 1 occurrence (Error)
*   `@typescript-eslint/no-misused-promises`: 2 occurrences (Errors)
*   `unicorn/no-null`: 9 occurrences (Errors)
*   `@typescript-eslint/no-unsafe-member-access`: 6 occurrences (Errors)
*   `@typescript-eslint/no-unsafe-argument`: 4 occurrences (Errors)
*   `max-params`: 4 occurrences (Errors)
*   `sonarjs/no-redundant-jump`: 1 occurrence (Error)
*   `sonarjs/no-all-duplicated-branches`: 1 occurrence (Error)
*   `@typescript-eslint/no-unnecessary-type-assertion`: 1 occurrence (Error)
*   `@typescript-eslint/require-await`: 4 occurrences (Errors)
*   `unicorn/prefer-default-parameters`: 1 occurrence (Error)
*   `sonarjs/no-dead-store`: 3 occurrences (Errors)
*   `@typescript-eslint/no-redundant-type-constituents`: 1 occurrence (Error)
*   `sonarjs/pseudo-random`: 1 occurrence (Error)
*   `@typescript-eslint/unbound-method`: 4 occurrences (Errors)
*   `max-depth`: 3 occurrences (Errors)
*   `sonarjs/cognitive-complexity`: 5 occurrences (Errors)
*   `unicorn/no-empty-file`: 2 occurrences (Errors)
*   `sonarjs/slow-regex`: 1 occurrence (Error)

## Remediation Phases

### Phase 1: Quick Wins & High Frequency (Automated/Semi-Automated)

These errors are generally straightforward to fix and can significantly reduce the overall error count quickly.

*   **`sonarjs/prefer-read-only-props` (14 occurrences)**
    *   **Action**: Add `readonly` modifier to properties within component props interfaces.
    *   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 3.2)
*   **`unicorn/no-null` (9 occurrences)**
    *   **Action**: Replace `null` with `undefined` where appropriate.
    *   **Rule Reference**: `.clinerules/type-safety.md` (Rule 1.2)
*   **`@typescript-eslint/no-unused-vars` (9 occurrences - Warnings) & `sonarjs/unused-import` (7 occurrences - Errors)**
    *   **Action**: Remove unused import statements and variable declarations.
*   **`sonarjs/no-dead-store` (3 occurrences)**
    *   **Action**: Remove useless assignments to variables that are not subsequently used.
*   **`sonarjs/different-types-comparison` (6 occurrences)**
    *   **Action**: Correct comparisons that are always true or false due to type mismatches or redundant checks.
*   **`@typescript-eslint/require-await` (4 occurrences)**
    *   **Action**: Remove the `async` keyword from functions that do not contain any `await` expressions.
*   **`unicorn/prefer-default-parameters` (1 occurrence)**
    *   **Action**: Refactor function parameters to use default values instead of reassignment within the function body.
*   **`@typescript-eslint/no-unnecessary-type-assertion` (1 occurrence)**
    *   **Action**: Remove type assertions that do not change the type of the expression.
*   **`sonarjs/no-redundant-jump` (1 occurrence)**
    *   **Action**: Remove redundant `return` or `break` statements.
*   **`sonarjs/no-all-duplicated-branches` (1 occurrence)**
    *   **Action**: Refactor conditional logic where both branches return the same value.

### Phase 2: Structural Refactoring (Manual/Architectural)

These errors often indicate deeper structural issues and require careful manual refactoring.

*   **`max-lines-per-function` (14 occurrences)**
    *   **Action**: Prioritize files with the highest number of violations. Refactor large functions by extracting logical blocks into smaller, more focused helper functions or components.
    *   **Refactoring Patterns**: Component Extraction, Custom Hook Extraction, Service/Helper Function Extraction.
    *   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 1.1, Rule 3.1)
*   **`sonarjs/cognitive-complexity` (5 occurrences)**
    *   **Action**: Address functions with high cognitive complexity by simplifying logic, reducing nesting, and breaking down complex operations. This often overlaps with `max-lines-per-function` fixes.
    *   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 1.1)
*   **`max-params` (4 occurrences)**
    *   **Action**: Reduce the number of function parameters by grouping related parameters into objects or by extracting logic that requires many parameters into a separate function.
*   **`max-depth` (3 occurrences)**
    *   **Action**: Reduce the nesting level of code blocks by extracting nested logic into separate functions or by restructuring control flow.

### Phase 3: Type Safety & Advanced Patterns (Manual/Careful Review)

These errors are critical for maintaining type safety and code robustness, requiring detailed manual review.

*   **`@typescript-eslint/strict-boolean-expressions` (14 occurrences)**
    *   **Action**: Explicitly handle `null` or `undefined` values in conditional statements using `=== null`, `!== undefined`, `??`, or `Boolean()`.
    *   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 2.1), `.clinerules/type-safety.md` (Rule 1.2)
*   **`@typescript-eslint/no-unsafe-assignment` (6 occurrences)**, **`@typescript-eslint/no-explicit-any` (5 occurrences)**, **`@typescript-eslint/no-unsafe-member-access` (6 occurrences)**, **`@typescript-eslint/no-unsafe-argument` (4 occurrences)**
    *   **Action**: Systematically add explicit type annotations, refine existing types, and ensure safe access to properties. Avoid `any` where possible.
    *   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 2.2), `.clinerules/type-safety.md` (Rule 1.1)
*   **`@typescript-eslint/unbound-method` (4 occurrences)**
    *   **Action**: Ensure class methods passed as callbacks are correctly bound to the class instance (e.g., using arrow functions for class methods or binding in the constructor).
    *   **Rule Reference**: `.clinerules/type-safety.md` (Rule 1.3)
*   **`@typescript-eslint/no-misused-promises` (2 occurrences)**
    *   **Action**: Ensure Promises are correctly `await`ed or explicitly marked as `void` if their return value is intentionally ignored.
*   **`@typescript-eslint/no-redundant-type-constituents` (1 occurrence)**
    *   **Action**: Simplify union types where one type (e.g., `any` or `unknown`) makes other types redundant.

### Phase 4: Minor & Specific Issues

These are less frequent or more specific issues that can be addressed after the higher-priority items.

*   **`unicorn/filename-case` (4 occurrences)**
    *   **Action**: Rename files to adhere to camelCase or PascalCase conventions.
*   **`unicorn/no-empty-file` (2 occurrences)**
    *   **Action**: Remove or populate empty files.
*   **`sonarjs/pseudo-random` (1 occurrence)**
    *   **Action**: Review usage of `Math.random()` to ensure it's used only for non-cryptographic purposes. If used for security-sensitive operations, replace with a cryptographically secure random number generator.
*   **`sonarjs/slow-regex` (1 occurrence)**
    *   **Action**: Review and optimize the identified regular expression pattern to prevent super-linear runtime due to backtracking.

## Research Task

After fixing a significant portion of the manual errors, a dedicated research task will be initiated:

*   **Objective**: Research tools or methods for automatic linter error resolution, especially for groups of errors that are repetitive and safe to automate.
*   **Tools**: Utilize Tavily and Context7 to explore existing solutions, best practices, and potential custom automation scripts.
