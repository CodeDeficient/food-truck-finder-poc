# Linting Fix Plan Checklist

## ⚠️ Status Update (as of 6/23/2025)

- **Current Error Count (as of 6/23/2025): 333 problems (299 errors, 34 warnings)**
- **New high-frequency errors and stricter rules detected:**
  - `@typescript-eslint/strict-boolean-expressions` (handle all nullable/any checks in conditionals explicitly)
  - `max-lines-per-function`, `max-params` (reduce function size and parameter count)
  - `sonarjs/prefer-read-only-props` (mark all React props as readonly)
  - `@typescript-eslint/no-unused-vars`, `sonarjs/unused-import` (remove unused code)
  - `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-unsafe-member-access`, `@typescript-eslint/no-explicit-any` (type safety)
  - `unicorn/no-null`, `unicorn/no-useless-undefined` (prefer `undefined`)
  - `unicorn/filename-case` (file naming conventions)
  - `@typescript-eslint/require-await` (async functions without await)
  - `sonarjs/slow-regex` (regex performance)
  - `sonarjs/different-types-comparison` (correctly compare different types)
  - `@typescript-eslint/no-misused-promises` (handle promises in event handlers)
  - `unicorn/prefer-global-this` (prefer `globalThis.window`)
  - `sonarjs/void-use` (remove unnecessary `void` operator)
  - `@typescript-eslint/no-empty-object-type` (use `object` or `unknown` for empty interfaces)
  - `unicorn/switch-case-braces` (add braces to switch case clauses)
  - `@typescript-eslint/unbound-method` (bind `this` or use arrow functions for class methods)
  - `sonarjs/no-nested-template-literals` (refactor nested template literals)
  - `max-depth` (reduce nesting depth)
  - `sonarjs/no-redundant-optional` (remove redundant `undefined` or `?` specifiers)
- **Most problematic files (by error count/severity):**
  - `lib/ScraperEngine.ts`
  - `lib/api/test-integration/helpers.ts`
  - `components/admin/RealtimeStatusIndicator.tsx`
  - `components/ui/chart.tsx`
  - `components/monitoring/ApiMonitoringDashboard.tsx`
  - `lib/data-quality/batchCleanup.ts`
  - Many `components/admin/` and `components/trucks/` files (props, conditionals, function size)
  - Several `lib/api/` handler files (type safety, function size, naming)

---

## Revised Next Steps (Post-Lint Run)

1.  **Prioritize and fix by error category and file:**
    *   **`@typescript-eslint/strict-boolean-expressions`**:
        *   **How to fix**: Ensure all conditional checks (`if`, `? :`, `&&`, `||`) explicitly handle `null`, `undefined`, `0`, `''` (empty string), `NaN`, or `any` values.
        *   **Examples**:
            *   Instead of `if (value)`, use `if (value !== null && value !== undefined)` or `if (value != null)`.
            *   For strings, `if (value && value.length > 0)` or `if (typeof value === 'string' && value.length > 0)`.
            *   For numbers, `if (typeof value === 'number' && !isNaN(value) && value !== 0)`.
            *   For `any` values, cast to `unknown` first and then narrow the type using `typeof` or `instanceof`.
    *   **`max-lines-per-function`, `max-params`**:
        *   **How to fix**:
            *   **Component Extraction**: For React components, extract logical blocks of JSX and their related state/logic into smaller, focused sub-components. Pass necessary data as props.
            *   **Custom Hook Extraction**: Encapsulate reusable stateful logic (e.g., data fetching, form handling, complex calculations) into custom hooks (`use...`).
            *   **Service/Helper Function Extraction**: Decompose pure functions or non-UI business logic into separate utility modules or helper functions with single responsibilities.
            *   **Reduce Parameters**: Group related parameters into a single object or interface.
    *   **`sonarjs/prefer-read-only-props`**:
        *   **How to fix**: Mark all React component props interfaces as `readonly`.
        *   **Example**: `interface MyProps { readonly prop1: string; readonly prop2: number; }` or `({ prop1, prop2 }: Readonly<MyProps>)`.
    *   **`@typescript-eslint/no-unused-vars`, `sonarjs/unused-import`**:
        *   **How to fix**: Remove unused `import` statements and variable declarations. For intentionally unused parameters (e.g., in callbacks where an argument is required but not used), prefix the variable name with an underscore (`_`).
        *   **Example**: `const _unusedVar = 1;` or `function myFunc(_event: Event) { /* ... */ }`.
    *   **`@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-unsafe-member-access`, `@typescript-eslint/no-explicit-any`**:
        *   **How to fix**: Avoid `any` type. Provide explicit type annotations for variables, function parameters, and return types. Use type guards (`typeof`, `instanceof`, custom type predicates) to safely narrow `unknown` types before accessing properties.
        *   **Example**: Instead of `const data: any = ...`, use `const data: MyType = ...`. Instead of `value.prop`, use `if (isMyType(value)) { value.prop }`.
    *   **`unicorn/no-null`, `unicorn/no-useless-undefined`**:
        *   **How to fix**: Prefer `undefined` over `null` for representing the absence of a value. Simplify conditional checks for `undefined`.
        *   **Example**: Instead of `useState(null)`, use `useState<Type | undefined>()`. Instead of `if (value === undefined || value.length === 0)`, use `if (!value)`.
    *   **`unicorn/filename-case`**:
        *   **How to fix**: Rename files to `camelCase` (e.g., `myHelper.ts`) or `PascalCase` (e.g., `MyComponent.tsx`) as appropriate for their content (e.g., components usually PascalCase, utilities camelCase).
    *   **`@typescript-eslint/require-await`**:
        *   **How to fix**: If an `async` function does not use `await`, either add an `await` expression (if it performs an asynchronous operation) or remove the `async` keyword if it's purely synchronous.
    *   **`sonarjs/slow-regex`**:
        *   **How to fix**: Optimize regular expression patterns to prevent super-linear runtime due to backtracking, which can lead to ReDoS (Regular Expression Denial of Service) vulnerabilities. Consult regex optimization resources.
    *   **`sonarjs/different-types-comparison`**:
        *   **How to fix**: Ensure comparisons are type-safe. For checking both `null` and `undefined`, use `value == null` (loose equality) or `value === null || value === undefined` (strict equality). Avoid `!==` when `!=` is intended for nullish checks.
    *   **`@typescript-eslint/no-misused-promises`**:
        *   **How to fix**: When an `async` function is used as an event handler or callback that expects a `void` return, explicitly mark the promise as ignored using the `void` operator.
        *   **Example**: `onClick={() => { void handleSubmit(); }}`.
    *   **`unicorn/prefer-global-this`**:
        *   **How to fix**: Use `globalThis.window` instead of `window` for better cross-environment compatibility.
    *   **`sonarjs/void-use`**:
        *   **How to fix**: Remove the `void` operator if the promise is already being handled (e.g., awaited, or `.then().catch()` is chained). Only use `void` when explicitly ignoring a promise's return value.
    *   **`@typescript-eslint/no-empty-object-type`**:
        *   **How to fix**: Replace empty interface declarations (`interface MyType {}`) with `object` (for any non-nullish object) or `unknown` (for any value) to be more explicit about the intended type. If an empty interface is truly intended to allow any non-nullish value, consider disabling the rule with an inline comment.
    *   **`unicorn/switch-case-braces`**:
        *   **How to fix**: Add curly braces `{}` around the content of each `case` clause in `switch` statements.
    *   **`@typescript-eslint/unbound-method`**:
        *   **How to fix**: When passing class methods as callbacks, ensure `this` context is preserved. Use arrow functions for class methods (`myMethod = () => { ... }`) or bind them in the constructor (`this.myMethod = this.myMethod.bind(this);`).
    *   **`sonarjs/no-nested-template-literals`**:
        *   **How to fix**: Refactor template literals to avoid nesting them. Break down complex string constructions into simpler parts or use string concatenation if necessary.
    *   **`max-depth`**:
        *   **How to fix**: Reduce the nesting level of code blocks (e.g., `if` statements, `for` loops, `try-catch` blocks). This often involves extracting logic into separate functions or using early returns.
    *   **`sonarjs/no-redundant-optional`**:
        *   **How to fix**: Remove redundant `undefined` type annotations or `?` (optional property) specifiers when one already implies the other (e.g., `string | undefined` and `string?` are often equivalent, choose one).
2.  **Work file-by-file, starting with the highest-error files:**
    *   Begin with `lib/ScraperEngine.ts`, `lib/api/test-integration/helpers.ts`, `components/admin/RealtimeStatusIndicator.tsx`, `components/ui/chart.tsx`, etc.
    *   For each file: fix all errors, re-run linter, and update this checklist.
3.  **Iteratively re-run the linter and update the checklist.**
4.  **Continue until all errors and warnings are resolved.**

---

# Progress Log (as of 6/23/2025)

- Linter run revealed 333 problems (299 errors, 34 warnings).
- New top error categories: strict boolean expressions, function size, readonly props, unused code, type safety, file naming, and null/undefined handling.
- Next: Begin remediation in the highest-error files and update this plan after each batch of fixes.

### Detailed Error List:

**app\api\cron\quality-check\route.ts**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**app\api\monitoring\api-usage\route.ts**
- Error: Async function 'POST' has too many lines (53). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**app\login\page.tsx**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**app\page.tsx**
- Error: Promise-returning function provided to attribute where a void return was expected. (Rule: @typescript-eslint/no-misused-promises)

**components\WebVitalsReporter.tsx**
- Error: Prefer `globalThis.window` over `window` (Rule: unicorn/prefer-global-this)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\RealtimeStatusIndicator.tsx**
- Error: Function 'RealtimeStatusIndicator' has too many lines (80). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\admin\UserMenu.tsx**
- Warning: 'UserMetadata' is defined but never used (Rule: @typescript-eslint/no-unused-vars)

**components\admin\cleanup\CleanupPreview.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\food-trucks\detail\ContactField.tsx**
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\admin\food-trucks\detail\ContactInfoCard.tsx**
- Error: Prefer using an optional chain expression instead, as it's more concise and easier to read. (Rule: @typescript-eslint/prefer-optional-chain)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Prefer using an optional chain expression instead, as it's more concise and easier to read. (Rule: @typescript-eslint/prefer-optional-chain)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**components\admin\food-trucks\detail\OperatingHoursCard.tsx**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**components\admin\food-trucks\detail\QualityMetricsGrid.tsx**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**components\admin\food-trucks\detail\SocialMediaLinks.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\realtime\AlertListDisplay.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\admin\realtime\AlertToggleButton.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\realtime\ConnectionStatusHeader.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\admin\realtime\EventControls.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\admin\realtime\ScrapingJobsStatus.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\realtime\StatusHelpers.tsx**
- Error: Do not use useless `undefined` (Rule: unicorn/no-useless-undefined)

**components\admin\realtime\SystemAlertItem.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\admin\realtime\SystemAlerts.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\admin\realtime\SystemMetricsGrid.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\admin\realtime\status-helpers.ts**
- Error: Parsing error: '>' expected. (Rule: null)

**components\admin\realtime\status-helpers.tsx**
- Error: Parsing error: "parserOptions.project" has been provided for @typescript-eslint/parser. The file was not found in any of the provided project(s): components\admin\realtime\status-helpers.tsx (Rule: null)

**components\admin\realtime\useSystemMetrics.tsx**
- Error: Function 'useSystemMetrics' has too many lines (58). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\home\AppHeader.tsx**
- Error: Remove this use of the "void" operator (Rule: sonarjs/void-use)

**components\home\MapSection.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\map\UserLocationMarker.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\map\map-helpers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `mapHelpers.ts` or `MapHelpers.ts` (Rule: unicorn/filename-case)

**components\monitoring\ApiMonitoringDashboard.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\monitoring\FeatureCard.tsx**
- Warning: 'LucideIcon' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'LucideIcon' (Rule: sonarjs/unused-import)

**components\monitoring\FeatureList.tsx**
- Warning: 'LucideIcon' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'LucideIcon' (Rule: sonarjs/unused-import)

**components\monitoring\FeatureOverviewContent.tsx**
- Error: An empty interface declaration allows any non-nullish value, including literals like `0` and `""`. (Rule: @typescript-eslint/no-empty-object-type)

**components\monitoring\MonitoringFeaturesContent.tsx**
- Warning: 'Card' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'Card' (Rule: sonarjs/unused-import)
- Warning: 'CardContent' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'CardContent' (Rule: sonarjs/unused-import)
- Warning: 'CardDescription' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'CardDescription' (Rule: sonarjs/unused-import)
- Warning: 'CardHeader' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'CardHeader' (Rule: sonarjs/unused-import)
- Warning: 'CardTitle' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'CardTitle' (Rule: sonarjs/unused-import)
- Error: An empty interface declaration allows any non-nullish value, including literals like `0` and `""`. (Rule: @typescript-eslint/no-empty-object-type)

**components\test-pipeline\ErrorDisplay.tsx**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\test-pipeline\StageResultCard.tsx**
- Error: Function 'StageResultCard' has too many lines (83). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\test-pipeline\TestPipelineForm.tsx**
- Error: Function 'TestPipelineForm' has too many lines (73). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\trucks\OperatingHoursSection.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\trucks\RatingSection.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\trucks\SocialMediaSection.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\ui\carousel.tsx**
- Error: Arrow function has too many lines (91). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\ui\chart.tsx**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Arrow function has too many lines (101). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: This assertion is unnecessary since it does not change the type of the expression. (Rule: @typescript-eslint/no-unnecessary-type-assertion)
- Error: Unexpected nullable boolean value in conditional. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)
- Error: Unexpected negated condition. (Rule: unicorn/no-negated-condition)
- Error: Function has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Arrow function has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\ui\chart\TooltipIndicator.tsx**
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**components\ui\chart\TooltipItemContent.tsx**
- Error: Function has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Mark the props of the component as read-only (Rule: sonarjs/prefer-read-only-props)

**components\ui\chart\useTooltipLabel.tsx**
- Error: Do not use useless `undefined` (Rule: unicorn/no-useless-undefined)
- Error: Do not use useless `undefined` (Rule: unicorn/no-useless-undefined)

**components\ui\dataQualityCharts.tsx**
- Error: Remove this redundant jump. (Rule: sonarjs/no-redundant-jump)
- Error: Arrow function has too many lines (60). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\ui\sidebar.tsx**
- Error: Arrow function has too many lines (96). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Arrow function has too many lines (92). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\ui\simpleQualityPanel.tsx**
- Error: Arrow function has too many lines (93). Maximum allowed is 50. (Rule: max-lines-per-function)

**hooks\UseToast.ts**
- Error: Arrow function has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)

**hooks\realtime\createEventSourceConnection.ts**
- Error: 'RealtimeMetrics' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'RealtimeMetrics'. (Rule: sonarjs/unused-import)
- Error: 'parseEventData' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'parseEventData'. (Rule: sonarjs/unused-import)
- Error: 'setupEventListeners' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'setupEventListeners'. (Rule: sonarjs/unused-import)
- Error: Function 'createEventSourceConnection' has too many lines (60). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'setIsConnected' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused 'setIsConnected' variable. (Rule: sonarjs/no-unused-vars)
- Error: Remove this useless assignment to variable "setIsConnected". (Rule: sonarjs/no-dead-store)
- Error: 'setConnectionAttempts' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused 'setConnectionAttempts' variable. (Rule: sonarjs/no-unused-vars)
- Error: Remove this useless assignment to variable "setConnectionAttempts". (Rule: sonarjs/no-dead-store)

**hooks\realtime\setupEventSourceListeners.ts**
- Error: 'RealtimeMetrics' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'RealtimeMetrics'. (Rule: sonarjs/unused-import)
- Error: Function 'setupEventSourceListeners' has too many lines (51). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Function 'setupEventSourceListeners' has too many parameters (9). Maximum allowed is 4. (Rule: max-params)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: Unsafe assignment of an error typed value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe argument of type error typed assigned to a parameter of type `RealtimeEvent`. (Rule: @typescript-eslint/no-unsafe-argument)

**hooks\realtime\useConnectionManagement.ts**
- Error: 'useRef' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'useRef'. (Rule: sonarjs/unused-import)
- Error: 'RealtimeMetrics' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'RealtimeMetrics'. (Rule: sonarjs/unused-import)
- Error: Function 'useConnectionManagement' has too many lines (52). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Function 'useConnectionManagement' has too many parameters (9). Maximum allowed is 4. (Rule: max-params)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)
- Error: 'MutableRefObject' is deprecated. (Rule: sonarjs/deprecation)

**hooks\realtime\useEventHandlers.ts**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)

**hooks\realtime\useRealtimeAdminEventsLogic.ts**
- Error: Function 'useRealtimeAdminEventsLogic' has too many lines (83). Maximum allowed is 50. (Rule: max-lines-per-function)

**hooks\useAuthHandlers.ts**
- Error: Function 'useAuthHandlers' has too many lines (87). Maximum allowed is 50. (Rule: max-lines-per-function)

**hooks\useDataCleanup.ts**
- Error: Function 'useDataCleanup' has too many lines (72). Maximum allowed is 50. (Rule: max-lines-per-function)

**hooks\useRealtimeAdminEventsHelpers.ts**
- Error: 'AdminEvent' is an 'error' type that acts as 'any' and overrides all other types in this union type. (Rule: @typescript-eslint/no-redundant-type-constituents)
- Error: Unsafe assignment of an error typed value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)

**hooks\useSystemAlerts.ts**
- Error: Unexpected nullable boolean value in array predicate return type. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\ScraperEngine.ts**
- Error: Prefer using an optional chain expression instead, as it's more concise and easier to read. (Rule: @typescript-eslint/prefer-optional-chain)
- Error: Compare with `undefined` directly instead of using `typeof`. (Rule: unicorn/no-typeof-undefined)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Compare with `undefined` directly instead of using `typeof`. (Rule: unicorn/no-typeof-undefined)
- Error: Make sure that using this pseudorandom number generator is safe here. (Rule: sonarjs/pseudo-random)
- Error: Prefer using an optional chain expression instead, as it's more concise and easier to read. (Rule: @typescript-eslint/prefer-optional-chain)
- Error: Compare with `undefined` directly instead of using `typeof`. (Rule: unicorn/no-typeof-undefined)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Compare with `undefined` directly instead of using `typeof`. (Rule: unicorn/no-typeof-undefined)
- Error: Make sure that using this pseudorandom number generator is safe here. (Rule: sonarjs/pseudo-random)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Consider removing 'undefined' type or '?' specifier, one of them is redundant. (Rule: sonarjs/no-redundant-optional)
- Error: Consider removing 'undefined' type or '?' specifier, one of them is redundant. (Rule: sonarjs/no-redundant-optional)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\api\admin\data-cleanup\handlers.ts**
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Async function 'handleGetStatus' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Async function 'handleGetDefault' has no 'await' expression. (Rule: @typescript-eslint/require-await)

**lib\api\admin\data-quality\handlers.ts**
- Error: 'QualityThresholds' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: 'QualityAssessment' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: 'QualityCategory' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: 'limit' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused 'limit' variable. (Rule: sonarjs/no-unused-vars)
- Error: Remove this useless assignment to variable "limit". (Rule: sonarjs/no-dead-store)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe argument of type `any` assigned to a parameter of type `string`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unsafe argument of type `any` assigned to a parameter of type `number | undefined`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Async function 'handleBatchUpdate' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Prefer default parameters over reassignment. (Rule: unicorn/prefer-default-parameters)
- Error: 'truckData' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused 'truckData' variable. (Rule: sonarjs/no-unused-vars)
- Error: Remove this useless assignment to variable "truckData". (Rule: sonarjs/no-dead-store)

**lib\api\admin\oauth-status\helpers.ts**
- Error: Async function 'handlePostRequest' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Refactor this code to not use nested template literals. (Rule: sonarjs/no-nested-template-literals)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe call of a(n) `any` typed value. (Rule: @typescript-eslint/no-unsafe-call)
- Error: Unsafe call of a(n) `any` typed value. (Rule: @typescript-eslint/no-unsafe-call)
- Error: Unsafe call of a(n) `any` typed value. (Rule: @typescript-eslint/no-unsafe-call)
- Error: Unsafe member access .from on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .select on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .limit on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe member access .message on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe call of a(n) `any` typed value. (Rule: @typescript-eslint/no-unsafe-call)
- Error: Unsafe member access .auth on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe member access .message on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)

**lib\api\admin\realtime-events\handlers.ts**
- Error: 'NextResponse' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextResponse'. (Rule: sonarjs/unused-import)
- Error: Async function 'handleGetRequest' has too many lines (76). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Async function 'handleGetRequest' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Method 'start' has too many lines (62). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Promise returned in function argument where a void return was expected. (Rule: @typescript-eslint/no-misused-promises)
- Error: Unsafe argument of type `ReadableStreamDefaultController<any>` assigned to a parameter of type `ReadableStreamDefaultController<Uint8Array<ArrayBufferLike>>`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Make sure that using this pseudorandom number generator is safe here. (Rule: sonarjs/pseudo-random)

**lib\api\admin\scraping-metrics\handlers.ts**
- Error: 'NextRequest' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextRequest'. (Rule: sonarjs/unused-import)
- Error: Async function 'getScrapingMetrics' has too many lines (67). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: 'metrics' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused 'metrics' variable. (Rule: sonarjs/no-unused-vars)
- Error: Remove this useless assignment to variable "metrics". (Rule: sonarjs/no-dead-store)

**lib\api\analytics\web-vitals\handlers.ts**
- Error: Async function 'handlePostRequest' has too many lines (52). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unsafe argument of type `any[]` assigned to a parameter of type `{ metric_name: string; metric_value: number; rating: string; }[]`. (Rule: @typescript-eslint/no-unsafe-argument)

**lib\api\cron\auto-scrape\handlers.ts**
- Error: Use `undefined` instead of `null` (Rule: unicorn/no-null)

**lib\api\firecrawl\handlers.ts**
- Error: Async function 'handleSearchOperation' has no 'await' expression. (Rule: @typescript-eslint/require-await)

**lib\api\scheduler\handlers.ts**
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**lib\api\test-integration\helpers.ts**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)

**lib\api\test-integration\pipeline-runner.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `pipelineRunner.ts` or `PipelineRunner.ts` (Rule: unicorn/filename-case)
- Error: 'NextResponse' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextResponse'. (Rule: sonarjs/unused-import)
- Error: 'StageResult' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'StageResult'. (Rule: sonarjs/unused-import)
- Error: Async function 'runTestPipeline' has too many lines (60). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\api\test-integration\schema-mapper.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `schemaMapper.ts` or `SchemaMapper.ts` (Rule: unicorn/filename-case)
- Error: Function 'mapExtractedDataToTruckSchema' has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\api\test-integration\stage-handlers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `stageHandlers.ts` or `StageHandlers.ts` (Rule: unicorn/filename-case)
- Error: Async function 'handleFirecrawlStage' has too many lines (58). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\api\trucks\handlers.ts**
- Error: 'FoodTruck' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'FoodTruck'. (Rule: sonarjs/unused-import)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe argument of type `any` assigned to a parameter of type `Partial<FoodTruck>`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe argument of type `any` assigned to a parameter of type `Partial<FoodTruck>`. (Rule: @typescript-eslint/no-unsafe-argument)

**lib\auth\auth-helpers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `authHelpers.ts` or `AuthHelpers.ts` (Rule: unicorn/filename-case)
- Warning: 'NextRequest' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextRequest' (Rule: sonarjs/unused-import)
- Error: Async function 'handleSuccessfulAuth' has too many parameters (5). Maximum allowed is 4. (Rule: max-params)

**lib\data-quality\batchCleanup.ts**
- Error: Static async method 'runFullCleanup' has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Refactor this function to reduce its Cognitive Complexity from 36 to the 15 allowed. (Rule: sonarjs/cognitive-complexity)
- Error: Static async method 'removePlaceholders' has too many lines (65). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Refactor this function to reduce its Cognitive Complexity from 23 to the 15 allowed. (Rule: sonarjs/cognitive-complexity)
- Error: Blocks are nested too deeply (5). Maximum allowed is 4. (Rule: max-depth)
- Error: Static async method 'fixCoordinates' has too many lines (54). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Refactor this function to reduce its Cognitive Complexity from 29 to the 15 allowed. (Rule: sonarjs/cognitive-complexity)
- Error: Blocks are nested too deeply (5). Maximum allowed is 4. (Rule: max-depth)
- Error: Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed. (Rule: sonarjs/cognitive-complexity)
- Error: Refactor this function to reduce its Cognitive Complexity from 26 to the 15 allowed. (Rule: sonarjs/cognitive-complexity)
- Error: Blocks are nested too deeply (5). Maximum allowed is 4. (Rule: max-depth)

**lib\data-quality\duplicatePrevention.ts**
- Error: Static method 'calculateSimilarity' has too many lines (57). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\discoveryEngine.ts**
- Error: Async method 'isFoodTruckUrl' has too many lines (86). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Async method 'storeDiscoveredUrl' has too many lines (58). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\firecrawl.ts**
- Error: Async method 'crawlWebsite' has too many lines (60). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\gemini.ts**
- Warning: 'APIMonitor' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'APIMonitor' (Rule: sonarjs/unused-import)
- Warning: 'errorContext' is defined but never used. Allowed unused args must match /^_/u (Rule: @typescript-eslint/no-unused-vars)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`. (Rule: @typescript-eslint/unbound-method)

**lib\gemini\promptTemplates.ts**
- Error: Method 'foodTruckExtraction' has too many lines (79). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\gemini\usageLimits.ts**
- Warning: 'limits' is assigned a value but never used. Allowed unused args must match /^_/u (Rule: @typescript-eslint/no-unused-vars)

**lib\middleware\middleware-helpers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `middlewareHelpers.ts` or `MiddlewareHelpers.ts` (Rule: unicorn/filename-case)
- Error: Async function 'logAndRedirect' has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Async function 'logAndRedirectDenied' has too many parameters (6). Maximum allowed is 4. (Rule: max-params)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe member access .id on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe member access .email on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .role on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)

**lib\monitoring\apiMonitor.ts**
- Error: Static method 'generateAlerts' has too many lines (93). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\performance\databaseCache.ts**
- Error: Async arrow function has too many lines (66). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unsafe return of a value of type `any[]`. (Rule: @typescript-eslint/no-unsafe-return)

**lib\performance\webVitals.ts**
- Error: Function 'getPerformanceOptimizationSuggestions' has too many lines (102). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\pipeline\pipelineHelpers.ts**
- Warning: 'PostgrestError' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'PostgrestError' (Rule: sonarjs/unused-import)
- Error: Function 'buildTruckDataSchema' has too many lines (66). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe member access .name on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .id on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**lib\pipeline\scrapingProcessor.ts**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)

**lib\security\auditLogger.ts**
- Error: Static async method 'logAdminAction' has too many parameters (7). Maximum allowed is 4. (Rule: max-params)
- Error: Static async method 'logAuthEvent' has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Static async method 'logDataAccess' has too many parameters (6). Maximum allowed is 4. (Rule: max-params)

**lib\security\rateLimiter.ts**
- Error: Static method 'checkRateLimit' has too many lines (69). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\supabase.ts**
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe array destructuring of a tuple element with an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe argument of type `any` assigned to a parameter of type `FoodTruck`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unsafe array destructuring of a tuple element with an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe return of a value of type `any`. (Rule: @typescript-eslint/no-unsafe-return)

**lib\utils\foodTruckHelpers.ts**
- Warning: 'TrucksApiResponse' is defined but never used (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'TrucksApiResponse' (Rule: sonarjs/unused-import)
- Error: Unexpected nullable boolean value in array predicate return type. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**lib\utils\quality-scorer.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `qualityScorer.ts` or `QualityScorer.ts` (Rule: unicorn/filename-case)

**lib\utils\qualityScorer.ts**
- Error: Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service. (Rule: sonarjs/slow-regex)
- Error: Async method 'batchUpdateQualityScores' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Async method 'updateTruckQualityScore' has no 'await' expression. (Rule: @typescript-eslint/require-await)

**lib\utils\type-guards.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `typeGuards.ts` or `TypeGuards.ts` (Rule: unicorn/filename-case)

---

**This plan is now up to date with the latest linter output.**
