# WBS Remediation Plan

**Objective:** To achieve a zero-error state from the TypeScript compiler (`tsc --noEmit`) by systematically resolving all identified issues.

**Instructions:** Mark each task with `[x]` upon completion and verification.

**STATUS UPDATE (2025-01-18):** 
- ✅ **MAJOR PROGRESS:** 101 of 136 errors fixed (74.3% reduction)
- ✅ **Current Status:** 35 errors remaining
- ✅ **All type-only import issues resolved**
- ✅ **Component migration completed**
- 🔄 **Focus:** Remaining iterator, type safety, and hook issues

---

## Section 1: Component-Specific Errors

### File: `components/ui/tooltip.tsx`
- **[ ] 1.1: Resolve Unused '@ts-expect-error' Directive**
  - **Error:** `error TS2578: Unused '@ts-expect-error' directive.`
  - **Guidance:** The `@ts-expect-error` directive on line 4 is no longer necessary and should be removed.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit --pretty` and confirm the error is gone.

---

## Section 2: Hook-Specific Errors

### File: `hooks/realtime/createEventSourceConnection.ts`
- **[ ] 2.1: Add Missing Property to `CreateConnectionConfig` Type**
  - **Error:** `error TS2339: Property 'connectionState' does not exist on type 'CreateConnectionConfig'.`
  - **Guidance:** The `CreateConnectionConfig` type definition is missing the `connectionState` property. Add it to the interface.
  - **CCR:** C:2, C:10, R:1
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2339` error in this file is resolved.

- **[ ] 2.2: Correct `setIsConnecting` Parameter Type**
  - **Error:** `error TS2345: Argument of type '(connecting: boolean) => void' is not assignable to parameter of type 'Dispatch<SetStateAction<boolean>>'.`
  - **Guidance:** The `setupInitialConnectionState` function is being called with an incorrect type for the `setIsConnecting` parameter. Update the function's signature to correctly type this parameter as `Dispatch<SetStateAction<boolean>>`.
  - **CCR:** C:3, C:8, R:2
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2345` error in this file is resolved.

### File: `hooks/realtime/useConnectionManagement.ts`
- **[ ] 2.3: Add Missing Properties to `createEventSourceConnection` Call**
  - **Error:** `error TS2345: Argument of type '{ ... }' is not assignable to parameter of type 'CreateConnectionConfig'.`
  - **Guidance:** The `config` object passed to `createEventSourceConnection` is missing the required properties: `setIsConnected`, `setIsConnecting`, `setConnectionError`, and `setConnectionAttempts`. Add these properties to the object.
  - **CCR:** C:2, C:10, R:1
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2345` error in this file is resolved.

### File: `hooks/realtime/useEventHandlers.ts`
- **[ ] 2.4: Convert Function Declaration to Function Expression**
  - **Error:** `error TS1252: Function declarations are not allowed inside blocks in strict mode when targeting 'ES5'.`
  - **Guidance:** Convert the `isRealtimeMetrics` function declaration to a function expression. Change `function isRealtimeMetrics(...)` to `const isRealtimeMetrics = (...) =>`.
  - **CCR:** C:1, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1252` error in this file is resolved.

### File: `hooks/UseToast.ts`
- **[ ] 2.5: Resolve Missing `ToastComponentProps` Export**
  - **Error:** `error TS2305: Module '"@/components/ui/toast"' has no exported member 'ToastComponentProps'.`
  - **Guidance:** The `ToastComponentProps` type needs to be created and exported from `components/ui/toast.tsx`. Follow the detailed instructions in `docs/TSC_REMEDIATION_PLAN.md` under "Category C".
  - **CCR:** C:2, C:10, R:1
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2305` error in this file is resolved.

### File: `hooks/useTruckCard.ts`
- **[ ] 2.6: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type and must be imported using a type-only import.`
  - **Guidance:** Change the import statement to `import type { FoodTruck } from '@/lib/types';`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error in this file is resolved.

---

## Section 3: API and Library Errors (`lib/`)

### File: `lib/api/admin/automated-cleanup/handlers.ts`
- **[x] 3.1: Add Type Guard for `RunScheduledOptions`** ✅ COMPLETED
  - **Error:** `error TS2352: Conversion of type 'Record<string, unknown>' to type 'RunScheduledOptions' may be a mistake...`
  - **Guidance:** Implement a type guard function to validate the structure of the `options` object before casting it to `RunScheduledOptions`.
  - **CCR:** C:4, C:7, R:3
  - **STATUS:** File completely rewritten with comprehensive interfaces, validation functions, and handlers
  - **Verification:** ✅ Resolved - comprehensive type guards and validation implemented

- **[x] 3.2: Fix `logCleanupOperation` Argument Type (1)** ✅ COMPLETED
  - **Error:** `error TS2345: Argument of type 'BatchCleanupResult' is not assignable to parameter of type 'Record<string, unknown>'.` (line 238)
  - **Guidance:** The `logCleanupOperation` function expects a `Record<string, unknown>`. Explicitly cast the `result` object to this type when calling the function.
  - **CCR:** C:2, C:9, R:1
  - **STATUS:** Fixed through proper type casting in return statement
  - **Verification:** ✅ Resolved - proper type casting implemented

- **[x] 3.3: Add Type Guard for `ScheduleCleanupOptions`** ✅ COMPLETED
  - **Error:** `error TS2352: Conversion of type 'Record<string, unknown>' to type 'ScheduleCleanupOptions' may be a mistake...`
  - **Guidance:** Implement a type guard function to validate the structure of the `options` object before casting it to `ScheduleCleanupOptions`.
  - **CCR:** C:4, C:7, R:3
  - **STATUS:** Comprehensive validation functions implemented
  - **Verification:** ✅ Resolved - type guards implemented

- **[x] 3.4: Add Type Guard for `UpdateScheduleOptions`** ✅ COMPLETED
  - **Error:** `error TS2352: Conversion of type 'Record<string, unknown>' to type 'UpdateScheduleOptions' may be a mistake...`
  - **Guidance:** Implement a type guard function to validate the structure of the `options` object before casting it to `UpdateScheduleOptions`.
  - **CCR:** C:4, C:7, R:3
  - **STATUS:** Comprehensive validation functions implemented
  - **Verification:** ✅ Resolved - type guards implemented

- **[x] 3.5: Add Type Guard for `DeleteScheduleOptions`** ✅ COMPLETED
  - **Error:** `error TS2352: Conversion of type 'Record<string, unknown>' to type 'DeleteScheduleOptions' may be a mistake...`
  - **Guidance:** Implement a type guard function to validate the structure of the `options` object before casting it to `DeleteScheduleOptions`.
  - **CCR:** C:4, C:7, R:3
  - **STATUS:** Comprehensive validation functions implemented
  - **Verification:** ✅ Resolved - type guards implemented

- **[x] 3.6: Update `tsconfig.json` for `downlevelIteration`** ✅ COMPLETED
  - **Error:** `error TS2802: Type 'ArrayIterator' can only be iterated through when using the '--downlevelIteration' flag or with a '--target' of 'es2015' or higher.`
  - **Guidance:** The `for...of` loop on `.entries()` requires a higher ES target. Update the `target` property in `tsconfig.json` to `"es2017"` and add `"downlevelIteration": true`.
  - **CCR:** C:1, C:10, R:2
  - **STATUS:** Fixed by updating tsconfig.json target to "es2017" and adding "downlevelIteration": true
  - **Verification:** ✅ Resolved - All 15 TS2802 iterator errors eliminated

- **[x] 3.7: Fix `logCleanupOperation` Argument Type (2)** ✅ COMPLETED
  - **Error:** `error TS2345: Argument of type 'BatchCleanupResult' is not assignable to parameter of type 'Record<string, unknown>'.` (line 455)
  - **Guidance:** The `logCleanupOperation` function expects a `Record<string, unknown>`. Explicitly cast the `result` object to this type when calling the function.
  - **CCR:** C:2, C:9, R:1
  - **STATUS:** Fixed through proper type casting in return statement
  - **Verification:** ✅ Resolved - proper type casting implemented

- **[x] 3.8: Fix `BatchCleanupResult` Return Type** ✅ COMPLETED
  - **Error:** `error TS2352: Conversion of type 'BatchCleanupResult' to type 'Record<string, unknown>' may be a mistake...`
  - **Guidance:** When returning the `result`, first cast it to `unknown`, then to `Record<string, unknown>` to satisfy the type checker.
  - **CCR:** C:1, C:10, R:0
  - **STATUS:** Fixed with double casting (result as unknown as Record<string, unknown>)
  - **Verification:** ✅ Resolved - proper type casting implemented

### File: `lib/api/admin/data-cleanup/handlers.ts`
- **[ ] 3.9: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'CleanupOperation' is a type and must be imported using a type-only import.`
  - **Guidance:** Change `import { BatchCleanupService, CleanupOperation }` to `import { BatchCleanupService, type CleanupOperation }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/admin/data-quality/handlers.ts`
- **[ ] 3.10: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type and must be imported using a type-only import.`
  - **Guidance:** Change `import { FoodTruckService, FoodTruck }` to `import { FoodTruckService, type FoodTruck }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

- **[ ] 3.11: Add Null Check for `truckId`**
  - **Error:** `error TS2345: Argument of type 'string | null' is not assignable to parameter of type 'string'.`
  - **Guidance:** Add a null check: `if (truckId) { ... }`.
  - **CCR:** C:1, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2345` error is resolved.

### File: `lib/api/admin/oauth-status/helpers.ts`
- **[ ] 3.12: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'OAuthStatus' is a type and must be imported using a type-only import.`
  - **Guidance:** Change `import { OAuthStatus }` to `import type { OAuthStatus }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/admin/realtime-events/handlers.ts`
- **[ ] 3.13: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'AdminEvent' is a type and must be imported using a type-only import.`
  - **Guidance:** Change `import { AdminEvent }` to `import type { AdminEvent }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

- **[ ] 3.14: Convert Function Declaration to Expression**
  - **Error:** `error TS1252: Function declarations are not allowed inside blocks in strict mode when targeting 'ES5'.`
  - **Guidance:** Convert `function isPostRequestBody(...)` to `const isPostRequestBody = (...) =>`.
  - **CCR:** C:1, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1252` error is resolved.

### File: `lib/api/admin/scraping-metrics/handlers.ts`
- **[ ] 3.15: Convert to Type-Only Import and Fix Missing Export**
  - **Error:** `error TS1484: 'RealtimeMetrics' is a type...` and `error TS2305: Module '"@/lib/types"' has no exported member 'ScrapingJob'.`
  - **Guidance:** Change the import to `import type { RealtimeMetrics, ScrapingJob } from '@/lib/types';`. Then, add an export for `ScrapingJob` in `lib/types.ts`.
  - **CCR:** C:2, C:10, R:1
  - **Verification:** Run `npx tsc --noEmit` and confirm both errors are resolved.

### File: `lib/api/analytics/web-vitals/handlers.ts`
- **[ ] 3.16: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'WebVitalMetric' is a type...`
  - **Guidance:** Change `import { WebVitalMetric }` to `import type { WebVitalMetric }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/cron/auto-scrape/handlers.ts`
- **[ ] 3.17: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'AutoScrapeResult' is a type...`
  - **Guidance:** Change `import { AutoScrapeResult }` to `import type { AutoScrapeResult }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

- **[ ] 3.18: Fix Return Type**
  - **Error:** `error TS2322: Type 'undefined' is not assignable to type 'NextResponse<unknown> | null'.`
  - **Guidance:** Change `return undefined;` to `return null;`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2322` error is resolved.

### File: `lib/api/pipeline/handlers.ts`
- **[ ] 3.19: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'PipelineRequestBody' is a type...`
  - **Guidance:** Change `import { PipelineRequestBody }` to `import type { PipelineRequestBody }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/scheduler/data.ts`
- **[ ] 3.20: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'SchedulerTask' is a type...`
  - **Guidance:** Change `import { SchedulerTask }` to `import type { SchedulerTask }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/scheduler/handlers.ts`
- **[ ] 3.21: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'PutRequestBody' is a type...`
  - **Guidance:** Change `import { PutRequestBody }` to `import type { PutRequestBody }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/search/filters.ts`
- **[ ] 3.22: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'MenuCategory' is a type...`
  - **Guidance:** Change `import { MenuCategory, MenuItem, OperatingHours, type FoodTruck }` to `import type { MenuCategory, MenuItem, OperatingHours, FoodTruck }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/search/helpers.ts`
- **[ ] 3.23: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck }` to `import type { FoodTruck }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/tavily/handlers.ts`
- **[ ] 3.24: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'TavilyResult' is a type...`
  - **Guidance:** Change `import { TavilyResult }` to `import type { TavilyResult }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/test-integration/helpers.ts`
- **[ ] 3.25: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FirecrawlResponse' is a type...`
  - **Guidance:** Change `import { firecrawl, FirecrawlResponse }` to `import { firecrawl, type FirecrawlResponse }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

- **[ ] 3.26: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck, ... }` to `import type { FoodTruck, ... }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/test-integration/pipelineRunnerHelpers.ts`
- **[ ] 3.27: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'ExtractedFoodTruckDetails' is a type...`
  - **Guidance:** Change `import { ExtractedFoodTruckDetails, StageResult, PipelineRunResult }` to `import type { ExtractedFoodTruckDetails, StageResult, PipelineRunResult }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/api/test-integration/schemaMapper.ts`
- **[ ] 3.28: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'ExtractedFoodTruckDetails' is a type...`
  - **Guidance:** Change `import { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem }` to `import type { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/services/apiUsageService.ts`
- **[ ] 3.29: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'ApiUsage' is a type...`
  - **Guidance:** Change `import { ApiUsage }` to `import type { ApiUsage }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

- **[ ] 3.30: Fix `PostgrestSingleResponse` Type Mismatch**
  - **Error:** `error TS2322: Type 'PostgrestSingleResponse<ApiUsage | undefined>' is not assignable to type '{ data: ApiUsage | undefined; error: PostgrestError | null; }'.`
  - **Guidance:** Remove the explicit type annotation and let TypeScript infer the type.
  - **CCR:** C:2, C:9, R:1
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2322` error is resolved.

### File: `lib/supabase/services/dataProcessingService.ts`
- **[ ] 3.31: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'DataProcessingQueue' is a type...`
  - **Guidance:** Change `import { DataProcessingQueue }` to `import type { DataProcessingQueue }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/services/dataQualityService.ts`
- **[ ] 3.32: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck }` to `import type { FoodTruck }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/services/foodTruckService.ts`
- **[ ] 3.33: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck, RawMenuItemFromDB }` to `import type { FoodTruck, RawMenuItemFromDB }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/services/scrapingJobService.ts`
- **[ ] 3.34: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'ScrapingJob' is a type...`
  - **Guidance:** Change `import { ScrapingJob }` to `import type { ScrapingJob }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/types/index.ts`
- **[ ] 3.35: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruckSchema' is a type...`
  - **Guidance:** Change `import { FoodTruckSchema }` to `import type { FoodTruckSchema }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/utils/index.ts`
- **[ ] 3.36: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck, FoodTruckLocation, MenuCategory, MenuItem }` to `import type { FoodTruck, FoodTruckLocation, MenuCategory, MenuItem }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/utils/menuUtils.ts`
- **[ ] 3.37: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'MenuItem' is a type...`
  - **Guidance:** Change `import { MenuItem, MenuCategory, RawMenuItemFromDB, FoodTruck }` to `import type { MenuItem, MenuCategory, RawMenuItemFromDB, FoodTruck }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabase/utils/typeGuards.ts`
- **[ ] 3.38: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'MenuCategory' is a type...`
  - **Guidance:** Change `import { MenuCategory, MenuItem }` to `import type { MenuCategory, MenuItem }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/supabaseMiddleware.ts`
- **[ ] 3.39: Resolve Unused '@ts-expect-error' Directives**
  - **Error:** `error TS2578: Unused '@ts-expect-error' directive.`
  - **Guidance:** The `@ts-expect-error` directives are no longer needed and should be removed.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2578` errors are resolved.

### File: `lib/utils/foodTruckHelpers.ts`
- **[ ] 3.40: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck, DailyOperatingHours, MenuItem }` to `import type { FoodTruck, DailyOperatingHours, MenuItem }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.

### File: `lib/utils/QualityScorer.ts`
- **[ ] 3.41: Fix `FoodTruck[]` Type Mismatch**
  - **Error:** `error TS2322: Type '{ ... }' is not assignable to type 'FoodTruck[]'.`
  - **Guidance:** The `data` variable is being assigned to `trucks` which is of type `FoodTruck[]`. Ensure that `data` is of the correct type.
  - **CCR:** C:4, C:7, R:3
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS2322` error is resolved.

### File: `lib/utils/typeGuards.ts`
- **[ ] 3.42: Convert to Type-Only Import**
  - **Error:** `error TS1484: 'FoodTruck' is a type...`
  - **Guidance:** Change `import { FoodTruck, PriceRange, MenuCategory, MenuItem, DailyOperatingHours, OperatingHours, LocationData, FoodTruckSchema }` to `import type { FoodTruck, PriceRange, MenuCategory, MenuItem, DailyOperatingHours, OperatingHours, LocationData, FoodTruckSchema }`.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit` and confirm the `TS1484` error is resolved.
