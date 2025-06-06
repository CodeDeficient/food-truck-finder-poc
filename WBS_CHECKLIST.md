# Work Breakdown Structure (WBS) Checklist for Food Truck Finder Web App Enhancements

This checklist provides a detailed Work Breakdown Structure (WBS) for all planned enhancements to the Food Truck Finder web application. It is designed to be self-explanatory, allowing for clear progress tracking and task management.

## Introduction

This document outlines the tasks required to implement the planned improvements. Each task is broken down into smaller, actionable sub-tasks. Checkboxes are provided for tracking completion.

## Phases and Tasks

### Phase 1: Foundation & Core User-Facing Improvements

- **1.1 Create `CODEBASE_RULES.md`**
  - 1.1.1 [x] Create the `CODEBASE_RULES.md` file with initial rules.
- **1.2 Refine Gemini Prompt Engineering**
  - 1.2.1 [x] Analyze current Gemini prompt in `app/api/gemini/route.ts`.
  - 1.2.2 [x] Modify prompt to explicitly omit "food truck" from descriptions.
  - 1.2.3 [x] Modify prompt to encourage specific cuisine types and condensed general food types.
  - 1.2.4 [x] Modify prompt to emphasize a natural, owner-written tone while maintaining consistency.
- **1.3 Implement Price Display**
  - 1.3.1 [x] **Supabase Schema Update:** Add a new column (e.g., `menu_item_prices` as JSONB or a separate `menu_items` table) in Supabase to store explicit price points for menu items.
    - 1.3.1.1 [x] Create new Supabase migration for price schema update.
  - 1.3.2 [x] **Backend Logic Update:** Update `app/api/trucks/[id]/route.ts` (or relevant API endpoint) to fetch and process explicit prices.
  - 1.3.3 [x] **Frontend Logic Update:** Modify `components/truck-card.tsx` (or related components) to:
    - 1.3.3.1 [x] Prioritize displaying explicit prices if available.
    - 1.3.3.2 [x] Implement a fallback mechanism to dynamically display price ranges (e.g., '$-$$-$$$') when explicit prices are not present.
- **1.4 UI/UX Improvement: Unified Food Truck Info Card**
  - 1.4.1 [x] Identify the components responsible for the food truck list (`components/truck-card.tsx` and potentially `app/page.tsx` or a parent component) and the expanded detail element.
  - 1.4.2 [x] Refactor these into a single, unified component (e.g., `components/food-truck-info-card.tsx`) that expands/collapses on click/tap.
  - 1.4.3 [x] Ensure the Roti Rolls card correctly triggers the expansion.
- **1.5 Map Pins & Location Display**
  - 1.5.1 [x] Research how to implement custom map markers (food truck icons) in `components/map-display.tsx` using Tavily and Context7.
    - **Research Findings:** Custom Mapbox GL JS markers in React can be implemented by creating an HTML element (e.g., a `div` with a background image or an `img` tag) and passing it to the `mapboxgl.Marker` constructor. For React components, `ReactDOM.render` can be used to render a React component into a DOM element, which then serves as the custom marker.
  - 1.5.2 [x] Implement custom food truck icon pins.
  - 1.5.3 [x] Investigate the absence of a pin for Roti Rolls (likely missing/malformed location data in Supabase).
  - 1.5.4 [x] **Supabase Schema Update:** Update Supabase schema to clearly store `exact_location` (address, lat/lng) and `city_location`.
    - 1.5.4.1 [x] Create new Supabase migration for location schema update.
  - 1.5.5 [x] **Backend Logic Update:** Modify backend logic to prioritize `exact_location` for map pins.
  - 1.5.6 [x] Implement fallback: If `exact_location` is unavailable, use `city_location` for the pin drop.
  - 1.5.7 [x] Display the identified address (exact or city-based) on the food truck card.

### Phase 2: Data Pipeline & Backend Enhancements

- **2.1 Data Pipeline Expansion (Firecrawl/Tavily & Gemini Integration)**
  - 2.1.1 [x] Determine the best tool (Firecrawl `search` or `crawl`, or Tavily `search`/`crawl`) to locate food truck webpages in SC.
    - **Research Findings:** Firecrawl's `crawl` and `scrape` capabilities are well-suited for this. The strategy will involve:
      1.  **Initial Search:** Use Firecrawl's `search` (or Tavily's `tavily-search`) with queries like "South Carolina food truck association," "SC food truck directory," etc., to find lists or directories.
      2.  **Crawl/Scrape Directories:** Use Firecrawl's `crawl` or `scrape` to extract individual food truck URLs from identified directories.
      3.  **Scrape Individual Food Truck Sites:** Use Firecrawl's `scrape` for each food truck URL to extract detailed information (description, menu, prices, locations, events).
  - 2.1.2 [x] Develop a robust scraping strategy to identify relevant information (description, menu, prices, locations, events).
  - 2.1.3 [x] Implement rate limiting and caching mechanisms in `app/api/auto-scrape-initiate/route.ts` and `lib/autoScraper.ts` to ensure Gemini API calls stay within the free tier.
  - 2.1.4 [x] Ensure scraped data is correctly mapped and inserted into the Supabase database, including new price and location fields.
  - 2.1.5 [x] Integrate the refined Gemini prompt into the pipeline for generating unique, fact-based descriptions from scraped content.
  - 2.1.6 [x] **Data Automation at Scale:** Implement a mechanism for the app to automatically discover and scrape new food truck URLs without manual input, adhering to rate limits. This will involve scheduled tasks and intelligent URL discovery.
    - **Research Findings & Workflow:** Firecrawl's `crawl` endpoint is designed for automated, large-scale web scraping.
      1.  **Seed URL Identification:** Start with initial seed URLs from known South Carolina food truck directories, associations (as identified in 2.1.1), or general search results.
      2.  **Recursive Crawling with Firecrawl:** Utilize Firecrawl's `crawl` tool to recursively traverse these seed URLs, discovering new food truck websites.
          - Configure `maxDepth` and `limit` parameters to control the crawl scope and adhere to Firecrawl's usage limits.
          - Use `includePaths` and `excludePaths` to focus the crawl on relevant sections (e.g., "about," "menu," "schedule," "locations") and avoid irrelevant pages.
      3.  **Intelligent URL Filtering/Discovery:** After the initial crawl, process the discovered URLs to identify actual food truck websites versus general listings. This may involve:
          - Regex matching on URLs for keywords like "foodtruck," "catering," "menu."
          - Scraping meta descriptions or page titles for confirmation.
          - Leveraging Firecrawl's `extract` tool with a schema to identify key entities on a page that confirm it's a food truck.
      4.  **Scheduled Execution:** Integrate the automated scraping process with a scheduler (e.g., using `app/api/scheduler/route.ts` or a cron job on the server) to run periodically (initially daily, eventually weekly).
      5.  **Rate Limiting & Caching:**
          - Rely on Firecrawl's built-in rate limiting and exponential backoff for its API calls.
          - Implement application-level caching (`lib/autoScraper.ts`) for Gemini API calls and scraped content to minimize redundant requests and stay within free tier limits.
          - Track API usage to dynamically adjust crawl frequency or depth if approaching limits.
      6.  **Data Ingestion & Deduplication:** Ensure newly discovered and scraped data is robustly ingested into the Supabase database. Implement logic to prevent duplicate entries for the same food truck, potentially using a unique identifier (e.g., website URL, business name).
          - **Data Mapping:** Define clear mapping rules from scraped data fields to Supabase table columns.
          - **Validation:** Implement data validation checks before ingestion to ensure data integrity and consistency (e.g., correct data types, non-null constraints for critical fields).
          - **Upsert Logic:** Use Supabase's upsert functionality (insert or update if exists) based on a unique identifier (e.g., `website_url` or a generated `food_truck_id`) to handle new entries and updates to existing ones.
          - **Conflict Resolution:** Define strategies for resolving data conflicts if multiple sources provide conflicting information for the same food truck.
          - **Error Handling:** Implement robust error handling for ingestion failures, logging issues, and potentially retrying failed insertions.
      7.  **Real-time Updates (Webhooks/Monitoring):** Implement a mechanism (e.g., webhooks, continuous monitoring, or change detection) for specific food truck webpages to detect and automatically update the database as soon as their schedule, events, menu items, or other relevant information changes.
- **2.2 Data Quality Percentage Management**
  - 2.2.1 [x] Identify where the data quality percentage is calculated and displayed in the frontend (`components/truck-card.tsx` or similar).
  - 2.2.2 [x] Remove data quality percentage from user-facing UI (only show in backend/admin dashboard).
  - 2.2.3 [x] Ensure the calculation remains on the backend or is moved to the admin dashboard logic.

### Phase 3: Advanced Features & Infrastructure

- **3.1 Admin Dashboard Development**
  - 3.1.1 [x] Conduct deep research into State-of-the-Art (SOTA) best practices for admin dashboards (security, separation of concerns, maintainability) using `tavily-search`.
    - **Research Findings:**
      - **Security:** Emphasize robust access control; consider separate deployments or sub-domains for enhanced security (e.g., keeping admin panels separate from public-facing apps).
      - **Separation of Concerns (SoC):** Crucial for modularity, maintainability, and scalability. Admin functionalities should be clearly separated from core user-facing logic.
      - **Design/Maintainability:** Focus on clear information hierarchy, simplicity, effective data visualization, responsiveness, and performance.
  - 3.1.2 [x] Propose architecture for the admin dashboard (integrated /admin route with robust access control; see app/admin/README.md for details and implementation plan; see app/admin/DASHBOARD_PLAN.md for full SOTA plan and features reference; implementation deferred, will leverage Vercel's best practices and tools).
  - 3.1.3 [ ] Implement robust authentication and authorization (e.g., Supabase RLS, custom roles) to restrict access to admin functionalities. (Implementation deferred; will use Supabase Auth, RLS, and custom roles as detailed in app/admin/DASHBOARD_PLAN.md)
  - 3.1.4 [ ] Implement core admin functionalities (see app/admin/DASHBOARD_PLAN.md for full feature list and implementation plan; implementation deferred to dashboard buildout):
    - 3.1.4.1 [ ] View/Edit food truck data (descriptions, prices, locations, menu items).
    - 3.1.4.2 [ ] Monitor pipeline status and logs.
    - 3.1.4.3 [ ] Manage data quality scores.
    - 3.1.4.4 [ ] Trigger manual scrapes/updates.
- **3.2 Event Calendar & Monetization Features**
  - 3.2.1 [ ] Examine existing calendar components (`components/ui/calendar.tsx`) or research integration of a new one. (Implementation deferred; will reference app/admin/DASHBOARD_PLAN.md for event/calendar features.)
  - 3.2.2 [x] **Supabase Schema Update:** Add tables for `events` (date, time, location, description) and `food_truck_schedules` (active days, recurring events).
    - 3.2.2.1 [x] Create new Supabase migration for event/schedule schema update.
  - 3.2.3 [x] **Backend/Frontend Integration:** Display active days (grey out inactive) and an "Upcoming Events" section on the expanded food truck card.
  - 3.2.4 [x] **"Book Me" Button (Future Monetization):**
    - 3.2.4.1 [x] Add a "Book Me" button to verified food trucks.
    - 3.2.4.2 [x] Initial implementation will be a placeholder, with future development for booking functionality.

## Cross-Cutting Concerns (Ongoing Throughout All Phases)

- **4.1 E2E Unit Testing:**

  - 4.1.1 [x] Install and configure `browser-tools-mcp` for local browser debugging.
  - 4.1.2 [x] Document `browser-tools-mcp` usage in `README.md`.
  - 4.1.3 [x] Use Context7 MCP to verify SOTA for E2E testing in Next.js/Vercel projects (Playwright is SOTA, see README for details).
  - 4.1.4 [x] Install Playwright (`pnpm add -D @playwright/test`) and run `npx playwright install` **after browser-tools-mcp workflow is validated**.
  - 4.1.5 [x] Scaffold `/tests` directory with sample E2E tests (login, dashboard, CRUD, pipeline monitoring).
  - 4.1.6 [x] Add `test:e2e` script to `package.json`.
  - 4.1.7 [x] Update CI config to run E2E tests on PRs and deploys.
  - 4.1.8 [x] Ensure Jest is installed and configured for TypeScript.
  - 4.1.9 [x] Add/expand Jest unit tests for `lib/autoScraper.ts`, `lib/gemini.ts`, `lib/pipelineProcessor.ts`.
  - 4.1.10 [x] Add `test:coverage` script to `package.json` and update CI to report coverage.

- **4.2 Regular Reminders:**

  - 4.2.1 [x] Install Husky (`pnpm add -D husky`).
  - 4.2.2 [x] Set up pre-commit hook to check for codebase rules (lint, format, or custom script).
  - 4.2.3 [x] Document hook usage in `README.md`.
  - 4.2.4 [x] Schedule a monthly/quarterly review of `CODEBASE_RULES.md`.
  - 4.2.5 [x] Use Context7 MCP to check for new SOTA coding standards.

- **4.3 Risk Mitigation:**

  - 4.3.1 [x] Create `RISKS.md` or add a section to `README.md` for risk register.
  - 4.3.2 [x] List all known risks (API limits, data quality, security, performance, scalability, deployment, maintainability).
  - 4.3.3 [x] For each risk, document description, likelihood, impact, mitigation, and owner.
  - 4.3.4 [x] Use Context7 MCP to verify SOTA mitigation strategies for each risk.
  - 4.3.5 [x] Implement in-memory or persistent caching for API results.
  - 4.3.6 [x] Use Zod or Yup for API/form input validation.
  - 4.3.7 [x] Integrate Vercel Analytics, Supabase logs, and Sentry for monitoring.
  - 4.3.8 [x] Set up Vercel/Supabase alerts for deploy failures, API errors, or quota breaches.

- **4.4 Hardcoded Secrets:**

  - 4.4.1 [x] Audit `.env`, codebase, and config for secrets.
  - 4.4.2 [x] (Manual) Move all secrets to Vercel environment variables or Supabase Vault.
  - 4.4.3 [x] Remove hardcoded secrets from codebase.
  - 4.4.4 [x] Add a section to `README.md` on secret management and update process.

- **4.5 Linters:**
  - 4.5.1 [x] Use Context7 MCP to verify SOTA ESLint/Prettier config for Next.js/TypeScript.
  - 4.5.2 [x] Ensure `.eslintrc` and `.prettierrc` are present and configured.
  - 4.5.3 [x] Add `lint` and `format` scripts to `package.json`.
  - 4.5.4 [x] Add Husky pre-commit hook for lint/format.
  - 4.5.5 [x] Install and configure recommended ESLint plugins (e.g., `eslint-plugin-sonarjs`, `eslint-plugin-unicorn`).
  - 4.5.6 [x] Use Context7 MCP to verify SOTA plugin recommendations.
  - 4.5.7 [x] Schedule code reviews for maintainability and refactoring.
  - 4.5.8 [x] Perform initial code review for maintainability, readability, and adherence to standards.
