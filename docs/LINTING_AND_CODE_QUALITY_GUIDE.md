# LINTING AND CODE QUALITY GUIDE

<!--
TODO (Future Improvement):
Centralize and standardize error handling in all service methods (e.g., lib/supabase.ts, lib/gemini.ts) so that:
- All user-facing errors return a generic message (e.g., "That didn't work, please try again later.")
- All technical error details are logged to the console for developer diagnostics
- Consider a shared error utility or error result type for consistency
This will further reduce the risk of leaking technical details and improve maintainability.
-->

This comprehensive guide consolidates all linting, code quality, and related governance documentation for the Food Truck Finder project. It aims to provide a single source of truth for maintaining high code standards, preventing errors, and ensuring efficient multi-agent development.

## 1. Current Status & Remediation Plan (as of 2025-06-27)

Based on the latest analysis, we have **169 remaining errors** across **54 files**. This section provides a full breakdown and a clear path forward.

### Error Categorization & Certainty

| Category | Error Count | Certainty | Difficulty | Key Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Easiest & Certain** | ~34 | 100% | Low | `sonarjs/unused-import`, `sonarjs/different-types-comparison` |
| **Hardest & Uncertain** | ~54 | Low | High | `strict-boolean-expressions`, `max-lines-per-function` |
| **Moderate** | ~81 | Medium | Medium | `no-unsafe-*`, `max-params` |

### High-Priority Hardest Errors (Manual Refactoring Required)

These require careful, manual intervention as per our established rules.

1.  **`@typescript-eslint/strict-boolean-expressions` (33 errors):**
    *   **Challenge:** Our most frequent and riskiest error. Automation is forbidden (Rule 2.1) due to the high risk of creating logic bugs.
    *   **Action:** Meticulously review each of the 33 instances, applying explicit checks for `null` and `undefined` based on the specific code context.
2.  **`max-lines-per-function` (21 errors):**
    *   **Challenge:** Requires architectural changes, not simple fixes.
    *   **Action:** Apply refactoring patterns (Component/Hook/Service extraction) as defined in Rule 3.1. We will use `scripts/get-high-impact-files.cjs` to prioritize the most problematic files.
3.  **The `no-unsafe-*` family (24+ errors):**
    *   **Challenge:** These type-safety errors (`-assignment`, `-return`, `-argument`, `-call`) require careful analysis to determine the correct types without introducing new issues.
    *   **Action:** Manually add explicit type annotations and guards.

### Easiest Errors (High-Confidence Fixes)

These are low-hanging fruit that we can address quickly to reduce the error count.

1.  **`sonarjs/different-types-comparison` (16 errors):**
    *   **Certainty:** 100%.
    *   **Action:** Correct simple logical errors where variables of different types are compared.
2.  **`sonarjs/unused-import` (8 errors):**
    *   **Certainty:** 100%.
    *   **Action:** Safely remove these via ESLint's autofix capabilities.
3.  **`sonarjs/no-identical-expressions` (5 errors):**
    *   **Certainty:** 100%.
    *   **Action:** Fix copy-paste errors in logical expressions.
4.  **`unicorn/switch-case-braces` (5 errors):**
    *   **Certainty:** 100%.
    *   **Action:** Apply simple, stylistic fixes.

### Proposed Action Plan

1.  **Immediate Action:** Tackle the "Easiest Errors" to quickly reduce the count from 169 to ~135.
2.  **Systematic Refactoring:** Begin the methodical, manual process of fixing the "Hardest Errors," starting with `max-lines-per-function` in the highest-impact files.
3.  **Ongoing Cleanup:** Address the "Moderate" errors concurrently.

This structured approach ensures we make measurable progress while safely handling the most complex issues.

---

### Phase 1 Completion - Systematic Complexity Refactoring Success

Significant progress has been made in reducing function complexity and line counts in critical components:

| Component | Original Lines | Final Lines | Reduction | Percentage |
| :--------------------------- | :------------- | :---------- | :-------- | :--------- |
| **DataCleanupDashboard.tsx** | 314 | 48 | 266 | **84.7%** |
| **lib/gemini.ts** | 675 | 237 | 438 | **64.9%** |
| **app/trucks/[id]/page.tsx** | 327 | 46 | 281 | **85.9%** |
| **app/admin/monitoring/page.tsx** | 177 | ~60 | 117 | **66%** |
| **app/admin/test-pipeline/page.tsx** | 254 | 66 | 188 | **74%** |
| **app/api/admin/scraping-metrics/route.ts** | 81 | 25 | 56 | **69.1%** |
| **app/admin/food-trucks/[id]/page.tsx** | 553 | 49 | 504 | **91.1%** |
| **app/admin/users/page.tsx** | 62 | 31 | 31 | **50%** |
| **components/admin/RealtimeStatusIndicator.tsx** | 250 | 60 | 190 | **76%** |
| **lib/pipelineProcessor.ts** | 200 | 60 | 140 | **70%** |
| **app/page.tsx** | 280 | 70 | 210 | **75%** |
| **components/TruckCard.tsx** | 250 | 70 | 180 | **72%** |
| **TOTAL PHASE 1** | **3,660** | **852** | **2,808** | **76.7%** |

## 2. Remediation Plan & Fix Strategies

This section outlines the systematic approach to addressing remaining linter errors.

### Remediation Workflow

This diagram visualizes the systematic workflow for analyzing, researching, and remediating linting errors across the codebase.

```mermaid
graph TD
    subgraph Phase 1: Analysis
        A[Get Fresh Lint Data] --> B[Analyze Error Patterns];
        A --> C[Identify High-Impact Files];
        B & C --> D[Update LINTING_AND_CODE_QUALITY_GUIDE.md];
    end

    subgraph Phase 2: Research
        E[Tavily: SOTA Research]
        F[Context7: Rule-Specific Docs]
    end

    subgraph Phase 3: Automation
        G["Run eslint --fix"]
        H["Run Safe Custom Scripts"]
    end

    subgraph Phase 4: Manual Fixes
        I{Work through Prioritized List};
        J[Pick Top File];
        K[Apply Manual Refactoring];
        L[Verify Fixes];
        M[Next File];
        I --> J --> K --> L --> M;
        M --> J;
    end

    D --> E;
    D --> F;
    F --> G;
    F --> H;
    G & H --> I;
```

### Phase 1: Quick Wins & High Frequency (Automated/Semi-Automated)

These errors are generally straightforward to fix and can significantly reduce the overall error count quickly.

-   **`sonarjs/prefer-read-only-props`**: Add `readonly` modifier to properties within component props interfaces.
-   **`unicorn/no-null`**: Replace `null` with `undefined` where appropriate.
-   **`@typescript-eslint/no-unused-vars` & `sonarjs/unused-import`**: Remove unused import statements and variable declarations. For intentionally unused parameters, prefix with `_`.
-   **`sonarjs/no-dead-store`**: Remove useless assignments to variables that are not subsequently used.
-   **`sonarjs/different-types-comparison`**: Correct comparisons that are always true or false due to type mismatches or redundant checks.
-   **`@typescript-eslint/require-await`**: Remove the `async` keyword from functions that do not contain any `await` expressions.
-   **`unicorn/prefer-default-parameters`**: Refactor function parameters to use default values instead of reassignment within the function body.
-   **`@typescript-eslint/no-unnecessary-type-assertion`**: Remove type assertions that do not change the type of the expression.
-   **`sonarjs/no-redundant-jump`**: Remove redundant `return` or `break` statements.
-   **`sonarjs/no-all-duplicated-branches`**: Refactor conditional logic where both branches return the same value.

### Phase 2: Structural Refactoring (Manual/Architectural)

These errors often indicate deeper structural issues and require careful manual refactoring.

-   **`max-lines-per-function`**: Prioritize files with the highest number of violations. Refactor large functions by extracting logical blocks into smaller, more focused helper functions or components.
    -   **Refactoring Patterns**: Component Extraction, Custom Hook Extraction, Service/Helper Function Extraction.
    -   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 1.1, Rule 3.1)
-   **`sonarjs/cognitive-complexity`**: Address functions with high cognitive complexity by simplifying logic, reducing nesting, and breaking down complex operations. This often overlaps with `max-lines-per-function` fixes.
    -   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 1.1)
-   **`max-params`**: Reduce the number of function parameters by grouping related parameters into objects or by extracting logic that requires many parameters into a separate function.
-   **`max-depth`**: Reduce the nesting level of code blocks by extracting nested logic into separate functions or by restructuring control flow.

### Phase 3: Type Safety & Advanced Patterns (Manual/Careful Review)

These errors are critical for maintaining type safety and code robustness, requiring detailed manual review.

-   **`@typescript-eslint/strict-boolean-expressions`**: Explicitly handle `null` or `undefined` values in conditional statements using `=== null`, `!== undefined`, `??`, or `Boolean()`.
    -   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 2.1), `.clinerules/type-safety.md` (Rule 1.2)
-   **`@typescript-eslint/no-unsafe-assignment`**, **`@typescript-eslint/no-explicit-any`**, **`@typescript-eslint/no-unsafe-member-access`**, **`@typescript-eslint/no-unsafe-argument`**: Systematically add explicit type annotations, refine existing types, and ensure safe access to properties. Avoid `any` where possible.
    -   **Rule Reference**: `.clinerules/clinerules-overview.md` (Rule 2.2), `.clinerules/type-safety.md` (Rule 1.1)
-   **`@typescript-eslint/unbound-method`**: Ensure class methods passed as callbacks are correctly bound to the class instance (e.g., using arrow functions for class methods or binding in the constructor).
    -   **Rule Reference**: `.clinerules/type-safety.md` (Rule 1.3)
-   **`@typescript-eslint/no-misused-promises`**: Ensure Promises are correctly `await`ed or explicitly marked as `void` if their return value is intentionally ignored.
-   **`@typescript-eslint/no-redundant-type-constituents`**: Simplify union types where one type (e.g., `any` or `unknown`) makes other types redundant.
-   **Handling Supabase `any[]` Return Types**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.
    -   **New Rule Reference**: `.clinerules/operational-learnings.md` (Rule 1.25)

### Phase 4: Minor & Specific Issues

These are less frequent or more specific issues that can be addressed after the higher-priority items.

-   **`unicorn/filename-case`**: Rename files to adhere to `camelCase` or `PascalCase` conventions.
-   **`unicorn/no-empty-file`**: Remove or populate empty files.
-   **`sonarjs/pseudo-random`**: Review usage of `Math.random()` to ensure it's used only for non-cryptographic purposes.
-   **`sonarjs/slow-regex`**: Review and optimize the identified regular expression pattern to prevent super-linear runtime due to backtracking.

## 3. Proven Safe Automation Patterns & Lessons Learned

### Tiered Automation Safety

-   **Tier 1 (100% Safe)**: ESLint Auto-fix, Unused Import/Variable Removal, `@ts-expect-error` Comment Removal.
-   **Tier 2 (90%+ Success)**: Strict Boolean Expressions (`!value` → `value == null`), Unsafe Assignment Fixes (`as Type`), Nullish Coalescing (`||` → `??`).
-   **Tier 3 (80%+ Success)**: Type Safety Improvements (adding interfaces), Event Handler Modernization, Promise Handling (void wrapper).
-   **Tier 4 (Manual Only)**: Function Extraction, Complex Logic Changes, Cognitive Complexity Reduction. **Never automate these.**

### Key Learnings

-   **Prioritize Fresh Linting Data**: Always ensure `lint-results.json` is up-to-date.
-   **Precision in `replace_in_file`**: `SEARCH` blocks must be exact matches.
-   **Verify File System Paths**: Prevent `ENOENT` errors.
-   **Maintain Type Safety During Refactoring**: Ensure changes don't introduce new type errors.
-   **Adhere to `max-lines-per-function`**: Extract components if files become too long.
-   **Handle `strict-boolean-expressions` Explicitly**: Explicitly check for `null` and `undefined`.
-   **Simplify `unicorn/no-useless-undefined`**: Use `if (!handle)` instead of `if (handle === undefined || handle.length === 0)`.
-   **Be Aware of Stale Linter Errors**: Verify errors against current code.
-   **Use `.tsx` for Files with JSX**: Ensure correct file extensions.
-   **Supabase Type Mismatches**: Be aware that `overrideTypes` may not fully resolve type errors for complex nested structures from Supabase queries (e.g., `any[]` for `string[]`). Temporary relaxation to `any[]` in interfaces may be necessary, followed by explicit data transformation.

## 4. Comprehensive Linting Prevention Framework

This framework prevents systematic linting errors through automated quality gates, real-time validation, and multi-agent coordination protocols.

### Automated Quality Gates

1.  **Pre-commit Hooks (`.husky/pre-commit`)**:
    ```bash
    # Stage 1: Type Safety Check (CRITICAL)
    npx tsc --noEmit --strict || exit 1

    # Stage 2: Linting with Error Threshold
    npx eslint . --max-warnings 0 --report-unused-disable-directives || exit 1

    # Stage 3: Complexity Analysis
    npx eslint . --rule 'sonarjs/cognitive-complexity: [error, 15]' || exit 1

    # Stage 4: Type Coverage Check
    npx type-coverage --at-least 95 || exit 1
    ```

2.  **Lint-Staged Configuration (`.lintstagedrc.json` or `package.json`)**:
    ```json
    {
      "lint-staged": {
        "*.{ts,tsx}": [
          "eslint --fix --max-warnings 0",
          "prettier --write",
          "bash -c 'npx tsc --noEmit --strict'",
          "git add"
        ],
        "*.{js,jsx}": [
          "eslint --fix --max-warnings 0",
          "prettier --write",
          "git add"
        ]
      }
    }
    ```

3.  **CI/CD Quality Gates (`.github/workflows/quality-gates.yml`)**:
    -   Ensures type safety, linting error thresholds, cognitive complexity, and type coverage are enforced on every push/pull request.

### Real-time Prevention System (VS Code & ESLint Configuration)

-   **VS Code Settings**:
    ```json
    {
      "eslint.validate": [
        "javascript", "javascriptreact", "typescript", "typescriptreact"
      ],
      "eslint.run": "onType",
      "eslint.autoFixOnSave": true,
      "typescript.preferences.strictNullChecks": true,
      "typescript.preferences.noImplicitAny": true,
      "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true,
        "source.organizeImports": true
      },
      "eslint.rules.customizations": [
        { "rule": "@typescript-eslint/no-unsafe-*", "severity": "error" },
        { "rule": "sonarjs/cognitive-complexity", "severity": "error" },
        { "rule": "unicorn/no-null", "severity": "error" }
      ]
    }
    ```
-   **Enhanced ESLint Configuration (`eslint.config.mjs`)**:
    -   **Type Safety Prevention**: Enforces `no-unsafe-*` rules, `no-explicit-any`, `strict-boolean-expressions`.
    -   **Complexity Prevention**: Enforces `sonarjs/cognitive-complexity`, `no-nested-conditional`, `max-lines-per-function`, `max-depth`.
    -   **Consistency Prevention**: Enforces `unicorn/no-null`, `prefer-nullish-coalescing`, `prefer-optional-chain`.

### ESLint Flat Config Migration

The project now uses the modern ESLint Flat Config format (`eslint.config.mjs`). The legacy `.eslintrc.json` is deprecated and has been removed. Only `eslint.config.mjs` should be edited for lint rules.

## 5. Codebase Governance & Agent Coordination

Effective multi-agent development requires clear governance and coordination protocols to prevent duplication and inconsistencies.

### Critical Anti-Duplication Rules

-   **Database Services**: ONLY use services from `lib/supabase.ts`. NEVER create duplicate Supabase clients or inline database operations.
-   **Pipeline Systems**: ONLY use unified pipeline via `/api/enhanced-pipeline`. NEVER create new pipeline implementations or duplicate processing logic.
-   **API Routes**: ALWAYS check existing routes before creating new ones. NEVER create overlapping endpoints or duplicate functionality.

### Agent Coordination Protocols

-   **Mandatory Protocols for All Agents (Before Any Code Changes)**:
    1.  Run `npm run lint` and verify 0 errors.
    2.  Run `npx tsc --noEmit --strict` for type safety.
    3.  Check cognitive complexity: `npx eslint . --rule 'sonarjs/cognitive-complexity: [error, 15]'`.
    4.  Verify type coverage: `npx type-coverage --at-least 95`.
-   **During Development**: Extract functions immediately when complexity >15, use proper TypeScript types (never `any`), follow null/undefined consistency rules, update type definitions, and coordinate on shared files.
-   **After Changes**: Run full lint suite, verify no new errors, update documentation, and commit with descriptive messages including error count reduction.

### Agent Responsibility Matrix

| Error Type | Primary Agent | Secondary Agent | Prevention Protocol |
| :--------- | :------------ | :-------------- | :------------------ |
| Type Safety | TypeScript Agent | Code Review Agent | Must run `tsc --strict` before changes |
| Complexity | Refactoring Agent | Architecture Agent | Must extract functions >15 complexity |
| Consistency | Style Agent | Quality Agent | Must follow style guide patterns |
| Configuration | DevOps Agent | Lead Agent | Must validate config changes |

### File-Based Ownership

| File Category | Ownership | Coordination |
| :----------------------- | :----------- | :----------- |
| `lib/supabase.ts` | Single Agent | Required |
| `lib/pipelineManager.ts` | Single Agent | Required |
| `app/api/pipeline/` | Single Agent | Required |
| `app/middleware.ts` | Single Agent | Required |
| `components/` | Multi-Agent | Recommended |
| `app/admin/` | Multi-Agent | Recommended |
| `tests/` | Multi-Agent | Optional |
| `docs/` | Multi-Agent | Optional |

## 6. Success Metrics & Continuous Improvement

### Immediate Targets (1-2 weeks)

-   Reduce total errors from **270 to <200**.
-   Eliminate all critical type safety issues.
-   Fix all high complexity violations.

### Long-term Goals (1 month)

-   Achieve **<50 total linting issues**.
-   Implement prevention framework to avoid regression.
-   Establish code quality gates in CI/CD.

### Quality Indicators

-   **0** `any` types in production code.
-   **0** functions exceeding 50 lines.
-   **0** unsafe type operations.
-   **100%** TypeScript strict mode compliance.

### Continuous Improvement

-   **Weekly Quality Reviews**: Analyze error trends, adjust thresholds, update rules.
-   **Monthly Framework Updates**: Review ESLint config, evaluate new tools, update protocols.
-   **Feedback Mechanisms**: Regular agent input, issue tracking, pattern evolution, rule refinement.

---

**Last Updated**: June 23, 2025
**Estimated Resolution Effort**: Ongoing
**Business Risk Level**: MEDIUM - Type safety issues pose runtime stability risks.

---

## 7. Automation of Simple Lint Fixes (Comparison and Null Checks)

### Automated Fixes for Comparison and Null Checks

For recurring issues such as:
- `sonarjs/different-types-comparison` (e.g., always-true/false `===`/`!==` checks between different types)
- `unicorn/no-null` (use of `null` instead of `undefined`)

**Do not fix these manually in individual files.**

Instead, use the provided scripts (see `scripts/automated-nullish-coalescing-converter.cjs` and similar) to batch-fix these patterns across the codebase. This ensures consistency and saves time.

**Remediation Pattern:**
- Run the automated scripts to convert all `===`/`!==` null/undefined checks to `==`/`!=` where appropriate.
- Replace all `null` with `undefined` for codebase-wide consistency.
- Only address these manually if the script cannot safely handle a specific case.

**Documented June 24, 2025.**

## 10. WBS Checklist for Top 5 Linter Errors (as of 2025-06-28)

This Work Breakdown Structure (WBS) provides a detailed plan for researching, remediating, and verifying fixes for the top 5 most frequent linting errors in the codebase. This plan has been cross-verified with external documentation and best practices to ensure its robustness.

#### **WBS Item 1: `sonarjs/different-types-comparison` (11 Errors)**

*   **[ ] 1.1 Research & Analysis (Completed)**
    *   **Description:** This rule flags comparisons (`===` or `!==`) between variables of different types, which almost always indicates a logical error. For example, comparing a `number` to a `string`.
    *   **Goal:** Identify and correct the flawed logic in all 11 instances.
    *   **Verification:** Research with Tavily confirmed that the best practice is to correct the underlying logic, not to use type coercion or suppression. This validates our primary solution.

*   **[ ] 1.2 Solution Options**
    *   **Option A (Recommended): Correct the Underlying Logic.** Investigate why the types are different and fix the root cause. This is the most robust solution as it addresses the source of the logical flaw.
        *   *Pro:* Improves code correctness and reliability.
        *   *Con:* May require slightly more investigation than a surface-level fix.
    *   **Option B: Use Explicit Type Coercion.** Manually convert one of the types to match the other (e.g., `String(myNumber) === myString`).
        *   *Pro:* Quick fix if the type mismatch is intentional.
        *   *Con:* Can hide deeper data model issues and is generally considered a code smell.
    *   **Option C: Suppress the Rule.** Use an `eslint-disable-next-line` comment.
        *   *Pro:* Immediately removes the error.
        *   *Con:* Should only be used for confirmed false positives, which is extremely rare for this rule. It masks a potential bug.

*   **[ ] 1.3 Verification Plan**
    *   **Step 1:** Apply the recommended fix (Option A) to one of the identified errors.
    *   **Step 2:** Run a targeted lint check on the modified file (`npx eslint <file-path>`) to confirm the error is gone.
    *   **Step 3:** Manually review the code change to ensure the new logic is correct and makes sense in the context of the application.
    *   **Step 4:** Once verified, apply the same pattern to the remaining 10 errors.

---

#### **WBS Item 2: `@typescript-eslint/no-unsafe-assignment` (10 Errors)**

*   **[ ] 2.1 Research & Analysis (Completed)**
    *   **Description:** This critical type-safety rule prevents a value of type `any` from being assigned to a variable with a more specific type, as this would bypass TypeScript's safety checks.
    *   **Goal:** Properly type the data at the point of assignment to ensure end-to-end type safety.
    *   **Verification:** Research confirmed that the best practice is to use explicit type annotations. The plan is updated to include a step to read the relevant type definition files before applying a fix.

*   **[ ] 2.2 Solution Options**
    *   **Option A (Highly Recommended): Add Explicit Type Annotations.** Define a specific `interface` or `type` for the data and apply it to the variable. This is the gold standard for TypeScript development.
        *   *Pro:* Provides full type safety, enables autocompletion, and makes the code self-documenting.
        *   *Con:* Requires defining the type structure if it doesn't already exist.
    *   **Option B: Use Type Guards.** If the data structure is dynamic, use conditional checks (e.g., `typeof`, `instanceof`, `in`) to prove the type to the compiler before assignment.
        *   *Pro:* Provides runtime safety for unknown data structures.
        *   *Con:* Can be more verbose than a simple type annotation.
    *   **Option C: Use an `as` Type Assertion.** Force the type using `const myVar = someValue as MyType;`.
        *   *Pro:* A quick way to resolve the error.
        *   *Con:* Bypasses type checking and can lead to runtime errors if the assertion is wrong. Use sparingly.

*   **[ ] 2.3 Verification Plan**
    *   **Step 1:** Apply Option A to one instance, defining a new `interface` in `lib/types.ts` if necessary.
    *   **Step 2:** Run `npx tsc --noEmit` to ensure the new type is correct and doesn't introduce any new compilation errors. The original lint error should be resolved.
    *   **Step 3:** Once the pattern is verified, apply it to the remaining errors.

---

#### **WBS Item 3: `sonarjs/unused-import` (8 Errors)**

*   **[ ] 3.1 Research & Analysis (Completed)**
    *   **Description:** An imported module is not used within the file, adding unnecessary code and increasing bundle size.
    *   **Goal:** Clean up all unused imports.
    *   **Verification:** Research confirmed that using `eslint --fix` is the standard and reliable approach for this rule.

*   **[ ] 3.2 Solution Options**
    *   **Option A (Recommended): Use ESLint Autofix.** Run `npx eslint . --fix`. This command is highly reliable and designed to fix this type of error automatically.
        *   *Pro:* Fastest and most efficient solution.
        *   *Con:* None for this rule.

*   **[ ] 3.3 Verification Plan**
    *   **Step 1:** Run `npx eslint . --fix`.
    *   **Step 2:** Run `npx eslint .` again to confirm that all `unused-import` errors have been resolved.
    *   **Step 3:** Run `npm run build` (or similar) to ensure the removal of imports did not break the application build.

---

#### **WBS Item 4: `@typescript-eslint/no-unsafe-return` (7 Errors)**

*   **[ ] 4.1 Research & Analysis (Completed)**
    *   **Description:** A function returns a value of type `any` and does not have an explicit return type annotation, breaking type-safety for any code that calls it.
    *   **Goal:** Ensure all functions have a clearly defined and type-safe return contract.
    *   **Verification:** Research confirmed that adding an explicit return type is the correct and necessary solution.

*   **[ ] 4.2 Solution Options**
    *   **Option A (Highly Recommended): Add Explicit Function Return Type.** Add the correct return type to the function signature (e.g., `function myFunc(): MyReturnType { ... }`).
        *   *Pro:* Enforces the function's contract, improves API clarity, and enables type-checking on the calling side.
        *   *Con:* None; this is a fundamental best practice.
    *   **Option B: Refine the Returned Value's Type.** Instead of returning `any`, process the value inside the function to ensure it has a specific type before being returned.
        *   *Pro:* Good for encapsulation if the type refinement logic belongs inside the function.
        *   *Con:* Can be overkill if a simple return type annotation suffices.

*   **[ ] 4.3 Verification Plan**
    *   **Step 1:** Apply Option A to one of the functions, adding an explicit return type.
    *   **Step 2:** Run `npx tsc --noEmit` to verify that the return type is correct and that no new type errors are introduced in the files that consume the function.
    *   **Step 3:** Repeat for the remaining functions.

---

#### **WBS Item 5: `max-params` (7 Errors)**

*   **[ ] 5.1 Research & Analysis (Completed)**
    *   **Description:** A function has too many parameters, which is a sign of poor design. This makes the function hard to read, use, and test.
    *   **Goal:** Refactor the function to have a cleaner, more manageable signature.
    *   **Verification:** Research confirmed that the best practice is to group related parameters into a single "options" object.

*   **[ ] 5.2 Solution Options**
    *   **Option A (Highly Recommended): Introduce a Parameter Object.** Group related parameters into a single "options" object. This is a very common and clean refactoring pattern.
        *   *Pro:* Makes the function signature stable (adding new optional params is not a breaking change) and improves readability.
        *   *Con:* Requires updating all the places where the function is called.
    *   **Option B: Decompose the Function.** The high number of parameters might indicate the function is doing too much. Break it into smaller, more focused functions.
        *   *Pro:* Improves code by adhering to the Single Responsibility Principle.
        *   *Con:* A more involved refactoring effort.
    *   **Option C: Increase the Rule Limit.** Change the `max-params` value in `eslint.config.mjs`.
        *   *Pro:* Easiest way to remove the error.
        *   *Con:* Does not fix the underlying code quality issue; it only hides it. Not recommended.

*   **[ ] 5.3 Verification Plan**
    *   **Step 1:** Apply Option A to one of the functions. Create a new `type` or `interface` for the parameter object.
    *   **Step 2:** Update all call sites for that function to use the new object-based parameter.
    *   **Step 3:** Run the application and related tests to ensure the refactored function still works as expected. The lint error will be gone.
    *   **Step 4:** Repeat for the other 6 instances.

---

## 8. Known Linter False Positives and Temporary Suppressions

### `sonarjs/deprecation` for `React.MutableRefObject`

- **Context**: The linter currently flags `React.MutableRefObject` as deprecated (rule: `sonarjs/deprecation`).
- **Reality**: This is a known false positive. `MutableRefObject` is still the correct and standard type for refs created by `useRef` in React 18+ and is not deprecated in the React or TypeScript type definitions.
- **Action**: Do not attempt to manually replace or suppress these warnings in individual files. We will address all such deprecation errors in a single batch update or linter config change in the future.
- **Reference**: See [DefinitelyTyped Issue #66808](https://github.com/DefinitelyTyped/DefinitelyTyped/issues/66808) for details.

### `sonarjs/no-invariant-returns` for `executePipeline`

- **Context**: The linter flags `executePipeline` in `lib/api/test-integration/pipelineRunner.ts` with `sonarjs/no-invariant-returns`.
- **Reality**: This function intentionally has multiple return paths (early exits for errors and a final success return). The rule is likely misinterpreting this as an invariant return due to the complex return types.
- **Action**: This is considered a false positive and standard ESLint disable comments do not seem to suppress it. We will leave this as is and not attempt further manual suppression.

### `@typescript-eslint/no-misused-promises` (in `setInterval`/`setTimeout` callbacks)

- **Context**: This rule flags Promises returned in contexts expecting `void`, even when `async` anonymous functions are used with `await` inside `setInterval`/`setTimeout` callbacks.
- **Reality**: This is often a false positive due to the linter's strict interpretation of `void` contexts, despite the code being functionally correct and safe.
- **Action**: Targeted inline or block-level suppression is recommended if further code modification introduces undue complexity or is semantically equivalent to a suppressed pattern.

### `sonarjs/different-types-comparison` (in `hooks/useSystemAlerts.ts`)

- **Context**: In `hooks/useSystemAlerts.ts`, the expression `(event.severity ?? 'info') !== 'info'` is flagged by `sonarjs/different-types-comparison`.
- **Reality**: This is a false positive. The expression `(event.severity ?? 'info')` evaluates to a string, and comparing two strings with `!==` is a valid and type-safe operation. The linter incorrectly suggests using `!=` which would change the strict equality check.
- **Action**: This specific instance of the rule should be suppressed with an `// eslint-disable-next-line sonarjs/different-types-comparison` comment directly above the line. Repeated attempts to satisfy the linter without suppression have proven unproductive.

---

## 9. Advanced Remediation Strategies

### The "Isolate and Conquer" Protocol for Complex Files

When a file proves resistant to broad refactoring attempts (i.e., the error count remains stagnant or increases), a more granular, methodical approach is required. This protocol, "Isolate and Conquer," ensures steady, verifiable progress on even the most complex files.

**Core Principles:**

1.  **One Error Type at a Time:** Do not attempt to fix multiple types of linting errors simultaneously in a complex file.
2.  **Immediate Verification:** After each targeted fix, run a lint check *only on the file you are editing*. This provides immediate feedback and prevents the introduction of new, unforeseen errors.
3.  **Prioritize High-Confidence Fixes:** Begin with the errors that are easiest to fix and have the lowest risk of introducing side effects (e.g., `sonarjs/different-types-comparison`, unused variables).
4.  **Defer Complex Refactoring:** Save architectural changes (e.g., `max-lines-per-function`, `cognitive-complexity`) for last, after the file has been stabilized and the "easy" errors have been cleared.

**Workflow:**

1.  **Identify the Target File:** e.g., `lib/data-quality/batchCleanup.ts`
2.  **Identify the First Error Type to Fix:** e.g., `sonarjs/different-types-comparison`
3.  **Apply the Fix:** Use `replace_in_file` to fix *only* the `different-types-comparison` errors.
4.  **Verify the Fix:** Run `npx eslint lib/data-quality/batchCleanup.ts`.
5.  **Assess the Result:**
    *   If the target error is gone and no new errors have appeared, proceed to the next error type.
    *   If new errors have appeared, revert the change and re-evaluate the fix.
6.  **Repeat:** Continue this process for each error type until the file is clean.
