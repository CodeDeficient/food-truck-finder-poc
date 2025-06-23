# Linting Fix Plan Checklist

## ⚠️ Status Update (as of 6/23/2025)

- **Current Error Count (as of 6/23/2025): 100 problems (80 errors, 20 warnings)**
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

1. **Prioritize and fix by error category and file:**
   - Strict boolean expressions and type safety in all conditionals.
   - Reduce function size and parameter count to meet limits.
   - Mark all React props as `readonly`.
   - Remove all unused variables/imports.
   - Fix file naming to match conventions.
   - Eliminate all `any` usage and unsafe assignments.
   - Replace all `null` with `undefined` and remove useless `undefined`.
2. **Work file-by-file, starting with the highest-error files:**
   - Begin with `lib/ScraperEngine.ts`, `lib/api/test-integration/helpers.ts`, `components/admin/RealtimeStatusIndicator.tsx`, `components/ui/chart.tsx`, etc.
   - For each file: fix all errors, re-run linter, and update this checklist.
3. **Iteratively re-run the linter and update the checklist.**
4. **Continue until all errors and warnings are resolved.**

---

# Progress Log (as of 6/23/2025)

- Linter run revealed 100 problems (80 errors, 20 warnings).
- New top error categories: strict boolean expressions, function size, readonly props, unused code, type safety, file naming, and null/undefined handling.
- Next: Begin remediation in the highest-error files and update this plan after each batch of fixes.

### Detailed Error List:

**app\admin\food-trucks\[id]\page.tsx**
- Error: 'FoodTruck' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'FoodTruck'. (Rule: sonarjs/unused-import)

**app\admin\users\page.tsx**
- Error: 'PostgrestError' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'PostgrestError'. (Rule: sonarjs/unused-import)
- Error: 'Profile' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)

**app\api\admin\automated-cleanup\route.ts**
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)

**app\api\admin\data-cleanup\route.ts**
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)

**app\api\cron\auto-scrape\route.ts**
- Error: '_' is assigned a value but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove the declaration of the unused '_' variable. (Rule: sonarjs/no-unused-vars)

**app\api\cron\quality-check\route.ts**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Unexpected `await` of a non-Promise (non-"Thenable") value. (Rule: @typescript-eslint/await-thenable)
- Error: Refactor this redundant 'await' on a non-promise. (Rule: sonarjs/no-invalid-await)

**app\api\monitoring\api-usage\route.ts**
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)

**app\api\trucks\route.ts**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**app\auth\callback\route.ts**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**app\login\page.tsx**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**app\page.tsx**
- Error: Promise-returning function provided to attribute where a void return was expected. (Rule: @typescript-eslint/no-misused-promises)

**components\MapDisplay.tsx**
- Error: 'useMap' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'useMap'. (Rule: sonarjs/unused-import)
- Error: Function 'MapDisplay' has too many lines (61). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\SearchFilters.tsx**
- Error: Function 'MainSearchSection' has too many lines (53). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Function 'SearchFilters' has too many lines (83). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\TruckCard.tsx**
- Error: 'formatPrice' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)

**components\WebVitalsReporter.tsx**
- Error: Remove this redundant jump. (Rule: sonarjs/no-redundant-jump)

**components\admin\RealtimeStatusIndicator.tsx**
- Error: Function 'SystemAlerts' has too many lines (52). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Function 'RealtimeStatusIndicator' has too many lines (89). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\admin\UserMenu.tsx**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe member access .user_metadata on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .user_metadata on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .email on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)

**components\admin\cleanup\CleanupHeader.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\admin\cleanup\CleanupPreview.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\admin\cleanup\CleanupResults.tsx**
- Error: Function 'CleanupResults' has too many lines (86). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\admin\cleanup\OperationSelector.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\admin\food-trucks\detail\ContactField.tsx**
- Error: 'Mail' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'Mail'. (Rule: sonarjs/unused-import)
- Error: 'Phone' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'Phone'. (Rule: sonarjs/unused-import)
- Error: 'Globe' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'Globe'. (Rule: sonarjs/unused-import)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\admin\food-trucks\detail\ContactInfoCard.tsx**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\admin\food-trucks\detail\OperatingHoursCard.tsx**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\admin\food-trucks\detail\QualityMetricsGrid.tsx**
- Error: 'qualityCategory' is defined but never used. Allowed unused args must match /^_/u. (Rule: @typescript-eslint/no-unused-vars)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\admin\food-trucks\detail\SocialMediaLinks.tsx**
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)

**components\admin\pipeline\RecentScrapingJobsTable.tsx**
- Error: Function 'RecentScrapingJobsTable' has too many lines (63). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\admin\realtime\StatusHelpers.tsx**
- Error: 'StatusMetric' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'StatusMetric'. (Rule: sonarjs/unused-import)

**components\admin\realtime\SystemAlerts.tsx**
- Error: Function 'SystemAlerts' has too many lines (52). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)

**components\admin\realtime\useSystemMetrics.ts**
- Error: Parsing error: '>' expected. (Rule: null)

**components\admin\realtime\useSystemMetrics.tsx**
- Error: Parsing error: "parserOptions.project" has been provided for @typescript-eslint/parser.
The file was not found in any of the provided project(s): components\admin\realtime\useSystemMetrics.tsx (Rule: null)

**components\admin\realtime\ScrapingJobsStatus.tsx**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)
- Error: Unsafe member access .active on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .completed on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .pending on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Unsafe member access .failed on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)

**components\home\AppHeader.tsx**
- Error: 'useThemeSwitcher' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'useThemeSwitcher'. (Rule: sonarjs/unused-import)

**components\home\MapSection.tsx**
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**components\home\TruckListSection.tsx**
- Error: 'Link' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'Link'. (Rule: sonarjs/unused-import)
- Error: Function 'TruckListSection' has too many lines (51). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\login\EmailFormFields.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: 'loading' is defined but never used. Allowed unused args must match /^_/u. (Rule: @typescript-eslint/no-unused-vars)

**components\map\MapViewUpdater.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\monitoring\ApiMonitoringDashboard.tsx**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Unsafe assignment of an `any` value. (Rule: @typescript-eslint/no-unsafe-assignment)
- Error: Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<APIUsageData | null>`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)
- Error: Unsafe argument of type `any` assigned to a parameter of type `SetStateAction<string | null>`. (Rule: @typescript-eslint/no-unsafe-argument)
- Error: Unexpected any value in conditional. An explicit comparison or type conversion is required. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unsafe member access .message on an `any` value. (Rule: @typescript-eslint/no-unsafe-member-access)
- Error: Prefer using nullish coalescing operator (`??`) instead of a logical or (`||`), as it is a safer operator. (Rule: @typescript-eslint/prefer-nullish-coalescing)
- Error: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator. (Rule: @typescript-eslint/no-floating-promises)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\monitoring\FeatureOverviewCards.tsx**
- Error: Function 'FeatureOverviewCards' has too many lines (57). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\monitoring\MonitoringFeaturesCard.tsx**
- Error: Function 'MonitoringFeaturesCard' has too many lines (59). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\test-pipeline\ErrorDisplay.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)

**components\test-pipeline\StageResultCard.tsx**
- Error: Function 'StageResultCard' has too many lines (83). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\test-pipeline\TestPipelineForm.tsx**
- Error: Function 'TestPipelineForm' has too many lines (84). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\test-pipeline\TestPipelineSubmitHandler.ts**
- Error: 'FormEvent' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'FormEvent'. (Rule: sonarjs/unused-import)

**components\test-pipeline\TestResultsDisplay.tsx**
- Error: Function 'TestResultsDisplay' has too many lines (52). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)

**components\trucks\ContactSection.tsx**
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\trucks\MenuSection.tsx**
- Error: 'formatPrice' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'formatPrice'. (Rule: sonarjs/unused-import)

**components\trucks\OperatingHoursSection.tsx**
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\trucks\RatingSection.tsx**
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\trucks\SocialMediaSection.tsx**
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\trucks\TruckBasicInfo.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\trucks\TruckCardHeader.tsx**
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Unexpected nullable number value in conditional. Please handle the nullish/zero/NaN cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\trucks\TruckContactInfo.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\trucks\TruckDetailHeader.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\trucks\TruckLocationInfo.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\trucks\TruckOperatingHours.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Unexpected nullable boolean value in conditional. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**components\trucks\TruckRatingsReviews.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\ui\carousel.tsx**
- Error: Arrow function has too many lines (91). Maximum allowed is 50. (Rule: max-lines-per-function)

**components\ui\chart.tsx**
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Arrow function has too many lines (101). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: This assertion is unnecessary since it does not change the type of the expression. (Rule: @typescript-eslint/no-unnecessary-type-assertion)
- Error: Unexpected nullable boolean value in conditional. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)
- Error: Unexpected negated condition. (Rule: unicorn/no-negated-condition)
- Error: Function has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Arrow function has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\ui\chart\TooltipIndicator.tsx**
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**components\ui\chart\TooltipItemContent.tsx**
- Error: Function has too many parameters (5). Maximum allowed is 4. (Rule: max-params)
- Error: Mark the props of the component as read-only. (Rule: sonarjs/prefer-read-only-props)

**components\ui\chart\useTooltipLabel.tsx**
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)
- Error: Do not use useless `undefined`. (Rule: unicorn/no-useless-undefined)

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
- Error: Use `undefined` instead of `null`. (Rule: unicorn/no-null)

**lib\api\firecrawl\handlers.ts**
- Error: Async function 'handleSearchOperation' has no 'await' expression. (Rule: @typescript-eslint/require-await)

**lib\api\scheduler\handlers.ts**
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**lib\api\test-integration\helpers.ts**
- Error: Unexpected any. Specify a different type. (Rule: @typescript-eslint/no-explicit-any)

**lib\api\test-integration\pipeline-runner.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `pipelineRunner.ts` or `PipelineRunner.ts`. (Rule: unicorn/filename-case)
- Error: 'NextResponse' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextResponse'. (Rule: sonarjs/unused-import)
- Error: 'StageResult' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'StageResult'. (Rule: sonarjs/unused-import)
- Error: Async function 'runTestPipeline' has too many lines (60). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\api\test-integration\schema-mapper.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `schemaMapper.ts` or `SchemaMapper.ts`. (Rule: unicorn/filename-case)
- Error: Function 'mapExtractedDataToTruckSchema' has too many lines (55). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\api\test-integration\stage-handlers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `stageHandlers.ts` or `StageHandlers.ts`. (Rule: unicorn/filename-case)
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
- Error: Filename is not in camel case or pascal case. Rename it to `authHelpers.ts` or `AuthHelpers.ts`. (Rule: unicorn/filename-case)
- Error: 'NextRequest' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'NextRequest'. (Rule: sonarjs/unused-import)
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
- Error: 'APIMonitor' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'APIMonitor'. (Rule: sonarjs/unused-import)
- Error: 'errorContext' is defined but never used. Allowed unused args must match /^_/u. (Rule: @typescript-eslint/no-unused-vars)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`.
If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`.
If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`.
If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead. (Rule: @typescript-eslint/unbound-method)
- Error: Avoid referencing unbound methods which may cause unintentional scoping of `this`.
If your function does not access `this`, you can annotate it with `this: void`, or consider using an arrow function instead. (Rule: @typescript-eslint/unbound-method)

**lib\gemini\promptTemplates.ts**
- Error: Method 'foodTruckExtraction' has too many lines (79). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unexpected nullable string value in conditional. Please handle the nullish/empty cases explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)

**lib\gemini\usageLimits.ts**
- Error: 'limits' is assigned a value but never used. Allowed unused args must match /^_/u. (Rule: @typescript-eslint/no-unused-vars)

**lib\middleware\middleware-helpers.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `middlewareHelpers.ts` or `MiddlewareHelpers.ts`. (Rule: unicorn/filename-case)
- Error: Async function 'protectAdminRoutes' has too many lines (70). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\monitoring\apiMonitor.ts**
- Error: Static method 'generateAlerts' has too many lines (93). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\performance\databaseCache.ts**
- Error: Async arrow function has too many lines (66). Maximum allowed is 50. (Rule: max-lines-per-function)
- Error: Unsafe return of a value of type `any[]`. (Rule: @typescript-eslint/no-unsafe-return)

**lib\performance\webVitals.ts**
- Error: Function 'getPerformanceOptimizationSuggestions' has too many lines (102). Maximum allowed is 50. (Rule: max-lines-per-function)

**lib\pipeline\pipelineHelpers.ts**
- Error: 'PostgrestError' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'PostgrestError'. (Rule: sonarjs/unused-import)
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
- Error: 'TrucksApiResponse' is defined but never used. (Rule: @typescript-eslint/no-unused-vars)
- Error: Remove this unused import of 'TrucksApiResponse'. (Rule: sonarjs/unused-import)
- Error: Unexpected nullable boolean value in array predicate return type. Please handle the nullish case explicitly. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Unexpected object value in conditional. The condition is always true. (Rule: @typescript-eslint/strict-boolean-expressions)
- Error: Remove this "!==" check; it will always be true. Did you mean to use "!="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)
- Error: Remove this "===" check; it will always be false. Did you mean to use "=="? (Rule: sonarjs/different-types-comparison)

**lib\utils\quality-scorer.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `qualityScorer.ts` or `QualityScorer.ts`. (Rule: unicorn/filename-case)
- Error: Empty files are not allowed. (Rule: unicorn/no-empty-file)

**lib\utils\qualityScorer.ts**
- Error: Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service. (Rule: sonarjs/slow-regex)
- Error: Async method 'batchUpdateQualityScores' has no 'await' expression. (Rule: @typescript-eslint/require-await)
- Error: Async method 'updateTruckQualityScore' has no 'await' expression. (Rule: @typescript-eslint/require-await)

**lib\utils\type-guards.ts**
- Error: Filename is not in camel case or pascal case. Rename it to `typeGuards.ts` or `TypeGuards.ts`. (Rule: unicorn/filename-case)
- Error: Empty files are not allowed. (Rule: unicorn/no-empty-file)

---

# LINTING_FIX_PLAN.md

## Linting Fix Plan (Updated June 23, 2025)

### Status Summary

- **Core linting dependencies** upgraded and config migrated to modern ESLint flat config.
- **Autofix pass** (`pnpm lint --fix`) completed; remaining issues are mostly type safety, code quality, and grouped errors.
- **Highest-impact files and error groups prioritized and addressed:**
  - See above for new top error files and categories.

### Next Steps

- **If further lint/code quality issues remain:**
  - Review lower-priority files or less frequent error groups as needed.
  - Address any new issues that arise from future code changes.
- **Ongoing:**
  - Maintain type safety and code quality in all new code.
  - Continue to use Pareto principle: focus on high-impact files and error clusters first.

### Completed Fixes (2025-06-23)

- [x] `components/test-pipeline/ErrorDisplay.tsx` – All linter errors fixed (readonly props, strict conditionals, useless undefined)
- [x] `lib/utils/type-guards.ts` – Canonicalized, re-exported, and no longer empty
- [x] `lib/utils/typeGuards.ts` – Canonical, all errors fixed
- [x] `lib/utils/qualityScorer.ts` – Regex, async, and comment issues fixed
- [x] `lib/utils/quality-scorer.ts` – Deprecated, re-exported, not empty
- [x] `components/MapDisplay.tsx` – Function size, unused import, and typing fixed
- [x] `components/SearchFilters.tsx` – Function size, readonly props, and logic split
- [x] `components/WebVitalsReporter.tsx` – Redundant jump removed
- [x] `components/admin/RealtimeStatusIndicator.tsx` – Function size, readonly props, and type errors fixed
- [x] `components/admin/cleanup/CleanupHeader.tsx` – Readonly props confirmed
- [x] `components/admin/cleanup/CleanupOperationDetails.tsx` – Readonly props confirmed
- [x] `lib/security/rateLimiter.ts` – Function size, method structure, and syntax fixed
- [x] `lib/monitoring/apiMonitor.ts` – Function size, logic extraction
- [x] `lib/middleware/middleware-helpers.ts` – Function size, null/undefined, and logic split

---

**This plan is now up to date with the latest linter output.**
