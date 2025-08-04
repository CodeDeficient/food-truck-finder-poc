# WBS: Admin Routes Dynamic Rendering & Prerender Safety

Preamble
This WBS enforces SSR-only rendering for admin routes that access dynamic APIs (cookies, headers) or Supabase, preventing Vercel prerender from invoking external services during build. It follows Next.js SOTA guidance (dynamic = 'force-dynamic', PPR as optional) and project .clinerules (ESM import hygiene, env handling, zero-trust verification).

CCR Scale: Complexity (C), Clarity (C), Risk (R) — target C ≤ 4, Clarity ≥ 8, Risk ≤ 3.

1.0 Scope Confirmation
- [x] 1.1 Identify admin routes requiring SSR
  - Paths: /admin/analytics, /admin/data-quality, /admin/events, /admin/users (and any other admin pages that read cookies/sessions or Supabase).
  - CCR: C:2, Clarity:9, Risk:2
  - Verification: List all matching pages: app/admin/**/page.tsx

- [x] 1.2 Confirm Supabase usage in admin routes
  - Verify these pages read server-only data or use Supabase services.
  - CCR: C:2, Clarity:9, Risk:2
  - Verification: Grep for supabase imports and server-only APIs in these pages.

2.0 Route-Level Dynamic Rendering (SSR-Only)
- [x] 2.1 Add route segment configuration for dynamic rendering
  - At top of each admin page file: `export const dynamic = 'force-dynamic'`
  - Files (example): 
    - app/admin/analytics/page.tsx
    - app/admin/data-quality/page.tsx
    - app/admin/events/page.tsx
    - app/admin/users/page.tsx
    - app/admin/food-trucks/page.tsx
    - app/admin/food-trucks/[id]/page.tsx
    - app/admin/pipeline/page.tsx
  - CCR: C:2, Clarity:10, Risk:2
  - Verification:
    - tsc: no new TS errors
    - eslint: no issues introduced
    - Confirm files compile and export const is recognized.

- [x] 2.2 Remove static-only constructs if present
  - Do not use `generateStaticParams` for these admin pages.
  - Avoid `revalidate` for pages requiring true per-request SSR unless explicitly desired.
  - CCR: C:3, Clarity:9, Risk:3
  - Verification: No static generation bailouts in build; pages no longer attempt SSG.

3.0 Metadata/ViewPort Dynamic Safety (If used)
- [x] 3.1 Audit generateMetadata/generateViewport
  - If these functions access cookies/headers/uncached fetch, they must be dynamic.
  - Options:
    - Keep 2.0’s `force-dynamic` at route-level (preferred for admin).
    - OR add a DynamicMarker (connection() in Suspense) to mark dynamic metadata while allowing a static shell.
  - CCR: C:4, Clarity:8, Risk:3
  - Verification: No metadata/viewport prerender errors; build succeeds.

4.0 Client-Only Components Hygiene
- [x] 4.1 Wrap browser-only components
  - For components that use `window`/`document` or browser APIs:
    - `const ClientOnly = dynamic(() => import('./ClientOnly'), { ssr: false })`
  - CCR: C:3, Clarity:9, Risk:2
  - Verification: No prerender errors tied to browser APIs.

5.0 Supabase Usage Hygiene
- [x] 5.1 Server-only imports
  - Ensure admin pages import server-only Supabase code; no client-side exposure of service keys.
  - CCR: C:3, Clarity:9, Risk:3
  - Verification: No accidental client imports of server modules; env access only on server.

- [x] 5.2 ESM import best practices
  - Respect `.clinerules/esm-import-best-practices.md`:
    - No directory imports; explicit `.js` in compiled/ESM contexts.
  - CCR: C:3, Clarity:9, Risk:3
  - Verification: Build resolves imports; no ERR_UNSUPPORTED_DIR_IMPORT or module-not-found.

6.0 Optional: Partial Prerendering (PPR) for Admin Shells
- [ ] 6.1 Consider PPR incrementally
  - If desired later, keep admin shell static with dynamic islands behind Suspense.
  - Requires `experimental.ppr = 'incremental'` in next.config.
  - CCR: C:4, Clarity:8, Risk:3
  - Verification: Shell prerenders; dynamic parts postpone correctly; no caught-error messages.

7.0 Zero-Trust Verification Checkpoint
- [x] 7.1 TypeScript
  - Run: `npx tsc --noEmit`
  - CCR: C:1, Clarity:10, Risk:1
  - Verification: 0 new TS errors.

- [x] 7.2 ESLint
  - Run: `npx eslint . --max-warnings=0`
  - CCR: C:1, Clarity:10, Risk:1
  - Verification: 0 errors, 0 warnings.

- [x] 7.3 jscpd (duplication)
  - Run: `npx jscpd .`
  - CCR: C:1, Clarity:10, Risk:1
  - Verification: No new duplication violations.

- [ ] 7.4 Vercel build sanity check
  - Push branch and confirm:
    - No GitHub Action scripts invoked during Vercel build.
    - No Supabase null dereference or static bailout errors in prerender.
  - CCR: C:2, Clarity:9, Risk:2
  - Verification: Build logs clean; admin pages render at runtime.

Appendix: Implementation Notes
- Next.js dynamic control:
  - `export const dynamic = 'force-dynamic'` ensures per-request SSR.
  - Use `dynamic(() => import(...), { ssr: false })` for browser-only components.
  - Avoid accessing env/server-only APIs in code that can reach client.
- Supabase:
  - NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY for client; service role strictly server-side.
  - Keep imports consistent and .js extensions where ESM requires.
- Escalation path:
  - If builds still attempt SSG on admin routes, audit for static markers (generateStaticParams, `use cache` on top-level) and remove or isolate.


### Phase 2: Duplication Remediation & jscpd Configuration

- **[ ] 8.0: Configure jscpd for SLOC-Only Detection**
  - **Objective:** Configure jscpd to detect only source lines of code, excluding build artifacts, documentation, and configuration files
  - **CCR:** C:3, C:8, R:2
  - **Verification:** Run `npx jscpd .` and confirm no false positives from dist/, docs/, or .md files appear in report

  - **[ ] 8.1: Update .jscpd.json Configuration**
    - **Guidance:** Add exclusions for `**/dist/**`, `**/jscpd-report/**`, and ensure `gitignore: true` is working properly
    - **CCR:** C:2, C:9, R:1
    - **Verification:** Check `.jscpd.json` contains proper exclusions and test with `npx jscpd . --dry-run`

  - **[ ] 8.2: Create Focused jscpd Config for Source Code**
    - **Guidance:** Create `.jscpd-source.json` targeting only `lib/`, `app/`, `components/`, and `hooks/` directories
    - **CCR:** C:2, C:8, R:1
    - **Verification:** Run `npx jscpd . --config .jscpd-source.json` and confirm only source code duplication is detected

- **[ ] 9.0: Address High-Impact Duplication Issues**
  - **Objective:** Resolve the most critical duplication cases identified in jscpd reports
  - **CCR:** C:4, C:7, R:3
  - **Verification:** Re-run jscpd and confirm overall duplication percentage drops below 15%

  - **[ ] 9.1: Consolidate GitHub Action Scripts**
    - **Error:** 45.51% duplication between `scripts/github-action-scraper.js` and `.github/actions/scrape/src/actions/github-action-scraper.js`
    - **Guidance:** Create single source in `scripts/` and have GitHub Action import/reference it rather than duplicate
    - **CCR:** C:3, C:9, R:2
    - **Verification:** Run `npx jscpd . --config .jscpd-github-actions.json` and confirm no duplication between these files

  - **[ ] 9.2: Resolve lib/data-quality/duplicatePrevention Duplication**
    - **Error:** Multiple duplicated implementations between `lib/` and `dist/lib/` versions
    - **Guidance:** Ensure build artifacts in `dist/` are properly excluded from jscpd scans
    - **CCR:** C:2, C:8, R:1
    - **Verification:** Confirm `dist/` exclusion works and no lib vs dist duplicates appear in reports

  - **[ ] 9.3: Consolidate Pipeline Helper Functions**
    - **Error:** Significant duplication in `lib/pipeline/pipelineHelpers.js` 
    - **Guidance:** Extract common functions into shared utilities and update imports across pipeline files
    - **CCR:** C:4, C:7, R:3
    - **Verification:** Run targeted jscpd on `lib/pipeline/` directory and confirm duplication reduced

- **[ ] 10.0: Establish Duplication Prevention Workflow**
  - **Objective:** Create automated prevention of future duplication through CI/CD integration
  - **CCR:** C:3, C:8, R:2
  - **Verification:** New PR triggers fail if duplication percentage exceeds threshold

  - **[ ] 10.1: Add jscpd to Pre-commit Hooks**
    - **Guidance:** Update `.husky/pre-commit` to run jscpd check and fail if duplication exceeds 10%
    - **CCR:** C:2, C:8, R:2
    - **Verification:** Make test commit with duplicate code and confirm pre-commit hook prevents commit

  - **[ ] 10.2: Create Duplication Monitoring Dashboard**
    - **Guidance:** Add jscpd results to existing admin dashboard showing duplication trends over time
    - **CCR:** C:4, C:6, R:2
    - **Verification:** Admin dashboard displays current duplication percentage and historical trend graph

  - **[ ] 10.3: Document Duplication Prevention Guidelines**
    - **Guidance:** Update `.clinerules/` with specific anti-duplication patterns and refactoring guidelines
    - **CCR:** C:2, C:9, R:1
    - **Verification:** New rule file exists and follows WBS task breakdown format from existing .clinerules files
