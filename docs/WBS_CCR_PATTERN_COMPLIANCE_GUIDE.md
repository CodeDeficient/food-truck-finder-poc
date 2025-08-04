# WBS CCR Pattern Compliance Guide

## Objective
Ensure all remaining project tasks follow the established Work Breakdown Structure (WBS) pattern with Complexity, Clarity, Risk (CCR) ratings ≤ 4 and explicit verification commands including jscpd, eslint, and tsc.

## Required Pattern for All Tasks

Every task must include:
1. **CCR Rating**: C:X, C:Y, R:Z (where all values ≤ 4)
2. **Detailed Guidance**: Specific, actionable instructions
3. **Explicit Verification**: Including tsc, eslint, jscpd commands

---

## REMAINING TASKS REQUIRING CCR PATTERN

### 1. TypeScript Namespace Import Remediation (WBS_TypeNamespaceFix.md)

**Current Status**: Partially complete (2.1 done, 2.2-4.2 need CCR compliance)

#### Missing CCR Pattern Applications:

- **[ ] 2.2: Create/Update shared type aliases**
  - **Guidance**: Add explicit type aliases in `lib/types.ts` for indexed properties:
    ```typescript
    export type CleanupOperationType = CleanupOperation['type'];
    export type DailyOperatingHoursType = DailyOperatingHours['type'];
    export type ScrapingJobStatus = ScrapingJob['status'];
    ```
  - **CCR**: C:3, C:8, R:3
  - **Verification Commands**:
    - `npx tsc --noEmit` - Confirm no TS2709 namespace errors
    - `npx eslint lib/types.ts` - Verify export syntax
    - `npx jscpd .` - Confirm no duplication introduced

- **[ ] 2.3: Refactor namespace property usage**
  - **Guidance**: Replace bracket notation with type aliases across codebase:
    ```bash
    find . -name "*.ts" -o -name "*.tsx" | xargs sed -i "s/CleanupOperation\['type'\]/CleanupOperationType/g"
    ```
  - **CCR**: C:4, C:6, R:4
  - **Verification Commands**:
    - `grep -r "\['type'\]" --include="*.ts" --include="*.tsx" src/` - Should return 0 results
    - `npx tsc --noEmit` - Confirm compilation success
    - `npx eslint .` - Verify no new linting errors

- **[ ] 2.4: Convert value imports to type-only**
  - **Guidance**: Add `type` keyword to interface-only imports:
    ```typescript
    // Before: import { FoodTruck } from '@/lib/types'
    // After: import type { FoodTruck } from '@/lib/types'
    ```
  - **CCR**: C:4, C:7, R:4
  - **Verification Commands**:
    - `npx eslint . --fix` - Auto-fix type-only imports where possible
    - `npx tsc --noEmit` - Confirm no TS1484 errors
    - `npx jscpd .` - Verify no code duplication

- **[ ] 2.5: Update project-wide imports**
  - **Guidance**: Standardize all type imports to use `@/lib/types` path alias
  - **CCR**: C:4, C:7, R:4
  - **Verification Commands**:
    - `grep -r "from '@/lib/supabase/types'" . --include="*.ts" --include="*.tsx"` - Should return 0
    - `npx tsc --noEmit` - Verify compilation
    - `npx eslint .` - Check import consistency

#### Remaining Verification Tasks (Need CCR Pattern):

- **[ ] 3.3: Action dry-run**
  - **Guidance**: Test GitHub Action script compilation after type changes
  - **CCR**: C:1, C:9, R:2
  - **Verification Commands**:
    - `node dist/actions/github-action-scraper.js --dry-run` - Confirm no runtime errors
    - `npx tsc --noEmit` - Verify types compile
    - `npx jscpd .` - Check for action script duplication

- **[ ] 4.1: Update CHANGELOG**
  - **Guidance**: Document namespace import consolidation and TS2709 fixes
  - **CCR**: C:1, C:9, R:1
  - **Verification Commands**:
    - `grep -i "namespace\|TS2709" CHANGELOG.md` - Confirm entry exists
    - `npx eslint CHANGELOG.md` - Check markdown formatting
    - `npx jscpd .` - Verify no documentation duplication

- **[ ] 4.2: Remove temporary TODO comments**
  - **Guidance**: Clean up development artifacts from namespace refactoring
  - **CCR**: C:1, C:9, R:1
  - **Verification Commands**:
    - `grep -r "TODO.*namespace\|FIXME.*TS2709" . --include="*.ts" --include="*.tsx"` - Should return 0
    - `npx tsc --noEmit` - Ensure no orphaned references
    - `npx eslint .` - Check code cleanliness

### 2. Admin Dynamic Rendering WBS (WBS_ADMIN_DYNAMIC_RENDERING_CHECKLIST.md)

**Current Status**: Most tasks complete, Phase 2 duplication remediation needs CCR compliance

#### Duplication Remediation Tasks Needing CCR Pattern:

- **[ ] 8.1: Update .jscpd.json Configuration**
  - **Guidance**: Configure jscpd to exclude build artifacts and docs:
    ```json
    {
      "ignore": ["**/dist/**", "**/jscpd-report/**", "**/*.md", "**/docs/**"],
      "gitignore": true,
      "threshold": 10
    }
    ```
  - **CCR**: C:2, C:9, R:1
  - **Verification Commands**:
    - `npx jscpd . --dry-run` - Test configuration without generating report
    - `npx eslint .jscpd.json` - Verify JSON syntax
    - `npx tsc --noEmit` - Ensure no config impacts compilation

- **[ ] 8.2: Create Focused jscpd Config for Source Code**
  - **Guidance**: Create `.jscpd-source.json` targeting only source directories
  - **CCR**: C:2, C:8, R:1
  - **Verification Commands**:
    - `npx jscpd . --config .jscpd-source.json` - Test source-only scanning
    - `test -f .jscpd-source.json` - Confirm file exists
    - `npx jscpd .` - Compare with default config results

- **[ ] 9.1: Consolidate GitHub Action Scripts**
  - **Guidance**: Remove duplication between `scripts/github-action-scraper.js` and `.github/actions/scrape/src/actions/github-action-scraper.js`
  - **CCR**: C:3, C:9, R:2
  - **Verification Commands**:
    - `npx jscpd scripts/ .github/` - Confirm duplication eliminated
    - `npx tsc --noEmit` - Verify action scripts compile
    - `npx eslint scripts/ .github/` - Check consolidated code quality

- **[ ] 9.2: Resolve lib/data-quality/duplicatePrevention Duplication**
  - **Guidance**: Ensure build artifacts in `dist/` are excluded from jscpd scans
  - **CCR**: C:2, C:8, R:1
  - **Verification Commands**:
    - `npx jscpd lib/` - Confirm no lib vs dist duplicates
    - `test ! -d dist/` - Verify dist exclusion during dev
    - `npx tsc --build --clean && npx tsc --build` - Test clean build

- **[ ] 9.3: Consolidate Pipeline Helper Functions**
  - **Guidance**: Extract common functions from `lib/pipeline/pipelineHelpers.js` into shared utilities
  - **CCR**: C:4, C:7, R:3
  - **Verification Commands**:
    - `npx jscpd lib/pipeline/` - Target pipeline directory specifically
    - `npx tsc --noEmit` - Verify refactored imports work
    - `npx eslint lib/pipeline/` - Check extracted utilities

- **[ ] 10.1: Add jscpd to Pre-commit Hooks**
  - **Guidance**: Update `.husky/pre-commit` to include duplication check
  - **CCR**: C:2, C:8, R:2
  - **Verification Commands**:
    - `npx jscpd . --threshold=10 --exitCode=1` - Test threshold enforcement
    - `git add . && git commit -m "test" --dry-run` - Test pre-commit hook
    - `test -x .husky/pre-commit` - Verify hook is executable

- **[ ] 10.2: Create Duplication Monitoring Dashboard**
  - **Guidance**: Add jscpd metrics to admin dashboard
  - **CCR**: C:4, C:6, R:2
  - **Verification Commands**:
    - `curl http://localhost:3000/admin/dashboard | grep -i "duplication"` - Test dashboard integration
    - `npx tsc --noEmit` - Verify dashboard components compile
    - `npx eslint app/admin/` - Check admin dashboard code quality

- **[ ] 10.3: Document Duplication Prevention Guidelines**
  - **Guidance**: Create comprehensive anti-duplication rules in `.clinerules/`
  - **CCR**: C:2, C:9, R:1
  - **Verification Commands**:
    - `test -f .clinerules/duplication-prevention.md` - Verify guideline file exists
    - `npx eslint .clinerules/` - Check markdown formatting
    - `npx jscpd .clinerules/` - Ensure guidelines don't duplicate existing rules

### 3. Project Plan CRON Job Investigation (PROJECT_PLAN.md)

**Current Status**: Critical CRON job issues identified, need structured CCR approach

#### CRON Job Debugging Tasks Needing CCR Pattern:

- **[ ] 4.1: Check Vercel Function Logs**
  - **Guidance**: Access Vercel dashboard function logs for auto-scrape and quality-check endpoints, focusing on timeout/memory errors
  - **CCR**: C:2, C:9, R:3
  - **Verification Commands**:
    - `curl -X POST https://your-app.vercel.app/api/cron/auto-scrape -H "Authorization: Bearer $CRON_SECRET"` - Manual trigger test
    - `npx tsc --noEmit` - Ensure CRON endpoints compile
    - `npx eslint app/api/cron/` - Check CRON job code quality

- **[ ] 4.2: Investigate RLS Policies**
  - **Guidance**: Check if Row Level Security blocks service role operations on food_trucks and scraping_jobs tables
  - **CCR**: C:3, C:8, R:4
  - **Verification Commands**:
    - Query Supabase directly: `SELECT * FROM food_trucks LIMIT 1;` using service role
    - `npx tsc --noEmit` - Verify RLS policy types
    - `npx jscpd lib/` - Check for RLS policy duplication

- **[ ] 4.3: Debug Individual Scraping Job**
  - **Guidance**: Create debug endpoint for single scraping job with extensive logging
  - **CCR**: C:4, C:7, R:4
  - **Verification Commands**:
    - `node -e "console.log(require('./lib/pipeline/scrapingProcessor.js').processScrapingJob)"` - Test function export
    - `npx tsc --noEmit` - Verify debug endpoint compiles
    - `npx eslint lib/pipeline/` - Check processing logic quality

- **[ ] 4.4: Check External API Keys**
  - **Guidance**: Verify Firecrawl and Gemini API keys in Vercel environment have sufficient quota
  - **CCR**: C:2, C:8, R:3
  - **Verification Commands**:
    - `curl -H "Authorization: Bearer $FIRECRAWL_API_KEY" https://api.firecrawl.dev/v0/status` - Test Firecrawl auth
    - `npx tsc --noEmit` - Verify API client types
    - `npx eslint lib/api/` - Check API integration code

- **[ ] 4.5: Database Connection Issues**
  - **Guidance**: Test Supabase service role permissions and connection pool limits
  - **CCR**: C:3, C:8, R:4
  - **Verification Commands**:
    - Test connection: `node -e "const { createClient } = require('@supabase/supabase-js'); console.log(createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY))"`
    - `npx tsc --noEmit` - Verify Supabase client types
    - `npx jscpd lib/supabase/` - Check for connection logic duplication

- **[ ] 4.6: Reset Stuck Jobs**
  - **Guidance**: Create script to mark stuck jobs as "failed" and implement retry logic
  - **CCR**: C:3, C:7, R:3
  - **Verification Commands**:
    - `UPDATE scraping_jobs SET status = 'failed' WHERE status = 'running' AND created_at < NOW() - INTERVAL '1 hour';` - Reset stuck jobs
    - `npx tsc --noEmit` - Verify job reset script compiles
    - `npx eslint scripts/` - Check job management scripts

### 4. Project Plan User Feedback System (PROJECT_PLAN.md)

**Current Status**: System entirely missing, needs complete CCR implementation

#### User Feedback Implementation Tasks:

- **[ ] 3.1.1: Create the form UI**
  - **Guidance**: Create `components/feedback/FeedbackForm.tsx` using ShadCN components with fields: name (optional), email (optional), feedback (required)
  - **CCR**: C:2, C:10, R:1
  - **Verification Commands**:
    - `test -f components/feedback/FeedbackForm.tsx` - Verify component exists
    - `npx tsc --noEmit` - Check TypeScript compilation
    - `npx eslint components/feedback/` - Verify component quality

- **[ ] 3.1.2: Implement form state management**
  - **Guidance**: Use `useState` hook for form state management with proper TypeScript types
  - **CCR**: C:2, C:10, R:2
  - **Verification Commands**:
    - `grep -r "useState.*feedback" components/feedback/` - Verify state management
    - `npx tsc --noEmit` - Check type safety
    - `npx eslint components/feedback/` - Verify React hooks usage

- **[ ] 3.2.1: Create the feedback table**
  - **Guidance**: Create Supabase migration with feedback table schema (id uuid, created_at timestamp, name text nullable, email text nullable, feedback text not null)
  - **CCR**: C:2, C:10, R:2
  - **Verification Commands**:
    - `ls supabase/migrations/*feedback*` - Verify migration file exists
    - `npx supabase db diff` - Check migration changes
    - Query Supabase: `\d feedback` - Verify table structure

- **[ ] 3.2.2: Implement the API route for submitting feedback**
  - **Guidance**: Create `app/api/feedback/route.ts` with POST handler, input validation, and Supabase insertion
  - **CCR**: C:3, C:9, R:3
  - **Verification Commands**:
    - `curl -X POST http://localhost:3000/api/feedback -d '{"feedback":"test"}'` - Test API endpoint
    - `npx tsc --noEmit` - Verify API route compiles
    - `npx eslint app/api/feedback/` - Check API route quality

- **[ ] 3.2.3: Connect the form to the API route**
  - **Guidance**: Update FeedbackForm component to POST to /api/feedback with error handling and success feedback
  - **CCR**: C:2, C:10, R:2
  - **Verification Commands**:
    - Test form submission in browser with network tab open
    - `npx tsc --noEmit` - Verify form integration compiles
    - `npx eslint components/feedback/` - Check form submission logic

- **[ ] 3.3.1: Create the feedback page**
  - **Guidance**: Create `app/admin/feedback/page.tsx` with admin authentication check
  - **CCR**: C:2, C:10, R:1
  - **Verification Commands**:
    - `curl http://localhost:3000/admin/feedback` - Test admin access
    - `npx tsc --noEmit` - Verify admin page compiles
    - `npx eslint app/admin/feedback/` - Check admin page quality

- **[ ] 3.3.2: Fetch and display feedback**
  - **Guidance**: Implement feedback fetching from Supabase and display in table format with pagination
  - **CCR**: C:3, C:9, R:2
  - **Verification Commands**:
    - Verify feedback appears in admin dashboard
    - `npx tsc --noEmit` - Check feedback display logic
    - `npx jscpd app/admin/` - Ensure no admin page duplication

### 5. Code Quality Improvements (PROJECT_PLAN.md)

**Current Status**: TruckDetailsModal type safety issues identified, need CCR implementation

#### Type Safety Fix Tasks:

- **[ ] 4.1.1: Remove Unused verification_status Prop**
  - **Guidance**: Remove `verification_status` prop from TruckModalContent interface and all usage sites
  - **CCR**: C:1, C:10, R:1
  - **Verification Commands**:
    - `grep -r "verification_status" components/` - Should return 0 results
    - `npx tsc --noEmit` - Verify no type errors from removal
    - `npx eslint components/` - Check component cleanliness

- **[ ] 4.1.2: Define and Apply Type for todayHours**
  - **Guidance**: Create `TodayHours` type in `lib/types.ts` and apply to TruckModalContent
  - **CCR**: C:2, C:9, R:2
  - **Verification Commands**:
    - `grep -r "todayHours.*any" components/` - Should return 0 results
    - `npx tsc --noEmit` - Verify proper typing
    - `npx eslint lib/types.ts` - Check type definition quality

- **[ ] 4.1.3: Define and Apply Type for popularItems**
  - **Guidance**: Create `PopularItems` type array in `lib/types.ts` and replace any usage
  - **CCR**: C:2, C:9, R:2
  - **Verification Commands**:
    - `grep -r "popularItems.*any" components/` - Should return 0 results
    - `npx tsc --noEmit` - Verify type safety
    - `npx eslint components/` - Check component type usage

- **[ ] 4.1.4: Define and Apply Type for social_media**
  - **Guidance**: Create `SocialMedia` interface in `lib/types.ts` with platform-specific properties
  - **CCR**: C:2, C:9, R:2
  - **Verification Commands**:
    - `grep -r "social_media.*any" components/` - Should return 0 results
    - `npx tsc --noEmit` - Verify social media typing
    - `npx jscpd lib/types.ts` - Check for type duplication

---

## VERIFICATION PROTOCOL FOR ALL TASKS

Every task completion must run these commands in sequence:

### Mandatory Verification Sequence:
1. **TypeScript Compilation**: `npx tsc --noEmit`
2. **Linting**: `npx eslint .`
3. **Duplication Check**: `npx jscpd .`
4. **Build Test**: `npm run build` (when applicable)

### Task-Specific Verification:
- Include task-specific verification commands as documented above
- Verify functional behavior through manual testing or automated tests
- Check database changes through direct queries when applicable

### Success Criteria:
- CCR ratings must be ≤ 4 for Complexity and Risk
- Clarity ratings should be ≥ 8
- All verification commands must pass
- No new errors or warnings introduced

---

## IMPLEMENTATION GUIDELINES

### CCR Rating Standards:
- **Complexity (C)**: 0-4 scale
  - 0-1: Simple configuration/documentation changes
  - 2-3: Code modifications with clear patterns
  - 4: Complex refactoring requiring careful planning
- **Clarity (C)**: 0-10 scale  
  - 8-10: Well-documented with clear guidance
  - 6-7: Adequate documentation
  - <6: Needs more detailed guidance
- **Risk (R)**: 0-4 scale
  - 0-1: No risk of breaking existing functionality
  - 2-3: Moderate risk, needs testing
  - 4: High risk, requires extensive validation

### Task Breakdown Rules:
- Tasks with CCR > 4 must be broken into subtasks
- Each subtask must have explicit verification commands
- Build/compile steps must be verified at each stage
- No task should exceed 2 hours of implementation time

This compliance guide ensures all remaining project work follows the established WBS methodology with proper risk management and verification protocols.
