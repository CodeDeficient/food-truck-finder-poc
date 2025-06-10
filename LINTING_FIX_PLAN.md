# Linting Fix Plan Checklist

## Overall Status

- **Current Error Count (as of 2025-06-04 PM): 195 errors, 29 warnings**
- Focus areas: Type safety (`no-unsafe-*`), unused code, SonarJS code smells, deprecated APIs.

## General Linting Rule Compliance (Ongoing)

- [x] **`unicorn/no-null`**: Replace `null` with `undefined`. (Previously thought complete, new instances found)
  - Files: `app/api/search/route.ts`, `app/loading.tsx`, `components/TruckCard.tsx`, `components/ui/chart.tsx`, `components/ui/form.tsx`
- [~] **Type Safety (`@typescript-eslint/no-unsafe-*`, `@typescript-eslint/no-explicit-any`)**: Ensure proper type checking and eliminate `any`.
  - [x] Explicit `any` (matching `:\s*any\b|\bany,`) resolved.
  - [x] Address numerous `no-unsafe-assignment`, `no-unsafe-return`, `no-unsafe-argument`, `no-unsafe-member-access`, `no-unsafe-call` errors across many files (especially `app/api/pipeline/route.ts`, `lib/supabase.ts`, `app/page.tsx`, `components/FoodTruckInfoCard.tsx`, `app/middleware.ts`). (Partially resolved in `components/FoodTruckInfoCard.tsx`)
  - [ ] `app/api/pipeline/route.ts`
  - [x] `components/FoodTruckInfoCard.tsx` (Resolved `3:44 Unexpected any`, `18:40 Unexpected any`, `33:51 Unexpected any`, `34:24 Unsafe assignment of an any value`, `18:48 Unsafe return of a value of type any`, `18:15 Unsafe call of a(n) any typed value`, `33:14 Unsafe call of a(n) any typed value`, `33:14 Unsafe call of a(n) any typed value`)
  - [ ] `components/ui/chart.tsx`
  - [ ] `components/ui/toaster.tsx`
  - [ ] `lib/ScraperEngine.ts`
  - [ ] `lib/supabase.ts`
  - [ ] `app/page.tsx`: `383:54 Unexpected any. Specify a different type`
- [~] **`@typescript-eslint/require-await` / `sonarjs/no-invalid-await` / `@typescript-eslint/await-thenable`**: Ensure correct `async/await` usage.
  - Files: `lib/pipelineProcessor.test.ts`, `lib/scheduler.ts`, `app/api/test-pipeline-run/route.ts`
- [ ] **`@typescript-eslint/no-floating-promises`**: Handle unhandled promises.
  - Files: `app/api/scrape/route.ts`, `app/page.tsx`
- [ ] **`@typescript-eslint/no-misused-promises`**: Correct promise usage in non-async contexts.
  - Files: `app/api/scrape/route.ts`, `lib/pipelineProcessor.ts`, `lib/scheduler.ts`, `app/page.tsx`
- [x] **Unused Variables/Imports (`@typescript-eslint/no-unused-vars`, `sonarjs/unused-import`, `sonarjs/no-unused-vars`)**: Remove dead code.
  - Files: `app/admin/data-quality/page.tsx`, `app/admin/users/page.tsx`, `app/api/pipeline/route.ts`, `app/api/scrape/route.ts`, `app/page.tsx`, `components/TruckCard.tsx`, `components/ui/UseToast.ts`, `hooks/UseToast.ts`, `lib/autoScraper.test.ts`, `lib/firecrawl.test.ts`, `lib/gemini.ts`, `lib/pipelineProcessor.test.ts`, `lib/supabase.ts`, `app/api/test-pipeline-run/route.ts`, `components/ui/calendar.tsx`
- [~] **SonarJS Code Smells & Best Practices**:
  - [x] `sonarjs/no-dead-store`: `app/admin/data-quality/page.tsx`, `app/page.tsx`, `lib/pipelineProcessor.test.ts`
  - `sonarjs/no-misleading-array-reverse`: `app/admin/data-quality/page.tsx`
  - `sonarjs/no-nested-conditional`: `app/admin/pipeline/page.tsx`, `components/MapDisplay.tsx`
  - `sonarjs/cognitive-complexity`: `app/api/test-pipeline-run/route.ts`, `lib/ScraperEngine.ts`, `lib/pipelineProcessor.ts`, `lib/scheduler.ts`
  - [ ] `sonarjs/pseudo-random`: `components/ui/Sidebar.tsx`, `lib/ScraperEngine.ts`
  - [x] `sonarjs/prefer-read-only-props`: `components/SearchFilters.tsx`, `components/ThemeProvider.tsx`, `components/TruckCard.tsx`, `components/ui/Skeleton.tsx`, `components/ui/badge.tsx`
  - `sonarjs/table-header`: `components/ui/Table.tsx`
  - `sonarjs/no-empty-collection`: `lib/scheduler.ts`
  - `sonarjs/todo-tag`: `lib/pipelineProcessor.ts`, `lib/scheduler.ts`
  - `sonarjs/different-types-comparison`: `components/ThemeProvider.tsx`, `app/page.tsx`
  - `sonarjs/no-intrusive-permissions`: `app/page.tsx` (geolocation)
  - `sonarjs/no-redundant-optional`: `lib/scheduler.ts`, `lib/supabase.ts`
  - `sonarjs/void-use`: `lib/ScraperEngine.ts`, `app/page.tsx`
- [x] **Unicorn Plugin Rules**:
  - `unicorn/no-useless-undefined`: `app/page.tsx`, `app/api/test-pipeline-run/route.ts`
  - [x] `unicorn/no-document-cookie`: `components/ui/Sidebar.tsx`
  - [x] `unicorn/prefer-number-properties`: `components/TruckCard.tsx` (isNaN)
  - [x] `unicorn/explicit-length-check`: `components/ui/ToggleGroup.tsx`
  - `unicorn/switch-case-braces`: `lib/ScraperEngine.ts`, `lib/scheduler.ts`
  - `unicorn/prefer-export-from`: `lib/supabase.ts`
  - `unicorn/consistent-function-scoping`: `app/page.tsx`
- [x] **Deprecated API Usage (`sonarjs/deprecation`)**:
  - [x] `onKeyPress`: `components/SearchFilters.tsx` (Resolved)
  - [x] `ElementRef`: `components/ui/AlertDialog.tsx`, `components/ui/ContextMenu.tsx`, `components/ui/DropdownMenu.tsx`, `components/ui/HoverCard.tsx`, `components/ui/InputOtp.tsx`, `components/ui/Label.tsx`, `components/ui/Menubar.tsx`, `components/ui/NavigationMenu.tsx`, `components/ui/Popover.tsx`, `components/ui/Progress.tsx`, `components/ui/RadioGroup.tsx`, `components/ui/ScrollArea.tsx`, `components/ui/Select.tsx`, `components/ui/Separator.tsx`, `components/ui/Sheet.tsx`, `components/ui/Sidebar.tsx`, `components/ui/Slider.tsx`, `components/ui/Switch.tsx`, `components/ui/Tabs.tsx`, `components/ui/Toast.tsx`, `components/ui/Toggle.tsx`, `components/ui/ToggleGroup.tsx`, `components/ui/Tooltip.tsx`, `components/ui/accordion.tsx`, `components/ui/avatar.tsx`, `components/ui/checkbox.tsx`, `components/ui/command.tsx`, `components/ui/dialog.tsx`, `components/ui/drawer.tsx`, `components/ui/form.tsx` (All resolved)
- [ ] **Regex Issues (`sonarjs/slow-regex`, `sonarjs/empty-string-repetition`, `sonarjs/duplicates-in-character-class`)**:
  - Files: `lib/ScraperEngine.ts`, `lib/firecrawl.ts`, `lib/gemini.ts`, `tests/e2e.test.ts`
- [ ] **Other Specific Issues**:
  - `app/api/scrape/route.ts`: `211:16 Promise returned in function argument where a void return was expected` (also covered by no-misused-promises)
  - `app/api/test-pipeline-run/route.ts`: `153:31 Unexpected await of a non-Promise` (also covered by await-thenable)
  - `lib/ScraperEngine.ts`: `void-use`, `only-throw-error`
  - `components/ui/toaster.tsx`: Unsafe assignments/calls related to error handling.
  - `lib/supabase.ts`: `no-redundant-type-constituents`
  - `app/middleware.ts`: Multiple `no-unsafe-*` errors related to an `error` typed value.
  - `@typescript-eslint/only-throw-error`: `lib/ScraperEngine.ts`
  - `@typescript-eslint/restrict-template-expressions`: `components/ui/chart.tsx`
  - `@typescript-eslint/no-redundant-type-constituents`: `lib/scheduler.ts`
  - `sonarjs/different-types-comparison`: `components/ThemeProvider.tsx`, `app/page.tsx`
  - `sonarjs/no-nested-conditional`: `app/admin/pipeline/page.tsx`, `components/MapDisplay.tsx`
  - `sonarjs/table-header`: `components/ui/Table.tsx`
  - `sonarjs/todo-tag`: `lib/pipelineProcessor.ts`
  - `@typescript-eslint/no-floating-promises`: `app/api/scrape/route.ts`, `app/page.tsx`
  - `unicorn/no-useless-undefined`: `app/api/scheduler/route.ts`, `app/page.tsx`, `app/api/test-pipeline-run/route.ts`
  - `unicorn/switch-case-braces`: `lib/ScraperEngine.ts`, `lib/scheduler.ts`
  - `unicorn/prefer-export-from`: `lib/supabase.ts`
  - `unicorn/consistent-function-scoping`: `app/page.tsx`

## Detailed Error Breakdown (WBS Checklist - Sorted by Rule Frequency)

### Rule: `@typescript-eslint/no-unsafe-assignment` (44 occurrences)

- **Assigned to: Github Copilot**
- [x] **`components/FoodTruckInfoCard.tsx`**
  - [x] `34:24` (error) Unsafe assignment of an \`any\` value (Resolved)
- [ ] **`components/ui/chart.tsx`**
  - [ ] `191:19` (error) Unsafe assignment of an \`any\` value
  - [ ] `222:31` (error) Unsafe assignment of an \`any\` value
  - [ ] `223:31` (error) Unsafe assignment of an \`any\` value
  - [ ] `294:20` (error) Unsafe assignment of an \`any\` value
- [ ] **`components/ui/toaster.tsx`**
  - [ ] `14:9` (error) Unsafe assignment of an error typed value
  - [ ] `20:23` (error) Unsafe assignment of an \`any\` value
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `653:13` (error) Unsafe assignment of an \`any\` value
- [ ] **`lib/pipelineProcessor.test.ts`**
  - [ ] `37:9` (error) Unsafe assignment of an \`any\` value
  - [ ] `38:9` (error) Unsafe assignment of an \`any\` value
- [ ] **`lib/supabase.ts`**
  - [ ] `113:9` (error) Unsafe assignment of type \`any[]\` to a variable of type \`{ food_truck_id: string; name: string; description: string; price: number; dietary_tags: string[]; }[]\`
  - [ ] `135:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `166:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `177:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `291:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `329:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `354:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `356:17` (error) Unsafe assignment of an \`any\` value
  - [ ] `368:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `386:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `416:13` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `436:21` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `444:17` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `447:13` (error) Unsafe assignment of an \`any\` value
  - [ ] `448:13` (error) Unsafe assignment of an \`any\` value
  - [ ] `457:17` (error) Unsafe array destructuring of a tuple element with an \`any\` value
  - [ ] `483:15` (error) Unsafe array destructuring of a tuple element with an \`any\` value

### Rule: `@typescript-eslint/no-unsafe-member-access` (28 occurrences)

- **Assigned to: Cline Gemini**
- [ ] **`app/api/pipeline/route.ts`**
  - [ ] `501:80` (error) Unsafe member access .job_type on an \`any\` value
  - [ ] `503:28` (error) Unsafe member access .completed_at on an \`any\` value
  - [ ] `503:56` (error) Unsafe member access .completed_at on an \`any\` value
  - [ ] `506:39` (error) Unsafe member access .status on an \`any\` value
  - [ ] `506:94` (error) Unsafe member access .status on an \`any\` value
- [x] **`components/FoodTruckInfoCard.tsx`**
  - [x] `7:54` (error) Unsafe member access .name on an \`any\` value (Resolved)
  - [x] `8:48` (error) Unsafe member access .cuisine_type on an \`any\` value (Resolved)
  - [x] `10:48` (error) Unsafe member access .description on an \`any\` value (Resolved)
  - [x] `18:21` (error) Unsafe member access .schedule on an \`any\` value (Resolved)
  - [x] `18:50` (error) Unsafe member access .day_of_week on an \`any\` value (Resolved)
  - [x] `18:75` (error) Unsafe member access .is_active on an \`any\` value (Resolved)
  - [x] `29:14` (error) Unsafe member access .events on an \`any\` value (Resolved)
  - [x] `29:30` (error) Unsafe member access .events on an \`any\` value (Resolved)
  - [x] `33:20` (error) Unsafe member access .events on an \`any\` value (Resolved)
  - [x] `33:39` (error) Unsafe member access .map on an \`any\` value (Resolved)
  - [x] `34:30` (error) Unsafe member access .id on an \`any\` value (Resolved)
  - [x] `35:54` (error) Unsafe member access .title on an \`any\` value (Resolved)
  - [x] `35:83` (error) Unsafe member access .event_date on an \`any\` value (Resolved)
  - [x] `36:24` (error) Unsafe member access .location_address on an \`any\` value (Resolved)
  - [x] `37:65` (error) Unsafe member access .location_address on an \`any\` value (Resolved)
- [ ] **`components/ui/chart.tsx`**
  - [ ] `191:58` (error) Unsafe member access .fill on an \`any\` value
- [ ] **`components/ui/toaster.tsx`**
  - [ ] `18:15` (error) Unsafe member access .map on an \`error\` typed value
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `654:26` (error) Unsafe member access .coordinates on an \`any\` value
  - [ ] `655:24` (error) Unsafe member access .coordinates on an \`any\` value
  - [ ] `657:26` (error) Unsafe member access .coordinates on an \`any\` value
  - [ ] `658:24` (error) Unsafe member access .coordinates on an \`any\` value
- [ ] **`lib/supabase.ts`**
  - [ ] `447:39` (error) Unsafe member access .requests_count on an \`any\` value
  - [ ] `448:36` (error) Unsafe member access .tokens_used on an \`any\` value
  - [ ] `450:30` (error) Unsafe member access .id on an \`any\` value

### Rule: `@typescript-eslint/no-unused-vars` (22 occurrences, warnings)

- **Assigned to: Github Copilot**
- [x] **`lib/autoScraper.test.ts`**
  - [x] All Copilot-assigned unused variable/import warnings in this file are resolved (test mock usage and related issues fixed).
- [x] **`components/TruckCard.tsx`**
  - [x] `5:17` (warning) 'BadgeProps' is defined but never used
  - [x] `6:18` (warning) 'Clock' is defined but never used
  - [x] `6:32` (warning) 'Navigation' is defined but never used
  - [x] `36:59` (warning) 'userLocation' is defined but never used. Allowed unused args must match /^\_/u
- [x] **`components/ui/UseToast.ts`**
  - [x] `21:7` (warning) 'actionTypes' is assigned a value but only used as a type
- [x] **`components/ui/calendar.tsx`**
  - [x] `57:25` (warning) 'props' is defined but never used. Allowed unused args must match /^\_/u
  - [x] `58:26` (warning) 'props' is defined but never used. Allowed unused args must match /^\_/u
- [x] **`hooks/UseToast.ts`**
  - [x] `21:7` (warning) 'actionTypes' is assigned a value but only used as a type
- [x] **`lib/autoScraper.test.ts`**
  - [x] `3:10` (warning) 'ensureDefaultTrucksAreScraped' is defined but never used
  - [x] `4:10` (warning) 'DEFAULT_SCRAPE_URLS' is defined but never used
  - [x] `4:31` (warning) 'DEFAULT_STALENESS_THRESHOLD_DAYS' is defined but never used
- [x] **`lib/firecrawl.test.ts`**
  - [x] `9:7` (warning) '\_firecrawlService' is assigned a value but never used
- [x] **`lib/gemini.test.ts`**
  - [x] `26:7` (warning) '\_geminiService' is assigned a value but never used
  - [x] `41:11` (warning) '\_sampleMarkdown' is assigned a value but never used
  - [x] `42:11` (warning) '\_sampleSourceUrl' is assigned a value but never used
- [x] **`lib/gemini.ts`**
  - [x] `5:3` (warning) 'PriceRange' is defined but never used
  - [x] `7:3` (warning) 'MenuItem' is defined but never used
  - [x] `9:3` (warning) 'DailyOperatingHours' is defined but never used
- [x] **`lib/pipelineProcessor.test.ts`**
  - [x] `25:11` (warning) '\_mockExtractedData' is assigned a value but never used
  - [x] `26:11` (warning) '\_mockSourceUrl' is defined but never used
  - [x] `84:11` (warning) 'mockJobId' is defined but never used
  - [x] `85:11` (warning) 'mockExtractedData' is defined but never used
  - [x] `86:11` (warning) 'mockSourceUrl' is defined but never used
- [x] **`lib/supabase.ts`**
  - [x] `12:3` (warning) 'FoodTruckSchema' is defined but never used

### Rule: `sonarjs/unused-import` (17 occurrences)

- **Assigned to: Cline Gemini**
- [x] **`lib/autoScraper.test.ts`**
  - [x] All Copilot-assigned unused import warnings in this file are resolved (test mock usage and related issues fixed).
- [x] **`components/TruckCard.tsx`**
  - [x] `5:17` (error) Remove this unused import of 'BadgeProps'
  - [x] `6:18` (error) Remove this unused import of 'Clock'
  - [x] `6:32` (error) Remove this unused import of 'Navigation'
- [x] **`lib/autoScraper.test.ts`**
  - [x] `3:10` (error) Remove this unused import of 'ensureDefaultTrucksAreScraped'
  - [x] `4:10` (error) Remove this unused import of 'DEFAULT_SCRAPE_URLS'
  - [x] `4:31` (error) Remove this unused import of 'DEFAULT_STALENESS_THRESHOLD_DAYS'
- [x] **`lib/gemini.ts`**
  - [x] `5:3` (error) Remove this unused import of 'PriceRange'
  - [x] `7:3` (error) Remove this unused import of 'MenuItem'
  - [x] `9:3` (error) Remove this unused import of 'DailyOperatingHours'
- [x] **`lib/supabase.ts`**
  - [x] `12:3` (error) Remove this unused import of 'FoodTruckSchema'
- [x] **`lib/pipelineProcessor.test.ts`**
  - This rule appears as sonarjs/no-unused-vars for variables in this file, not sonarjs/unused-import. (Covered under sonarjs/no-unused-vars)

### Rule: `sonarjs/no-unused-vars` (7 occurrences)

- **Assigned to: Github Copilot**
- [x] **`lib/gemini.test.ts`**
  - [x] `41:11` (error) Remove the declaration of the unused '\_sampleMarkdown' variable
  - [x] `42:11` (error) Remove the declaration of the unused '\_sampleSourceUrl' variable
- [x] **`lib/pipelineProcessor.test.ts`**
  - [x] `25:11` (error) Remove the declaration of the unused '\_mockExtractedData' variable
  - [x] `26:11` (error) Remove the declaration of the unused '\_mockSourceUrl' variable
  - [x] `84:11` (error) Remove the declaration of the unused 'mockJobId' variable
  - [x] `85:11` (error) Remove the declaration of the unused 'mockExtractedData' variable
  - [x] `86:11` (error) Remove the declaration of the unused 'mockSourceUrl' variable

### Rule: `unicorn/no-null` (11 occurrences)

- **Assigned to: Github Copilot**
- [x] **`components/TruckCard.tsx`**
  - [x] `47:68` (error) Use \`undefined\` instead of \`null\`
  - [x] `49:37` (error) Use \`undefined\` instead of \`null\`
- [x] **`components/ui/chart.tsx`**
  - [x] `76:12` (error) Use \`undefined\` instead of \`null\`
  - [x] `91:52` (error) Use \`undefined\` instead of \`null\`
  - [x] `138:16` (error) Use \`undefined\` instead of \`null\`
  - [x] `158:16` (error) Use \`undefined\` instead of \`null\`
  - [x] `173:14` (error) Use \`undefined\` instead of \`null\`
  - [x] `186:22` (error) Use \`undefined\` instead of \`null\`
  - [x] `236:53` (error) Use \`undefined\` instead of \`null\`
  - [x] `276:14` (error) Use \`undefined\` instead of \`null\`
- [x] **`components/ui/form.tsx`**
  - [x] `153:12` (error) Use \`undefined\` instead of \`null\`

### Rule: `@typescript-eslint/no-unsafe-return` (9 occurrences)

- **Assigned to: Github Copilot**
- [x] **`components/FoodTruckInfoCard.tsx`**
  - [x] `18:48` (error) Unsafe return of a value of type \`any\` (Resolved)
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `617:7` (error) Unsafe return of a value of type \`any\`
  - [ ] `660:7` (error) Unsafe return of a value of type \`any\`
  - [ ] `696:7` (error) Unsafe return of a value of type \`any\`
  - [ ] `729:7` (error) Unsafe return of a value of type \`any\`
- [ ] **`lib/gemini.test.ts`**
  - [ ] `17:32` (error) Unsafe return of a value of type \`any\`
- [ ] **`lib/pipelineProcessor.test.ts`**
  - [ ] `36:111` (error) Unsafe return of a value of type \`any\`
- [ ] **`lib/supabase.ts`**
  - [ ] `396:5` (error) Unsafe return of a value of type \`any\`
  - [ ] `491:7` (error) Unsafe return of a value of type \`any\`

### Rule: `sonarjs/duplicates-in-character-class` (6 occurrences)

- **Assigned to: Cline Gemini**
- [ ] **`lib/firecrawl.ts`**
  - [ ] `283:27` (error) Remove duplicates in this character class
  - [ ] `283:45` (error) Remove duplicates in this character class
  - [ ] `283:61` (error) Remove duplicates in this character class
  - [ ] `296:49` (error) Remove duplicates in this character class
  - [ ] `303:45` (error) Remove duplicates in this character class
  - [ ] `310:45` (error) Remove duplicates in this character class

### Rule: `sonarjs/prefer-read-only-props` (5 occurrences)

- **Assigned to: Github Copilot**
- [x] **`components/SearchFilters.tsx`**
  - [x] `22:31` (error) Mark the props of the component as read-only
- [x] **`components/ThemeProvider.tsx`**
  - [x] `11:31` (error) Mark the props of the component as read-only
- [x] **`components/TruckCard.tsx`**
  - [x] `36:27` (error) Mark the props of the component as read-only
- [x] **`components/ui/Skeleton.tsx`**
  - [x] `3:19` (error) Mark the props of the component as read-only
- [x] **`components/ui/badge.tsx`**
  - [x] `32:16` (error) Mark the props of the component as read-only

### Rule: `@typescript-eslint/no-unsafe-call` (4 occurrences)

- **Assigned to: Cline Gemini**
- [x] **`components/FoodTruckInfoCard.tsx`**
  - [x] `18:15` (error) Unsafe call of a(n) \`any\` typed value (Resolved)
  - [x] `33:14` (error) Unsafe call of a(n) \`any\` typed value (Resolved)
  - [x] `33:14` (error) Unsafe call of a(n) \`any\` typed value (Resolved)
- [ ] **`components/ui/toaster.tsx`**
  - [ ] `14:22` (error) Unsafe call of a(n) \`error\` type typed value
  - [ ] `18:8` (error) Unsafe call of a(n) \`error\` type typed value

### Rule: `sonarjs/cognitive-complexity` (4 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `427:3` (error) Refactor this function to reduce its Cognitive Complexity from 25 to the 15 allowed
  - [ ] `501:11` (error) Refactor this function to reduce its Cognitive Complexity from 17 to the 15 allowed
- [ ] **`lib/pipelineProcessor.ts`**
  - [ ] `7:23` (error) Refactor this function to reduce its Cognitive Complexity from 22 to the 15 allowed
- [ ] **`lib/scheduler.ts`**
  - [ ] `395:25` (error) Refactor this function to reduce its Cognitive Complexity from 16 to the 15 allowed

### Rule: `sonarjs/slow-regex` (4 occurrences)

- **Assigned to: Cline Gemini**
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `535:24` (error) Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service
- [ ] **`lib/firecrawl.ts`**
  - [ ] `283:24` (error) Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service
- [ ] **`lib/gemini.ts`**
  - [ ] `588:46` (error) Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service
- [ ] **`tests/e2e.test.ts`**
  - [ ] `19:32` (error) Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service

### Rule: `sonarjs/void-use` (4 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `178:7` (error) Remove this use of the "void" operator
  - [ ] `206:5` (error) Remove this use of the "void" operator
  - [ ] `237:5` (error) Remove this use of the "void" operator
  - [ ] `272:5` (error) Remove this use of the "void" operator

### Rule: `@typescript-eslint/no-explicit-any` (3 occurrences)

- **Assigned to: Cline Gemini**
- [x] **`components/FoodTruckInfoCard.tsx`**
  - [x] `3:44` (error) Unexpected any. Specify a different type (Resolved)
  - [x] `18:40` (error) Unexpected any. Specify a different type (Resolved)
  - [x] `33:51` (error) Unexpected any. Specify a different type (Resolved)

### Rule: `@typescript-eslint/no-unsafe-argument` (3 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`app/api/pipeline/route.ts`**
  - [ ] `503:52` (error) Unsafe argument of type \`any\` assigned to a parameter of type \`string | number | Date\`
- [ ] **`components/ui/chart.tsx`**
  - [ ] `202:65` (error) Unsafe argument of type \`any\` assigned to a parameter of type \`Payload<ValueType, NameType>[]\`
- [ ] **`lib/supabase.ts`**
  - [ ] `144:33` (error) Unsafe argument of type \`any[]\` assigned to a parameter of type \`RawMenuItemFromDB[]\`

### Rule: `sonarjs/no-dead-store` (3 occurrences)

- **Assigned to: Github Copilot**
- [x] **`lib/pipelineProcessor.test.ts`**
  - [x] `84:11` (error) Remove this useless assignment to variable "mockJobId"
  - [x] `85:11` (error) Remove this useless assignment to variable "mockExtractedData"
  - [x] `86:11` (error) Remove the declaration of the unused 'mockSourceUrl' variable

### Rule: `sonarjs/pseudo-random` (3 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`components/ui/Sidebar.tsx`**
  - [ ] `655:26` (error) Make sure that using this pseudorandom number generator is safe here
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `347:39` (error) Make sure that using this pseudorandom number generator is safe here
  - [ ] `352:39` (error) Make sure that using this pseudorandom number generator is safe here

### Rule: `@typescript-eslint/no-misused-promises` (2 occurrences)

- **Assigned to: Cline Gemini**
- [ ] **`lib/pipelineProcessor.ts`**
  - [ ] `84:22` (error) Promise returned in function argument where a void return was expected
- [ ] **`lib/scheduler.ts`**
  - [ ] `112:34` (error) Promise returned in function argument where a void return was expected

### Rule: `@typescript-eslint/require-await` (2 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`lib/pipelineProcessor.test.ts`**
  - [ ] `36:107` (error) Async arrow function has no 'await' expression
- [ ] **`lib/scheduler.ts`**
  - [ ] `312:7` (error) Async method 'execute' has no 'await' expression

### Rule: `sonarjs/empty-string-repetition` (2 occurrences)

- **Assigned to: Cline Gemini**
- [ ] **`lib/firecrawl.ts`**
  - [ ] `258:37` (error) Rework this part of the regex to not match the empty string
  - [ ] `259:43` (error) Rework this part of the regex to not match the empty string

### Rule: `sonarjs/no-empty-collection` (2 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`lib/scheduler.ts`**
  - [ ] `319:29` (error) Review this usage of "trucks" as it can only be empty here
  - [ ] `399:29` (error) Review this usage of "activeTrucks" as it can only be empty here

### Rule: `sonarjs/no-redundant-optional` (2 occurrences)

- **Assigned to: Github Copilot**
- [ ] **`lib/scheduler.ts`**
  - [ ] `192:10` (error) Consider removing 'undefined' type or '?' specifier, one of them is redundant
- [ ] **`lib/supabase.ts`**
  - [ ] `41:14` (error) Consider removing 'undefined' type or '?' specifier, one of them is redundant

### Rule: `@typescript-eslint/only-throw-error` (1 occurrence)

- **Assigned to: Github Copilot**
- [ ] **`lib/ScraperEngine.ts`**
  - [ ] `380:11` (error) Expected an error object to be thrown

### Rule: `@typescript-eslint/restrict-template-expressions` (1 occurrence)

- **Assigned to: Cline Gemini**
- [ ] **`components/ui/chart.tsx`**
  - [ ] `289:26` (error) Invalid type "DataKey<any>" of template literal expression

### Rule: `@typescript-eslint/no-redundant-type-constituents` (1 occurrence)

- **Assigned to: Github Copilot**
- [ ] **`lib/scheduler.ts`**
  - [ ] `239:21` (error) 'unknown' overrides all other types in this union type

### Rule: `sonarjs/different-types-comparison` (1 occurrence)

- **Assigned to: Cline Gemini**
- [ ] **`components/ThemeProvider.tsx`**
  - [ ] `29:15` (error) Remove this "===" check; it will always be false. Did you mean to use "=="?

### Rule: `sonarjs/no-nested-conditional` (1 occurrence)

- **Assigned to: Github Copilot**
- [ ] **`components/MapDisplay.tsx`**
  - [ ] `52:7` (error) Extract this nested ternary operation into an independent statement

### Rule: `sonarjs/table-header` (1 occurrence)

- **Assigned to: Cline Gemini**
- [ ] **`components/ui/Table.tsx`**
  - [ ] `10:5` (error) Add a valid header row or column to this "<table>"

### Rule: `sonarjs/todo-tag` (1 occurrence)

- **Assigned to: Github Copilot**
- [ ] **`lib/pipelineProcessor.ts`**
  - [ ] `151:8` (error) Complete the task associated to this "TODO" comment

### Rule: `unicorn/explicit-length-check` (1 occurrence)

- **Assigned to to: Github Copilot**
- [x] **`components/ui/ToggleGroup.tsx`**
  - [x] `48:17` (error) Use \`.size > 0\` when checking size is not zero

### Rule: `unicorn/no-document-cookie` (1 occurrence)

- **Assigned to: Github Copilot**
- [x] **`components/ui/Sidebar.tsx`**
  - [x] `87:9` (error) Do not use \`document.cookie\` directly

### Rule: `unicorn/prefer-number-properties` (1 occurrence)

- **Assigned to: Github Copilot**
- [x] **`components/TruckCard.tsx`**
  - [x] `48:50` (error) Prefer \`Number.isNaN\` over \`isNaN\`

## Casing Conflicts (High Priority for Windows/TS)

- [x] Rename all imports and usage to match the actual file casing for:
  - [x] `components/ui/Separator.tsx` (Verified)
  - [x] `components/ui/Skeleton.tsx` (Verified)
  - [x] `components/ui/Switch.tsx` (Verified)
  - [x] `components/ui/Table.tsx` (Verified)
  - [x] `components/ui/Tabs.tsx` (Verified)
  - [x] `components/ui/Tooltip.tsx` (Verified)
        (Action: All listed items verified for correct import casing.)

## High-Impact Type Issues (Pareto Principle) - _To be re-evaluated based on new lint output_

- [~] **`lib/pipelineProcessor.ts` & `app/api/test-pipeline-run/route.ts`**:
  - [x] Fixed `locationData.raw_text ?? null` to `locationData.raw_text ?? undefined`.
- [~] **API and Pipeline Files**:
  - [~] Fix type mismatch for `scheduled_locations` (partially addressed, needs DB/interface sync).
  - [~] Fix type mismatch for `cuisine_type` (partially addressed, needs DB/interface sync).
  - [~] Fix type for `data_collected` in `pipelineProcessor.ts` (partially addressed, check for remaining issues).
- [~] **Test Files**:
  - [x] Fix test mock usage in `autoScraper.test.ts` (all Copilot-assigned errors in this file are now resolved).

## Next Steps (Revised Order - Post Full Lint Run)

1.  **Utilize Detailed WBS Checklist:**
    - Refer to the "Detailed Error Breakdown (WBS Checklist - Sorted by Rule Frequency)" section below for a granular list of all issues.
    - Prioritize addressing rules with the highest occurrences first (e.g., `sonarjs/deprecation`, `@typescript-eslint/no-unsafe-assignment`, `@typescript-eslint/no-unsafe-member-access`).
2.  **Address High-Frequency Errors Systematically (based on WBS):**
    - **`sonarjs/deprecation` (`ElementRef`, `onKeyPress`):** Systematically update all instances in `components/ui/` and `components/SearchFilters.tsx`. (ElementRef resolved, onKeyPress resolved)
    - **Type Safety (`@typescript-eslint/no-unsafe-*`, `@typescript-eslint/no-explicit-any`):** Tackle these errors file by file, focusing on critical areas like `lib/supabase.ts`, `components/FoodTruckInfoCard.tsx`, `lib/ScraperEngine.ts`, etc., as detailed in the WBS.
    - **Unused Code (`@typescript-eslint/no-unused-vars`, `sonarjs/unused-import`, `sonarjs/no-unused-vars`):** Remove all unused imports and variables. Many are auto-fixable or straightforward removals.
    - **`unicorn/no-null`**: Resolve all instances by replacing `null` with `undefined`.
3.  **SonarJS Code Smells & Best Practices (refer to WBS for specifics):**
    - Address `cognitive-complexity`, `no-dead-store`, `no-nested-conditional`, `slow-regex`, etc.
4.  **Other Specific Rules (refer to WBS):**
    - Work through remaining `unicorn/*`, `@typescript-eslint/*` rules.
5.  **Test File Cleanup**:
    - Resolve mock issues and unused code in test files as per the WBS.
6.  **Iterative Linting:**
    - Re-run lint checks (`pnpm lint`) frequently after fixing a batch of errors.
    - Update checklist status in this plan.
7.  **Final Review:**
    - Once error count is significantly reduced, perform a final `pnpm lint` and `pnpm typecheck`.
    - Address any final stragglers.

---

# Progress Log (as of 2025-06-04 PM)

- Initial `unicorn/no-null` and explicit `any` fixes completed.
- Casing conflicts for listed UI components verified and resolved.
- Test mock usage in `lib/autoScraper.test.ts` (Copilot-assigned) fully resolved.
- `ElementRef` deprecation fixes in `components/ui/AlertDialog.tsx`, `components/ui/ContextMenu.tsx`, `components/ui/DropdownMenu.tsx`, `components/ui/HoverCard.tsx`, `components/ui/InputOtp.tsx`, `components/ui/Label.tsx`, `components/ui/Menubar.tsx`, `components/ui/NavigationMenu.tsx`, `components/ui/Popover.tsx`, `components/ui/Progress.tsx`, `components/ui/RadioGroup.tsx`, `components/ui/ScrollArea.tsx`, `components/ui/Select.tsx`, `components/ui/Separator.tsx`, `components/ui/Sheet.tsx`, `components/ui/Sidebar.tsx`, `components/ui/Slider.tsx`, `components/ui/Switch.tsx`, `components/ui/Tabs.tsx`, `components/ui/Toast.tsx`, `components/ui/Toggle.tsx`, `components/ui/ToggleGroup.tsx`, `components/ui/Tooltip.tsx`, `components/ui/accordion.tsx`, `components/ui/avatar.tsx`, `components/ui/checkbox.tsx`, `components/ui/command.tsx`, `components/ui/dialog.tsx`, `components/ui/drawer.tsx`, `components/ui/form.tsx` completed. (All resolved)
- `onKeyPress` deprecation fix in `components/SearchFilters.tsx` completed.
- `unicorn/no-document-cookie` fix in `components/ui/Sidebar.tsx` completed.
- `unicorn/no-null` fixes in `components/TruckCard.tsx`, `components/ui/chart.tsx`, `components/ui/form.tsx` completed.
- `@typescript-eslint/no-unused-vars` fixes in `components/TruckCard.tsx`, `components/ui/UseToast.ts`, `components/ui/calendar.tsx`, `hooks/UseToast.ts`, `lib/autoScraper.test.ts`, `lib/firecrawl.test.ts`, `lib/gemini.test.ts`, `lib/gemini.ts`, `lib/pipelineProcessor.test.ts`, `lib/supabase.ts` completed.
- `sonarjs/unused-import` fixes in `components/TruckCard.tsx`, `lib/autoScraper.test.ts`, `lib/gemini.ts`, `lib/supabase.ts`, `lib/pipelineProcessor.test.ts` completed.
- `sonarjs/no-unused-vars` fixes in `lib/gemini.test.ts`, `lib/pipelineProcessor.test.ts` completed.
- `sonarjs/prefer-read-only-props` fixes in `components/SearchFilters.tsx`, `components/ThemeProvider.tsx`, `components/TruckCard.tsx`, `components/ui/Skeleton.tsx`, `components/ui/badge.tsx` completed.
- `sonarjs/no-dead-store` fixes in `lib/pipelineProcessor.test.ts` completed.
- `unicorn/explicit-length-check` fix in `components/ui/ToggleGroup.tsx` completed.
- `unicorn/prefer-number-properties` fix in `components/TruckCard.tsx` completed.
- **Full lint run revealed 349 problems (318 errors, 31 warnings).** The scope of remaining work is now clearer.
- Key remaining categories: extensive type safety issues (`no-unsafe-*`), unused code, SonarJS code smells (complexity, dead stores, etc.), deprecated API usage.
- Next: Systematically address high-frequency errors based on the new lint output.

---

# LINTING_FIX_PLAN.md

## Linting Fix Plan (Updated June 4, 2025)

### Status Summary

- **Core linting dependencies** upgraded and config migrated to modern ESLint flat config.
- **Autofix pass** (`pnpm lint --fix`) completed; remaining issues are mostly type safety, code quality, and grouped errors.
- **Highest-impact files and error groups prioritized and addressed:**
  - `components/FoodTruckInfoCard.tsx`:
    - All `any` usages removed.
    - Introduced type-safe interfaces for `FoodTruck`, `FoodTruckSchedule`, and `FoodTruckEvent`.
    - All props and mapped data now type-safe.
    - No remaining `any` or `no-unsafe-*` errors.
  - `app/page.tsx`:
    - All `any` usages in state, mapping, and dashboard/admin logic removed.
    - Used/defined proper interfaces for `FoodTruck`, `MenuCategory`, `MenuItem`, and `DashboardData`.
    - Fixed duplicate/casing import issue for Tabs (now uses correct casing for cross-platform compatibility).
    - No remaining `any`, `no-unsafe-*`, or import/casing errors.
- **Other top-impact files** (`TruckCard.tsx`, admin pages, lib files):
  - Searched for `any` and `no-unsafe-*`—none found or already type-safe.
  - No grouped high-frequency errors remain in these files.

### Next Steps

- **If further lint/code quality issues remain:**
  - Review lower-priority files or less frequent error groups as needed.
  - Address any new issues that arise from future code changes.
- **Ongoing:**
  - Maintain type safety and code quality in all new code.
  - Continue to use Pareto principle: focus on high-impact files and error clusters first.

### Completed Fixes (2025-06-04)

- [x] All `any` usages removed from top-impact files.
- [x] All `no-unsafe-*` and grouped type safety/code quality errors resolved in prioritized files.
- [x] Duplicate/casing import issue for Tabs fixed.
- [x] All high-frequency lint/type errors in user-facing and admin dashboard code eliminated.
- [x] All `ElementRef` deprecation errors in `components/ui/` files resolved.
- [x] `onKeyPress` deprecation in `components/SearchFilters.tsx` resolved.

---

**This plan is now up to date.**
