# Duplication Remediation Guide

## Current Issue: Large-Scale Duplication (435+ Changes)

The project is currently experiencing significant code duplication and a large number of changes due to the mixed nature of the codebase and build processes. Here's a detailed breakdown of the issues and solutions.

### Root Causes of Duplication

1. **Mixed Module Systems**
   - Next.js web application
   - Node.js ESM modules for GitHub Actions
   - Shared utilities being compiled multiple times

2. **Multiple Build Targets**
   - Next.js compilation generates one set of files
   - TypeScript compilation for Actions generates another set
   - Both processes transform the same source files differently

3. **Import Resolution Conflicts**
   - Next.js uses path aliases (`@/*`)
   - Node.js ESM requires `.js` extensions
   - Different module resolution strategies cause duplicate outputs

### Impact on /dist Directory

The `/dist` directory has become bloated because:
- Files are being compiled twice for different targets
- Each compilation process handles imports differently
- Shared code is duplicated with different import statements

## Work Breakdown Structure (WBS) Checklist

### Phase 1: Analysis and Prioritization
- [x] Read `jscpd-report/jscpd-report.json` to identify all duplicate code instances
- [x] Categorize duplicates (e.g., UI components, utility functions, hooks, interfaces)
- [x] Prioritize fixes based on file timestamps (newer files take precedence)

### Phase 2: Implementation
- [x] **Refactor `RealtimeMetrics` interface:**
  - [x] Move `RealtimeMetrics` interface to `lib/types.ts`.
  - [x] Update imports in `lib/api/admin/realtime-events/handlers.ts` to use `lib/types.ts`.
  - [x] Empty content of `lib/api/admin/scraping-metrics/types.ts`.
  - [x] Empty content of `lib/api/admin/realtime-events/types.ts`.
- [x] **Refactor `verifyAdminAccess` function:**
  - [x] Create `lib/auth/authHelpers.ts` and move `verifyAdminAccess` function into it.
  - [x] Update imports in `lib/api/admin/realtime-events/handlers.ts` to use `lib/auth/authHelpers.ts`.
  - [x] Update imports in `lib/api/admin/data-quality/handlers.ts` to use `lib/auth/authHelpers.ts`.
  - [x] Update imports in `lib/api/admin/automated-cleanup/handlers.ts` to use `lib/auth/authHelpers.ts`.
  - [x] Update imports in `app/api/admin/cron-status/route.ts` to use `lib/auth/authHelpers.ts`.
  - [x] Update imports in `app/api/admin/realtime-events/route.ts` to use `lib/auth/authHelpers.ts`.
  - [x] Update imports in `app/api/admin/automated-cleanup/route.ts` to use `lib/auth/authHelpers.ts`.
- [x] **Centralize API error handling:**
  - [x] Create `lib/utils/apiHelpers.ts` with a `handleErrorResponse` function.
  - [x] Replace duplicate error handling in `app/api/trucks/route.ts` with calls to `handleErrorResponse`.
  - [x] Replace duplicate error handling in `app/api/gemini/route.ts` with calls to `handleErrorResponse`.
- [x] **Remove duplicate SQL schema:**
  - [x] Empty content of `supabase/migrations/010_create_discovered_urls_table.sql`.
- [x] **Remove duplicate CSS:**
  - [x] Empty content of `app/globals.css`.
- [x] **Remove duplicate `UseToast.ts`:**
  - [x] Empty content of `components/ui/UseToast.ts`.
- [x] **Remove duplicate `UseMobile.tsx`:**
  - [x] Empty content of `components/ui/UseMobile.tsx`.
- [x] **Remove duplicate `menubar.tsx`:**
  - [x] Empty content of `components/ui/menubar.tsx`.
- [x] **Remove duplicate `ContactField.tsx`:**
  - [x] Empty content of `components/admin/food-trucks/detail/ContactField.tsx`.
- [x] **Remove duplicate `ContactInfoCard.tsx`:**
  - [x] Empty content of `components/admin/food-trucks/detail/ContactInfoCard.tsx`.
- [x] **Remove duplicate `SocialMediaLinks.tsx`:**
  - [x] Empty content of `components/admin/food-trucks/detail/SocialMediaLinks.tsx`.
- [x] **Remove duplicate `TruckAccordionContent.tsx`:**
  - [x] Empty content of `components/home/TruckAccordionContent.tsx`.
- [x] **Refactor `AdminNavLinks.tsx`:**
  - [x] Refactor `components/admin/AdminNavLinks.tsx` to use a `navItems` array for rendering links.

### Phase 3: Verification and Documentation
- [ ] Re-run `jscpd` to confirm no new clones are introduced.
- [ ] Run `npx eslint . --fix` to ensure type safety and compliance with `GEMINI.md` rules.
- [ ] Document all changes in this guide.