# WBS: TypeScript Namespace Import Remediation (TS2709)

## Objective
Eliminate all “Cannot use namespace as a type” (TS2709) and related duplicate-type conflicts by consolidating shared types and converting namespace-style type usage to modern ES module patterns.

---

- **Legend**  
  `[ ]` – Open  `[x]` – Done  `CCR` – Complexity / Clarity / Risk (0-10)

---

### 1 Pre-Change Analysis

[x] **1.1 Inventory duplicate type declarations**  
&nbsp;&nbsp;• Search for repeated interfaces (FoodTruck, MenuItem, ScrapingJob …) outside `lib/types.ts`.  
&nbsp;&nbsp;• Output list in section 3.  
**CCR:** 3/9/3  
**Verify:** ✅ Found duplicates in:
&nbsp;&nbsp;&nbsp;&nbsp;- `lib/supabase/types/index.ts`: FoodTruck, MenuItem, ScrapingJob, MenuCategory, OperatingHours, DailyOperatingHours
&nbsp;&nbsp;&nbsp;&nbsp;- `lib/types.ts`: Same interfaces (canonical source)
&nbsp;&nbsp;&nbsp;&nbsp;- Additional type files: `lib/types.d.ts`, `lib/database.types.ts`

[x] **1.2 Map all TS2709 sites**  
&nbsp;&nbsp;• Run `npx tsc --noEmit` and grep for `TS2709`.  
&nbsp;&nbsp;• Record file + line in table.  
**CCR:** 2/8/2  
**Verify:** ✅ Found 296 TS2709 errors across 83 files  
&nbsp;&nbsp;&nbsp;&nbsp;**Most affected types**: FoodTruck (114 errors), CleanupOperation (2 errors), ScrapingJob (19 errors), StageResult (31 errors)  
&nbsp;&nbsp;&nbsp;&nbsp;**Primary locations**: lib/ (126 errors), components/ (90 errors), app/ (35 errors)

---

### 2 Implementation

[x] **2.1 Consolidate type exports**  
&nbsp;&nbsp;• Move supabase-specific types from `lib/supabase/types/index.ts` into `lib/types.ts` OR re-export them via `export type { … } from '../../types'`.  
&nbsp;&nbsp;• Delete duplicated definitions.  
**CCR:** 5/8/4  
**Verify:** ✅ Converted `lib/supabase/types/index.ts` to re-exports from `lib/types.ts`  
&nbsp;&nbsp;&nbsp;&nbsp;✅ Added missing types (DataProcessingQueue, ApiUsage, QualityCategory, etc.) to main types file  
&nbsp;&nbsp;&nbsp;&nbsp;✅ Types compilation check passes

[ ] **2.2 Create/Update shared type aliases**  
&nbsp;&nbsp;• Add explicit alias `export type CleanupOperationType = CleanupOperation['type'];`.  
&nbsp;&nbsp;• Repeat for other indexed types (e.g., `DailyOperatingHoursType`).  
**CCR:** 3/8/3  
**Verify:** aliases appear in `lib/types.ts`.

[ ] **2.3 Refactor namespace property usage**  
&nbsp;&nbsp;• Replace every `CleanupOperation['type']` with `CleanupOperationType`.  
&nbsp;&nbsp;• Use search/replace; commit per 10 files.  
**CCR:** 4/6/4  
**Verify:** grep for `\['type'\]` returns 0 inside source.

[ ] **2.4 Convert value imports to type-only**  
&nbsp;&nbsp;• For all files importing only interfaces, prepend `type` keyword.  
&nbsp;&nbsp;• ESLint autofix where possible.  
**CCR:** 4/7/4  
**Verify:** `eslint .` passes without `TS1484`.

[ ] **2.5 Update project-wide imports**  
&nbsp;&nbsp;• Ensure every file imports types exclusively from `@/lib/types` (path alias).  
&nbsp;&nbsp;• Remove redundant local copies.  
**CCR:** 5/7/5  
**Verify:** grep `from '@/lib/supabase/types'` returns 0.

---

### 3 Post-Change Verification

[ ] **3.1 Compile** – `npm run build:action`  
**CCR:** 0/10/4  
**Verify:** exits with 0.

[ ] **3.2 Static checks**  
&nbsp;&nbsp;• `npx tsc --noEmit`  
&nbsp;&nbsp;• `npx eslint .`  
&nbsp;&nbsp;• `npx jscpd .`  
**CCR:** 1/10/3  
**Verify:** All pass.

[ ] **3.3 Action dry-run**  
&nbsp;&nbsp;• `node dist/actions/github-action-scraper.js --dry-run`  
**CCR:** 1/9/2  
**Verify:** finishes without errors.

---

### 4 Documentation & Cleanup

[ ] **4.1 Update CHANGELOG**  
&nbsp;&nbsp;• Note consolidation & TS2709 fix.  
**CCR:** 1/9/1

[ ] **4.2 Remove temporary TODO comments**  
**CCR:** 1/9/1

---

*Created 2025-07-23 as part of Namespace Import Remediation.*

