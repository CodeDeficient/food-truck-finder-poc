# Food Truck Finder - Work Breakdown Structure (WBS) & Roadmap

This document provides a detailed breakdown of all tasks required to improve and enhance the Food Truck Finder application. It serves as our central roadmap for development, tracking progress, and ensuring we adhere to project standards.

---

## 1.0 Project Management & Foundation

- **[ ] 1.1: Establish and Maintain WBS Roadmap**
  - **Guidance:** This task involves the continuous refinement of this WBS document. As we research and complete tasks, we will update the status, add new sub-tasks, and adjust priorities. This document is our single source of truth for the project plan.
  - **CCR:** C:2, C:10, R:1
  - **Verification:** The WBS is regularly updated after each major task completion.

- **[x] 1.2: Review Existing Project Documentation**
  - **Guidance:** Thoroughly read and understand the contents of `supabase_advisor.md` and `supabase_improvement_plan.md` to identify immediate, actionable items recommended by Supabase.
  - **CCR:** C:3, C:9, R:2
  - **Verification:** A summary of key findings from these documents is created and integrated into the relevant sections of this WBS.

- **[ ] 1.3: Enforce Zero-Trust Verification Protocol**
  - **Guidance:** For all subsequent tasks, strictly adhere to the "Zero-Trust Post-Action Verification Protocol." After every 10-15 significant edits, run the holy trinity of checks: `npx tsc --noEmit`, `npx eslint .`, and `npx jscpd .` to ensure we are not introducing new errors.
  - **CCR:** C:3, C:10, R:3
  - **Verification:** Command history and task outputs demonstrate regular execution of these verification checks.

---

## 2.0 Security & Access Control

- **[ ] 2.1: Secure Admin Dashboard**
  - **Guidance:** The `/admin` route and all its sub-routes must be protected. Currently, it's publicly accessible. The goal is to restrict access to a single, authenticated developer user (me).
  - **CCR:** C:7, C:8, R:8
  - **Verification:** Unauthorized users navigating to `/admin` are redirected to a login page or an access denied page. The designated admin user can log in and access the dashboard.
  - **[x] 2.1.1: Research Authentication Provider**
    - **Guidance:** Per user direction, the primary authentication provider will be Google, managed through a service like Firebase Authentication to decouple it from Supabase. Research the integration of Firebase Auth with a Supabase backend. The goal is to use Firebase for sign-in and then pass the user's identity (JWT) to Supabase to control data access via RLS.
    - **CCR:** C:7, C:7, R:7
    - **Verification:** A new document, `docs/AUTH_ARCHITECTURE.md`, is created detailing the chosen implementation strategy.
  - **[x] 2.1.2: Research Role-Based Access Control (RBAC) with External JWT**
    - **Guidance:** Investigate best practices for implementing RBAC in Supabase using a JWT from an external provider (like Firebase). This involves setting up a custom `auth.users` table or a separate `profiles` table with a `role` column, and creating RLS policies that check this role.
    - **CCR:** C:6, C:7, R:6
    - **Verification:** A clear plan for managing admin roles is added to `docs/AUTH_ARCHITECTURE.md`.
  - **[ ] 2.1.3: Implement Supabase RBAC Schema**
    - **Guidance:** Create the necessary SQL types and tables in Supabase to support a permission-based RBAC system, as detailed in `docs/AUTH_ARCHITECTURE.md`.
    - **CCR:** C:4, C:9, R:4
    - **Verification:** The `app_role` and `app_permission` types, and the `role_permissions` table are successfully created in the Supabase database.
  - **[ ] 2.1.4: Implement Supabase `authorize` Function**
    - **Guidance:** Create the `public.authorize` SQL function in Supabase. This function will be the central point for checking user permissions in all RLS policies.
    - **CCR:** C:5, C:8, R:6
    - **Verification:** The `authorize` function is created and returns the expected boolean values when tested with different roles and permissions in the Supabase SQL Editor.
  - **[ ] 2.1.5: Refactor RLS Policies to Use `authorize` Function**
    - **Guidance:** Update all existing RLS policies on tables like `trucks`, `events`, etc., to use the new `authorize` function instead of direct role checks.
    - **CCR:** C:6, C:7, R:7
    - **Verification:** RLS policies are updated, and data access rules are correctly enforced for different user roles.
  - **[ ] 2.1.6: Configure Firebase and Supabase Integration**
    - **Guidance:** Follow the steps in `docs/AUTH_ARCHITECTURE.md` to add the Firebase Project ID as a trusted JWT issuer in the Supabase dashboard.
    - **CCR:** C:3, C:9, R:4
    - **Verification:** The integration is successfully created in the Supabase dashboard.
  - **[ ] 2.1.7: Implement Firebase Cloud Function for Custom Claims**
    - **Guidance:** Deploy a `beforeUserCreated` blocking function in Firebase to assign a default `authenticated` role to new users.
    - **CCR:** C:6, C:7, R:6
    - **Verification:** New users created via Firebase Auth have the `role: 'authenticated'` custom claim in their JWT.
  - **[ ] 2.1.8: Manually Assign Admin Role in Firebase**
    - **Guidance:** Using the Firebase Admin SDK in a secure, one-off script, assign the `admin` role to the designated admin user's Firebase UID.
    - **CCR:** C:3, C:9, R:5
    - **Verification:** The admin user's JWT contains the `role: 'admin'` custom claim.
  - **[ ] 2.1.9: Configure Next.js Supabase Client for Firebase JWT**
    - **Guidance:** Update the Supabase client initialization in the Next.js app to dynamically use the JWT from the authenticated Firebase user.
    - **CCR:** C:5, C:8, R:6
    - **Verification:** The Supabase client successfully authenticates requests using the Firebase JWT.
  - **[ ] 2.1.10: Implement Middleware for Route Protection**
    - **Guidance:** Create or modify `app/middleware.ts` to check for a user's session (via Firebase) and their `admin` role (from the JWT) before allowing access to `/admin/*` paths.
    - **CCR:** C:6, C:8, R:6
    - **Verification:** Middleware correctly intercepts and redirects non-admin users away from admin routes.

- **[ ] 2.2: Research and Plan for AI Red Teaming**
  - **Guidance:** Locate the GitHub repository for "AI Red Teaming with MCP" and research how to set it up. The goal is to proactively identify security vulnerabilities in the codebase, especially before implementing payment features.
  - **CCR:** C:8, C:5, R:7
  - **Verification:** A new document, `docs/SECURITY_PLAN.md`, is created, outlining the plan for red teaming, including setup instructions and a schedule for running scans.

---

## 3.0 Core Data Pipeline & Quality

- **[ ] 3.1: Verify Vercel CRON Job**
  - **Guidance:** The automated scraping process is the lifeblood of this app. We need to confirm the Vercel CRON job that triggers the scraping is running correctly and on schedule.
  - **CCR:** C:6, C:7, R:8
  - **Verification:** Vercel logs show the CRON job executing successfully at the expected intervals. The "last scraped at" timestamps in the database are updated as expected.
  - **[ ] 3.1.1: Research CRON Job Configuration**
    - **Guidance:** Review `vercel.json` to identify all configured CRON jobs, their paths, and their schedules.
    - **CCR:** C:1, C:10, R:0
    - **Verification:** All CRON jobs are identified and listed in the sub-tasks below.
  - **[ ] 3.1.2: Analyze `auto-scrape` Job**
    - **Guidance:** The CRON job at `/api/cron/auto-scrape` runs daily at 8:00 AM EST (13:00 UTC). It is protected by a `CRON_SECRET` and triggers the `autoScraper.runAutoScraping()` function. It also schedules follow-up tasks via the `scheduler` module.
    - **CCR:** C:4, C:9, R:5
    - **Verification Plan:**
      - **1. Check Vercel Logs:** After 8:00 AM EST, inspect the Vercel deployment logs for the `/api/cron/auto-scrape` endpoint. Look for successful (200) or failed (500) status codes.
      - **2. Check Supabase `activity_logs`:** Query the `activity_logs` table for `auto_scrape_started` and `auto_scrape_completed` or `auto_scrape_failed` entries.
      - **3. Check `food_trucks` data:** Verify that the `last_scraped_at` timestamps for trucks have been recently updated.
  - **[ ] 3.1.3: Analyze `quality-check` Job**
    - **Guidance:** The CRON job at `/api/cron/quality-check` runs daily at 8:00 AM EST (13:00 UTC). It is also protected by the `CRON_SECRET`. It fetches all trucks, calculates quality scores using `DataQualityService`, and batch updates the scores in the database.
    - **CCR:** C:4, C:9, R:5
    - **Verification Plan:**
      - **1. Check Vercel Logs:** After 8:00 AM EST, inspect the Vercel deployment logs for the `/api/cron/quality-check` endpoint.
      - **2. Check Supabase `activity_logs`:** Query the `activity_logs` table for `quality_check_started` and `quality_check_completed` or `quality_check_failed` entries.
      - **3. Check `food_trucks` data:** Verify that the `quality_score` column for trucks has been recently updated.
  - **[ ] 3.1.4: Create Checkpoint for CRON Job Verification**
    - **Guidance:** Before making any changes to the CRON jobs or their underlying code, create a checkpoint. This could be a git commit, a database backup, or both. This will allow for a quick rollback if verification fails.
    - **CCR:** C:2, C:10, R:2
    - **Verification:** A checkpoint is created and noted in the project documentation.

- **[ ] 3.2: Refine Data Categorization**
  - **Guidance:** The pipeline is incorrectly identifying directories ("Food Trucks in Charleston SC") and events ("Black Food Truck Festival") as food trucks. We need to build a classification system.
  - **CCR:** C:8, C:6, R:7
  - **Verification:** The database correctly distinguishes between `trucks`, `events`, and `source_directories`. The main user-facing list only shows trucks.
  - **[ ] 3.2.1: Research Data Classification Techniques**
    - **Guidance:** Investigate methods to programmatically classify a scraped entity. This could involve keyword analysis, URL structure analysis, or using an AI service like Gemini for classification.
    - **CCR:** C:7, C:6, R:6
    - **Verification:** A chosen strategy is documented in `docs/DATA_PIPELINE_ARCHITECTURE.md`.
  - **[ ] 3.2.2: Implement Classifier in Scraping Engine**
    - **Guidance:** Modify the scraping and processing logic (`lib/pipelineProcessor.ts`) to include the new classification step.
    - **CCR:** C:8, C:7, R:7
    - **Verification:** New scrapes correctly categorize entities.
  - **[ ] 3.2.3: Create Schema for Events and Directories**
    - **Guidance:** Update the Supabase schema to include tables for `events` and `source_directories`.
    - **CCR:** C:5, C:9, R:4
    - **Verification:** The new tables exist in Supabase.

- **[ ] 3.3: Implement Geocoding for Addresses**
  - **Guidance:** Some trucks will only have a physical address. We need a process to convert these addresses into latitude and longitude to display them on the map.
  - **CCR:** C:7, C:8, R:6
  - **Verification:** Trucks with only an address are visible on the map in the correct location.
  - **[ ] 3.3.1: Research Geocoding Services**
    - **Guidance:** Evaluate free and open-source geocoding services. Options could include Nominatim (OpenStreetMap), or a free tier of a commercial service. Check Supabase for built-in PostGIS functions that might help.
    - **CCR:** C:5, C:7, R:5
    - **Verification:** A service is chosen and documented.
  - **[ ] 3.3.2: Integrate Geocoding into Data Pipeline**
    - **Guidance:** Add a step in the pipeline that checks if GPS coordinates are missing and, if so, calls the chosen geocoding service to populate them.
    - **CCR:** C:7, C:8, R:6
    - **Verification:** The `latitude` and `longitude` columns in the `trucks` table are populated for address-only entries after a scrape.

- **[ ] 3.4: Define and Refine Data Quality Score**
  - **Guidance:** The current quality score is ambiguous. We need to define the specific metrics, weights, and thresholds that contribute to the score.
  - **CCR:** C:6, C:5, R:5
  - **Verification:** The logic for calculating the quality score is documented and implemented, and the scores in the admin dashboard reflect the new, clear metrics.
  - **[ ] 3.4.1: Research Best Practices for Data Quality Metrics**
    - **Guidance:** Look at how other data-driven applications quantify data quality. Identify key fields for a food truck (e.g., has menu, has recent location, has photo, has operating hours) and assign weights to them.
    - **CCR:** C:4, C:6, R:4
    - **Verification:** A formula and a list of weighted metrics are documented in `docs/DATA_QUALITY_GUIDE.md`.
  - **[ ] 3.4.2: Implement New Quality Score Logic**
    - **Guidance:** Update the backend script that calculates the quality scores based on the new formula.
    - **CCR:** C:6, C:8, R:5
    - **Verification:** The scores are recalculated and updated in the database.

---

## 4.0 UI/UX Overhaul & Frontend Features

- **[ ] 4.1: Redesign Core UI Components**
  - **Guidance:** The current UI is described as "boxy" and "square". The goal is to create a more modern, rounded, and visually appealing design. This will likely involve updating TailwindCSS configuration and component styles.
  - **CCR:** C:7, C:7, R:5
  - **Verification:** The application's UI reflects the new design language.
  - **[ ] 4.1.1: Research UI Frameworks and Design Systems**
    - **Guidance:** Investigate "Magic UI" and other open-source component libraries/frameworks that can help achieve the desired "black glassmorphism with red neon highlights" aesthetic.
    - **CCR:** C:5, C:6, R:4
    - **Verification:** A decision on whether to use a library or build custom styles is made and documented.
  - **[ ] 4.1.2: Update Base Styles and Component Library**
    - **Guidance:** Modify `app/globals.css`, `tailwind.config.ts`, and core UI components in `components/ui/` to use more `border-radius`, new color schemes, and other modern styling.
    - **CCR:** C:7, C:8, R:5
    - **Verification:** Components like Cards, Buttons, and Badges have a new, rounded look.

- **[ ] 4.2: Improve "View Details" Experience**
  - **Guidance:** Clicking "View Details" should not navigate to a new page. It should display the information on the same page, using a modal, accordion, or similar non-disruptive UI pattern.
  - **CCR:** C:6, C:9, R:4
  - **Verification:** The user can view truck details without a full page load.
  - **[ ] 4.2.1: Implement Non-Navigational Detail View**
    - **Guidance:** Refactor the `TruckCard` and `TruckListSection` components to open details in a modal (`AlertDialog` or `Sheet` from `components/ui`) or by expanding the card itself.
    - **CCR:** C:6, C:9, R:4
    - **Verification:** The new detail view is functional and smooth.
  - **[ ] 4.2.2: Hide Developer-Facing Data**
    - **Guidance:** Remove fields like "Coordinates" from the user-facing detail view. This data is useful for admins but not for regular users.
    - **CCR:** C:2, C:10, R:1
    - **Verification:** The detail view only shows user-friendly information.

- **[ ] 4.3: Replace Food Truck Icon**
  - **Guidance:** The current map marker for food trucks needs to be replaced with a better icon that clearly represents a food truck.
  - **CCR:** C:2, C:10, R:1
  - **Verification:** The map displays the new, improved food truck icon.
  - **[ ] 4.3.1: Source a New Food Truck Icon**
    - **Guidance:** Find a suitable, open-source (or free-to-use) SVG icon for a food truck.
    - **CCR:** C:1, C:10, R:0
    - **Verification:** A new SVG file is added to the `public/` directory.
  - **[ ] 4.3.2: Update Map Component to Use New Icon**
    - **Guidance:** Modify `components/map/MapComponent.tsx` to use the new icon for markers.
    - **CCR:** C:3, C:9, R:2
    - **Verification:** The new icon appears correctly on the map.

- **[ ] 4.4: Design and Implement User Portal**
  - **Guidance:** Create a user-specific area, likely accessed via a hamburger menu or user icon in the header. This will be the foundation for personalized features.
  - **CCR:** C:8, C:6, R:7
  - **Verification:** A basic user portal is accessible after login.
  - **[ ] 4.4.1: Plan User Portal Features (Phase 1)**
    - **Guidance:** For the initial version, plan for a minimal set of features: viewing favorited trucks and a settings page. Document plans for future features like notifications and coupons.
    - **CCR:** C:4, C:7, R:3
    - **Verification:** A feature list for the user portal is documented in `docs/USER_PORTAL_PLAN.md`.
  - **[ ] 4.4.2: Implement User Favorites**
    - **Guidance:** Add a "favorite" button to `TruckCard`. Create a new table in Supabase to store user favorites (`user_id`, `truck_id`). Display favorited trucks in the user portal.
    - **CCR:** C:7, C:8, R:6
    - **Verification:** Users can favorite and unfavorite trucks, and the list appears in their portal.

---

## 5.0 Admin Dashboard Enhancements

- **[ ] 5.1: Fix Data Discrepancies**
  - **Guidance:** The admin dashboard panels are not all showing the same data (e.g., 9 trucks vs. 10 trucks). This suggests a data fetching or state management issue.
  - **CCR:** C:7, C:6, R:7
  - **Verification:** All panels on the admin dashboard show consistent data that matches the database.
  - **[ ] 5.1.1: Investigate Data Fetching Logic**
    - **Guidance:** Review the data fetching code for each panel on the admin dashboard (`app/admin/page.tsx` and its components). Check if some panels are using cached data or different query filters.
    - **CCR:** C:6, C:7, R:6
    - **Verification:** The root cause of the discrepancy is identified and documented.
  - **[ ] 5.1.2: Unify Data Source or Refetching Strategy**
    - **Guidance:** Refactor the dashboard to use a single, consistent data source (e.g., a React context or a unified hook) or ensure all panels refetch data on a consistent trigger.
    - **CCR:** C:7, C:8, R:7
    - **Verification:** The fix is implemented and all panels update in sync.

- **[ ] 5.2: Improve Auto-Scraping Page**
  - **Guidance:** The auto-scraping page is vague. It needs to provide more useful information about scraping status and history.
  - **CCR:** C:6, C:7, R:5
  - **Verification:** The auto-scraping page is more informative and functional.
  - **[ ] 5.2.1: Display Scraping History**
    - **Guidance:** Create a table to log the status of each scraping batch job (start time, end time, status, number of trucks processed). Display this history on the auto-scraping page.
    - **CCR:** C:6, C:8, R:5
    - **Verification:** The page shows a history of past scraping jobs.
  - **[ ] 5.2.2: Implement "Trigger Manual Scrape" Functionality**
    - **Guidance:** The button currently does nothing. Hook it up to an API endpoint that triggers the scraping pipeline on demand. Provide feedback to the user that the scrape has started.
    - **CCR:** C:5, C:9, R:4
    - **Verification:** Clicking the button successfully initiates a new scraping job.

- **[ ] 5.3: Improve Data Quality Page UI**
  - **Guidance:** The charts on the Data Quality page are boxy and the pie chart labels overlap.
  - **CCR:** C:5, C:8, R:3
  - **Verification:** The charts are visually appealing and the labels are readable.
  - **[ ] 5.3.1: Fix Pie Chart Labels**
    - **Guidance:** Adjust the configuration of the charting library (likely Recharts) to position the labels correctly, perhaps below the chart with a legend.
    - **CCR:** C:4, C:9, R:2
    - **Verification:** The pie chart is legible.
  - **[ ] 5.3.2: Apply New Design to Charts**
    - **Guidance:** Update the chart components to match the new, rounded design language.
    - **CCR:** C:5, C:8, R:3
    - **Verification:** The charts have rounded corners and fit the new aesthetic.

---

## 6.0 Future-Proofing & Deployment

- **[ ] 6.1: Plan for Mobile App Conversion**
  - **Guidance:** Research methods for wrapping the Next.js web app into a mobile app for the Google Play Store, prioritizing cost-effective solutions.
  - **CCR:** C:7, C:5, R:6
  - **Verification:** A document, `docs/MOBILE_DEPLOYMENT_PLAN.md`, is created, comparing technologies like Progressive Web Apps (PWA), Capacitor, and others.

- **[ ] 6.2: Plan for Payment Integration**
  - **Guidance:** Research and plan for the integration of a payment provider for food truck owner subscriptions. The preference is for Polar over Stripe.
  - **CCR:** C:6, C:6, R:8
  - **Verification:** A document, `docs/PAYMENT_INTEGRATION_PLAN.md`, is created, outlining the chosen provider, the required data schema changes, and the implementation steps.

---

## 7.0 Supabase Health & Optimization

- **[x] 7.1: Optimize RLS Policies**
  - **Guidance:** The database has multiple, overlapping permissive RLS policies for the same roles and actions, which hurts performance. These need to be consolidated. This is still critical even with an external auth provider.
  - **CCR:** C:7, C:6, R:7
  - **Verification:** The number of RLS policies is reduced, and queries on the affected tables show improved performance.
  - **[x] 7.1.1: Consolidate Multiple Permissive Policies**
    - **Guidance:** For tables like `events`, `food_truck_schedules`, and `menu_items`, combine the multiple `PERMISSIVE` policies for each action (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) into a single, more efficient policy. This will involve creating more comprehensive `USING` and `WITH CHECK` expressions based on the user's role derived from their JWT.
    - **CCR:** C:7, C:6, R:7
    - **Verification:** The redundant policies are removed from the Supabase dashboard, leaving one policy per action/role.

- **[x] 7.2: Optimize Database Indexing**
  - **Guidance:** Address the indexing warnings from the Supabase Advisor to improve query performance and remove dead weight.
  - **CCR:** C:6, C:7, R:6
  - **Verification:** The indexing-related warnings are no longer present in the Supabase Advisor report.
  - **[x] 7.2.1: Add Indexes to Foreign Keys**
    - **Guidance:** Add indexes to the foreign key columns identified in the advisor report (`data_processing_queue.truck_id`, `events.food_truck_id`, `food_truck_schedules.food_truck_id`). This can be done via the Supabase SQL editor.
    - **CCR:** C:4, C:9, R:4
    - **Verification:** The new indexes are visible in the Supabase table definitions.
  - **[ ] 7.2.2: Remove Unused Indexes**
    - **Guidance:** The advisor has identified a large number of unused indexes across various tables (`api_usage`, `discovered_directories`, `discovered_urls`, `food_trucks`, `scraping_jobs`). These should be reviewed and dropped to save space and reduce maintenance overhead.
    - **CCR:** C:5, C:8, R:5
    - **Verification:** The unused indexes are removed, and application functionality remains unaffected.
