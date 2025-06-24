# LINTING AND CODE QUALITY GUIDE

This comprehensive guide consolidates all linting, code quality, and related governance documentation for the Food Truck Finder project. It aims to provide a single source of truth for maintaining high code standards, preventing errors, and ensuring efficient multi-agent development.

## 1. Executive Summary & Current Status

The project has systematically addressed significant linting and complexity issues, reducing the overall error count. The focus is now on maintaining these improvements and preventing regressions through robust quality gates.

### Current Error Overview (as of 2025-06-23)

Based on the latest `lint-results.json`:

-   **Total Problems**: 270 problems (242 errors, 28 warnings)
-   **Key High-Frequency Errors**:
    -   `@typescript-eslint/strict-boolean-expressions`: 14 occurrences
    -   `max-lines-per-function`: 14 occurrences
    -   `sonarjs/prefer-read-only-props`: 14 occurrences
    -   `unicorn/no-null`: 9 occurrences
    -   `@typescript-eslint/no-unused-vars` / `sonarjs/unused-import`: 16 occurrences
    -   Type safety issues (`no-unsafe-assignment`, `no-explicit-any`, `no-unsafe-member-access`, `no-unsafe-argument`): 21 occurrences
    -   Complexity issues (`sonarjs/cognitive-complexity`, `max-params`, `max-depth`): 12 occurrences
    -   Filename casing (`unicorn/filename-case`): 4 occurrences

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
