# Food Truck Finder - Unified Action Plan

**Date:** 2025-01-21  
**Status:** PRODUCTION DEPLOYED ON VERCEL 🚀  
**GitHub:** Open Source with automatic deployment

This is the single source of truth for all current and future project actions.

---

## ✅ **CURRENT ACHIEVEMENTS**

### **Production Ready**
- ✅ **Zero TypeScript compilation errors** - Build guaranteed to succeed
- ✅ **Deployed on Vercel** - Live and auto-deploying from GitHub
- ✅ **Core features working** - Food truck discovery, mapping, search
- ✅ **Database integrated** - Supabase with fallback systems
- ✅ **ESLint organized** - Supabase scripts ignored, real issues identified
- ✅ **UI Components** - Major migration to modern system likely complete
- ✅ **Map enhancements** - Improved tile layers, better performance, crisp rendering
- ✅ **License & IP Protection** - Business Source License 1.1 implemented with commercial contact

### **Open Source Setup**
- ✅ **GitHub repository** - Public and connected to Vercel
- ✅ **License properly configured** - Business Source License 1.1 with commercial contact
- ✅ **Auto-deployment** - Every main branch update triggers deployment

---

## 🎯 **IMMEDIATE PRIORITIES (Next 1-2 Weeks)**

### **1. Production Stability Verification**
- **Priority:** HIGH  
- **Timeline:** 1-2 days
- **Actions:**
  - [ ] Test CRON jobs in production
    - **SOTA Best Practices:**
      - **Secure Endpoints:** Protect cron job endpoints with a secret key passed in the `Authorization` header (e.g., `Bearer ${process.env.CRON_SECRET}`). This is the most critical security measure.
      - **Idempotency:** Design jobs to be idempotent, meaning they can be run multiple times without causing unintended side effects.
      - **Robust Logging:** Implement detailed logging within the cron job's API route to track execution, success, and failures. Use Vercel's logging capabilities for monitoring.
      - **Error Handling:** Implement comprehensive error handling within the job to catch and manage any issues that arise during execution.
    - **Potential Pitfalls & Common Errors:**
      - **Multiple Cron Instances:** Each Vercel deployment creates a new instance of the cron job. This can lead to multiple instances running simultaneously, which can cause race conditions and data corruption.
      - **Testing in Development:** It is difficult to test cron jobs in a development environment. You will need to use a tool like `ngrok` to expose your local development server to the internet so that you can test the cron job endpoint.
      - **Cold Starts:** Serverless functions can have cold starts, which can delay the execution of your cron job.
      - **Timezone:** All Vercel cron schedules are in UTC. This is a common source of off-by-one errors if not handled correctly.
      - **Execution Timeouts:** Vercel functions have maximum execution limits. Long-running jobs may be terminated. Break down long tasks into smaller, quicker jobs.
      - **Hobby Plan Limitations:** The Hobby plan only triggers jobs once per day, and the exact time can vary. This is not suitable for high-frequency or time-sensitive tasks.
    - **Possible Fallbacks:**
      - **Manual Retries:** Vercel does not automatically retry failed cron jobs. Implement a manual retry mechanism or a "dead letter queue" for failed jobs if necessary.
      - **External Monitoring:** For critical jobs, use an external monitoring service to ensure they are running as expected.
    - **Security Concerns:**
      - **Unauthorized Access:** Publicly exposed cron job URLs can be exploited. Always secure them.
      - **Denial of Service (DoS):** An unsecured endpoint could be targeted by a DoS attack. Rate limiting can help mitigate this.
  - [ ] Verify data pipeline is updating
    - **1.1: Verify Supabase Connection and Data Fetching**
      - **Guidance:** The primary data source is Supabase. The first step is to ensure that the application can connect to Supabase and fetch data. The relevant file is `lib/fallback/supabaseFallback.tsx`.
      - **CCR:** C:1, C:9, R:2
      - **Verification:**
        - [ ] Check the browser's developer console for any Supabase connection errors.
        - [ ] Verify that the `useFoodTrucks` hook is successfully fetching data from Supabase.
        - [ ] Check the `DataStatusIndicator` component to ensure that it is displaying the correct status ("fresh").
      - **Security Concerns:**
        - **Environment Variables:** Ensure that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are securely stored in Vercel environment variables and are not exposed on the client-side.
    - **1.2: Verify Client-Side Caching Fallback**
      - **Guidance:** The application uses a client-side caching mechanism in `localStorage` as a fallback if Supabase is unavailable. This is implemented in `lib/fallback/supabaseFallback.tsx`.
      - **CCR:** C:2, C:9, R:3
      - **Verification:**
        - [ ] Manually disconnect from the internet or block the Supabase URL to simulate an outage.
        - [ ] Verify that the `useFoodTrucks` hook falls back to the cached data.
        - [ ] Check the `DataStatusIndicator` component to ensure that it is displaying the correct status ("cached" or "stale").
        - [ ] Verify that the application remains functional, albeit with potentially stale data.
      - **Security Concerns:**
        - **Sensitive Data in `localStorage`:** `localStorage` is not a secure place to store sensitive data. While the current implementation only stores public food truck data, be mindful of this if you decide to cache any user-specific or sensitive information in the future.
    - **1.3: Verify Data Pipeline Processes**
      - **Guidance:** The data pipeline itself is composed of several processes that need to be verified. The relevant files are `lib/pipelineManager.ts`, `lib/pipelineProcessor.ts`, and the cron jobs in `app/api/cron`.
      - **CCR:** C:5, C:7, R:5
      - **Sub-tasks:**
        - **1.3.1: Verify Cron Job Execution**
          - **Guidance:** Check the Vercel logs for the cron jobs to ensure that they are running on schedule and without errors.
          - **CCR:** C:2, C:9, R:2
          - **Verification:**
            - [ ] Cron jobs are running on schedule.
            - [ ] There are no errors in the cron job logs.
        - **1.3.2: Verify Data Updates**
          - **Guidance:** Verify that the data in the Supabase database is being updated by the pipeline.
          - **CCR:** C:3, C:8, R:4
          - **Verification:**
            - [ ] The `updated_at` timestamp of the records in the `food_trucks` table should be recent.
            - [ ] The data in the `food_trucks` table should be consistent with the data from the source.
        - **1.3.3: Manually Trigger Pipeline**
          - **Guidance:** Manually trigger the pipeline (if possible) to test it in a controlled environment.
          - **CCR:** C:2, C:9, R:3
          - **Verification:**
            - [ ] The pipeline should run successfully when triggered manually.
            - [ ] The data in the Supabase database should be updated correctly.
      - **Risks and Pitfalls:**
        - **ORM Performance:** Using an ORM with Supabase can be slow. For better performance, use the Supabase client library directly.
        - **Security:** Ensure that all database calls are made from the server-side to avoid exposing your database URL to the client.
        - **Server Actions:** Be aware of potential issues when using Supabase and Server Actions in `layout.tsx`.
        - **Debugging:** Business logic buried inside database functions can be difficult to debug. Keep business logic in your application code where it can be more easily tested and debugged.
        - **Vendor Lock-in:** Be aware of the risk of vendor lock-in with any third-party service.
      - **Security Concerns:**
        - **Cron Job Security:** As mentioned in the previous section, ensure that the cron job endpoints are secured with a secret key.
        - **Data Validation:** The pipeline should validate all data before inserting it into the database to prevent data corruption and potential security vulnerabilities.
  - [ ] Confirm admin dashboard is accessible but needs security
    - **SOTA Best Practices:**
      - **Use Middleware for Route Protection:** Implement Next.js middleware to protect the `/admin` routes. This is the most efficient way to enforce authentication and authorization before rendering any component.
      - **Role-Based Access Control (RBAC):** In the middleware or page component, verify the user's session and check for an 'admin' role. Use the `forbidden()` function or a redirect for unauthorized users.
      - **Secure Session Management:** Store session data in secure, HTTP-only cookies.
      - **Content Security Policy (CSP):** Implement a strict CSP to prevent XSS attacks.
    - **Potential Pitfalls & Common Errors:**
      - **API Key Exposure:** Do not expose your Supabase API keys on the frontend. All database calls should be made from the server-side.
      - **Insecure Direct Object References (IDOR):** Ensure that users can only access the data that they are authorized to.
      - **Cross-Site Request Forgery (CSRF):** Be aware of CSRF vulnerabilities and use Next.js's built-in protection.
      - **Insecure Session Management:** Use secure, HTTP-only cookies with a short expiration time.
      - **Trusting Client-Side Data:** Never trust data from the client. Always re-verify session and permissions on the server.
      - **Exposing Sensitive Data:** Use Data Transfer Objects (DTOs) to sanitize data and avoid exposing sensitive information to the client.
    - **Possible Fallbacks:**
      - **Page-Level Checks:** If middleware is not feasible, implement auth checks directly within each admin page's Server Component.
    - **Security Concerns:**
      - **Cross-Site Scripting (XSS):** A strong CSP is the best defense.
      - **Cross-Site Request Forgery (CSRF):** While Next.js has some built-in protection, be mindful of this vulnerability.
      - **Open Redirects:** Validate all redirect URLs to prevent open redirect vulnerabilities.
- [ ] Test core user flows (search, map, details)

### **3. Critical Gap Analysis & Remediation**
- **Priority:** HIGH
- **Timeline:** 1 day
- **Actions:**
  - [ ] **User Feedback System:** The planned user feedback system is entirely missing. This includes the feedback form, Supabase table, and admin review page. This is the highest priority feature gap.
  - [ ] **Admin Security:** The current RBAC security in `middleware.ts` is more advanced than the simple password protection in the plan, but it is undocumented and its effectiveness is unverified. The plan needs to be updated to reflect the existing implementation, and the security needs to be audited.
  - [ ] **Code Quality:** The planned code quality improvements, particularly the type safety issues in `TruckDetailsModal.tsx`, have not been addressed.
  - [ ] **Plan Discrepancy:** The project contains advanced features (Firecrawl/Gemini integrations, data quality monitoring) that are not documented in the plan. The plan needs to be updated to reflect the current reality of the codebase.
    - **SOTA Best Practices:**
      - **End-to-End (E2E) Testing:** Use a testing framework like Playwright to write E2E tests that simulate user flows. These tests should cover the entire user journey, from searching for a food truck to viewing its details on the map.
      - **Component Testing:** Use Jest and React Testing Library to write unit tests for individual components. This helps to ensure that each component is working correctly in isolation.
      - **Authentication and Authorization Testing:** Write tests to ensure that your authentication and authorization flows are working correctly. This includes testing that only authorized users can access certain pages or perform certain actions.
      - **Performance Monitoring:** Use the `useReportWebVitals` hook to monitor the performance of your user flows and identify any bottlenecks.
    - **Potential Pitfalls & Common Errors:**
      - **Flaky Tests:** E2E tests can be flaky if not written carefully. Use reliable selectors (e.g., `data-testid`) and wait for elements to be visible before interacting with them.
      - **Slow Tests:** E2E tests can be slow. Run them in parallel and use a CI/CD pipeline to automate the process.
      - **Setup and Configuration:** Setting up E2E tests with TypeScript can be challenging. Playwright is generally considered to have a smoother setup experience than Cypress.
      - **Test Maintenance:** As your application grows, your E2E test suite will also grow. It's important to have a good strategy for organizing and maintaining your tests.
      - **Incomplete Coverage:** Ensure that your tests cover all of the critical user flows in your application.
    - **Possible Fallbacks:**
      - **Manual Testing:** If you don't have time to write automated tests, you can test your user flows manually. However, this is not a scalable solution.
      - **Combination of Tests:** Use a combination of E2E, integration, and unit tests to get the best coverage.
    - **Security Concerns:**
      - **Authentication:** Ensure that your authentication flows are secure and that user data is protected.
      - **Authorization:** Ensure that your authorization flows are secure and that users can only access the data and features that they are authorized to.

### **2. Admin Security Audit & Documentation**
- **Priority:** HIGH
- **Timeline:** 2-3 days
- **Actions:**
  - **2.1: Document Existing RBAC Implementation**
    - **Guidance:** The current security model uses a robust Role-Based Access Control (RBAC) system, which is superior to the originally planned simple password. This task is to create a new `docs/ADMIN_SECURITY.md` document that details the current implementation in `app/middleware.ts` and `lib/middleware/middlewareHelpers.ts`.
    - **CCR:** C:3, C:9, R:2
    - **Verification:**
      - [ ] `docs/ADMIN_SECURITY.md` is created and accurately reflects the implementation.
  - **2.2: Audit RLS Policies on `profiles` Table**
    - **Guidance:** The security of the RBAC system depends on the Row Level Security (RLS) policies on the `profiles` table. This task is to audit these policies to ensure that they are correctly configured and that there are no vulnerabilities.
    - **CCR:** C:4, C:8, R:5
    - **Verification:**
      - [ ] RLS policies are verified and documented in `docs/ADMIN_SECURITY.md`.
  - **2.3: Verify and Document Audit Logger**
    - **Guidance:** The `AuditLogger` is a critical security feature. This task is to verify that it is functioning correctly and to document its usage in `docs/ADMIN_SECURITY.md`.
    - **CCR:** C:3, C:8, R:4
    - **Verification:**
      - [ ] Audit logger functionality is verified and documented.
  - **2.4: Update Project Plan**
    - **Guidance:** The "Admin Security Implementation" section of this project plan needs to be updated to reflect the new understanding of the existing security model.
    - **CCR:** C:1, C:10, R:1
    - **Verification:**
      - [ ] The project plan is updated.

---

## 📋 **NEXT PHASE (Weeks 3-4)**

### **User Feedback Collection**
  - **3.1: Create Simple Feedback Form Component**
    - **Guidance:** Create a new component at `components/feedback/FeedbackForm.tsx`. This component should be a simple form with the following fields:
      - Name (optional, text input)
      - Email (optional, email input)
      - Feedback (required, textarea)
      - A submit button
    - **CCR:** C:3, C:9, R:2
    - **Verification:**
      - [ ] The `FeedbackForm` component should be created at the specified location.
      - [ ] The component should render correctly and be usable.
    - **Security Concerns:**
      - **Cross-Site Scripting (XSS):** Sanitize all user input on the server-side before storing it in the database to prevent XSS attacks.
  - **3.2: Store Feedback in Supabase Table**
    - **Guidance:** Create a new table in Supabase called `feedback` with the following columns:
      - `id` (uuid, primary key)
      - `created_at` (timestamp with time zone)
      - `name` (text, nullable)
      - `email` (text, nullable)
      - `feedback` (text, not nullable)
    - **CCR:** C:2, C:10, R:2
    - **Verification:**
      - [ ] The `feedback` table should be created in Supabase with the correct schema.
      - [ ] The `FeedbackForm` component should successfully submit feedback to the `feedback` table.
    - **Security Concerns:**
      - **Row Level Security (RLS):** Enable RLS on the `feedback` table to prevent unauthorized access to the data.
  - **3.3: Add Feedback Review to Admin Dashboard**
    - **Guidance:** Create a new page in the admin dashboard at `app/admin/feedback/page.tsx`. This page should display the feedback from the `feedback` table in a simple table format.
    - **CCR:** C:3, C:9, R:2
    - **Verification:**
      - [ ] The feedback page should be created at the specified location.
      - [ ] The page should display the feedback from the `feedback` table.
    - **Security Concerns:**
      - **Admin Access:** Ensure that only users with the 'admin' role can access this page.
  - **3.4: Recruit 10-20 Beta Testers**
    - **Guidance:** Reach out to potential users and invite them to test the application and provide feedback.
    - **CCR:** C:1, C:8, R:1
    - **Verification:**
      - [ ] At least 10 beta testers should be recruited.
      - [ ] Beta testers should be providing feedback through the feedback form.

### **Code Quality Improvements**
  - **4.1: Fix Type Safety Issues in `TruckDetailsModal.tsx`**
    - **Guidance:** The `TruckDetailsModal.tsx` component has a number of type safety issues that need to be addressed. This includes unused variables, explicit `any` types, and unsafe member access.
    - **CCR:** C:5, C:8, R:6
    - **Sub-tasks:**
      - **4.1.1: Remove Unused Variables**
        - **Guidance:** Remove the unused `verification_status` variable.
        - **CCR:** C:1, C:10, R:1
        - **Verification:**
          - [ ] The `verification_status` variable should be removed.
      - **4.1.2: Replace `any` Types**
        - **Guidance:** Replace all instances of the `any` type with more specific types. This will likely involve creating new types or importing existing ones.
        - **CCR:** C:4, C:8, R:5
        - **Verification:**
          - [ ] There should be no more `no-explicit-any` errors in the component.
      - **4.1.3: Fix Unsafe Member Access**
        - **Guidance:** Fix all instances of unsafe member access. This will likely involve adding type guards or using optional chaining.
        - **CCR:** C:4, C:8, R:5
        - **Verification:**
          - [ ] There should be no more `no-unsafe-member-access` errors in the component.
    - **Security Concerns:**
      - **Data Exposure:** Using `any` can lead to accidental exposure of sensitive data to the client.
  - **4.2: Clean Up Unused Imports and Variables**
    - **Guidance:** There are a number of unused imports and variables throughout the codebase. These should be removed to improve code quality and reduce bundle size.
    - **CCR:** C:2, C:10, R:1
    - **Verification:**
      - [ ] Run `npx eslint . --format=compact` and verify that there are no more `no-unused-vars` or `unused-import` errors.
  - **4.3: Review Strict Boolean Expression Warnings**
    - **Guidance:** There are a number of `strict-boolean-expressions` warnings throughout the codebase. These should be reviewed and fixed to improve code quality and prevent potential bugs.
    - **CCR:** C:3, C:8, R:4
    - **Verification:**
      - [ ] Run `npx eslint . --format=compact` and verify that there are no more `strict-boolean-expressions` warnings.
  - **4.4: Address Other ESLint Issues**
    - **Guidance:** Address the remaining ESLint issues, such as `max-lines-per-function`, `no-console`, and `unicorn/no-null`.
    - **CCR:** C:4, C:8, R:4
    - **Sub-tasks:**
      - **4.4.1: Refactor Long Functions**
        - **Guidance:** Refactor the functions that are longer than 120 lines. This includes the `TruckCard` and `MapComponent` components.
        - **CCR:** C:5, C:8, R:5
        - **Verification:**
          - [ ] There should be no more `max-lines-per-function` errors.
      - **4.4.2: Remove `console.log` Statements**
        - **Guidance:** Replace all `console.log` statements with a proper logger, or remove them if they are not needed.
        - **CCR:** C:2, C:10, R:1
        - **Verification:**
          - [ ] There should be no more `no-console` errors.
      - **4.4.3: Replace `null` with `undefined`**
        - **Guidance:** Replace all instances of `null` with `undefined` to follow the `unicorn/no-null` rule.
        - **CCR:** C:2, C:10, R:2
        - **Verification:**
          - [ ] There should be no more `unicorn/no-null` errors.

### **Performance & Mobile**
  - **5.1: Test Mobile Responsiveness**
    - **Guidance:** Test the application on a variety of screen sizes to ensure that it is responsive. Use a combination of browser DevTools, real devices, and E2E tests.
    - **CCR:** C:3, C:9, R:3
    - **Verification:**
      - [ ] The application should be usable and look good on all screen sizes, from small phones to large desktops.
      - [ ] There should be no layout issues or overlapping elements.
    - **SOTA Best Practices:**
      - **`next/image`:** Use the `next/image` component with the `sizes` prop to serve responsive images.
      - **CSS Media Queries:** Use CSS media queries to create a responsive layout.
      - **Device Detection:** Use the `userAgent` helper in Next.js middleware to detect the device type and serve different content if necessary.
  - **5.2: Optimize Loading Times**
    - **Guidance:** Use a tool like Google PageSpeed Insights or WebPageTest to analyze the loading performance of the application and identify any bottlenecks.
    - **CCR:** C:4, C:8, R:4
    - **Sub-tasks:**
      - **5.2.1: Analyze Performance**
        - **Guidance:** Use Google PageSpeed Insights and WebPageTest to get a baseline performance score for the application.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] The baseline performance score should be recorded.
      - **5.2.2: Implement Code Splitting**
        - **Guidance:** Ensure that Next.js's automatic code splitting is working correctly. You can use a tool like the Next.js Bundle Analyzer to visualize the bundle sizes.
        - **CCR:** C:3, C:8, R:3
        - **Verification:**
          - [ ] The bundle sizes should be reasonable.
          - [ ] There should be no large, monolithic bundles.
      - **5.2.3: Implement Lazy Loading**
        - **Guidance:** Lazy load any components or images that are not visible on the initial page load. This can be done using `next/dynamic` for components and the `loading="lazy"` attribute for images.
        - **CCR:** C:3, C:8, R:3
        - **Verification:**
          - [ ] Components and images should be lazy loaded.
      - **5.2.4: Implement Caching**
        - **Guidance:** Implement a caching strategy for static assets and API responses. This can be done using Vercel's Edge Caching or a service like Redis.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] Static assets and API responses should be cached.
  - **5.3: Add Proper Loading States**
    - **Guidance:** Add loading states to the application to provide feedback to the user while data is being fetched.
    - **CCR:** C:2, C:9, R:2
    - **Verification:**
      - [ ] The application should display a loading indicator while data is being fetched.
      - [ ] The loading indicator should be replaced with the data once it has been fetched.
    - **SOTA Best Practices:**
      - **Suspense:** Use React Suspense to show a loading fallback while a component is loading.
      - **Skeleton Screens:** Use skeleton screens to provide a better user experience than a simple loading spinner.
  - **5.4: Test on Slow Connections**
    - **Guidance:** Use the browser DevTools to simulate a slow network connection and test how the application performs.
    - **CCR:** C:2, C:9, R:3
    - **Verification:**
      - [ ] The application should still be usable on a slow connection.
      - [ ] The application should not time out or display any errors.
  - **5.5: Complete Dark Mode Map Styling**
    - **Guidance:** The dark mode map styling is currently in progress. This task involves completing the CSS filters to create a visually appealing and functional dark mode for the map.
    - **CCR:** C:3, C:8, R:2
    - **Verification:**
      - [ ] The map should have a dark mode that is consistent with the rest of the application.
      - [ ] The map should be usable and readable in dark mode.

---

## 🚀 **FUTURE GROWTH (Month 2+)**

### **Authentication System**
  - **6.1: Simple Supabase Auth (email/password)**
    - **Guidance:** Implement a simple email/password authentication system using the Supabase Auth client. This should include sign up, sign in, password reset, and update password functionality.
    - **CCR:** C:4, C:9, R:5
    - **Sub-tasks:**
      - **6.1.1: Create Sign Up Form**
        - **Guidance:** Create a sign up form at `app/auth/signup/page.tsx` that accepts an email and password.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] The sign up form should be created at the specified location.
          - [ ] The form should have an email input, a password input, and a submit button.
      - **6.1.2: Create Sign In Form**
        - **Guidance:** Create a sign in form at `app/auth/signin/page.tsx` that accepts an email and password.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] The sign in form should be created at the specified location.
          - [ ] The form should have an email input, a password input, and a submit button.
      - **6.1.3: Create Password Reset Form**
        - **Guidance:** Create a password reset form at `app/auth/reset-password/page.tsx` that accepts an email address.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] The password reset form should be created at the specified location.
          - [ ] The form should have an email input and a submit button.
      - **6.1.4: Create Update Password Form**
        - **Guidance:** Create an update password form at `app/account/update-password/page.tsx` that accepts a new password.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] The update password form should be created at the specified location.
          - [ ] The form should have a password input and a submit button.
      - **6.1.5: Implement Auth API Routes**
        - **Guidance:** Create API routes to handle the sign up, sign in, password reset, and update password functionality.
        - **CCR:** C:4, C:8, R:5
        - **Verification:**
          - [ ] The API routes should be created and should be functional.
    - **SOTA Best Practices:**
      - **Use Supabase Auth Client:** Use the `supabase.auth` client library for all authentication operations. Supabase automatically handles password hashing, so you don't need to implement it yourself.
      - **Email Confirmation:** Keep email confirmation enabled to prevent spam and fake accounts.
      - **Secure Password Change:** Enable the `auth.email.secure_password_change` setting in your Supabase config to require the user's current password when changing to a new password.
  - **6.2: User Profiles and Favorites**
    - **Guidance:** Create a `profiles` table in Supabase to store user profile information, such as their name and avatar. Also, create a `favorites` table to store the user's favorite food trucks.
    - **CCR:** C:3, C:9, R:4
    - **Verification:**
      - [ ] The `profiles` and `favorites` tables should be created in Supabase with the correct schema.
      - [ ] Users should be able to view and update their profile.
      - [ ] Users should be able to add and remove food trucks from their favorites.
    - **Security Concerns:**
      - **Row Level Security (RLS):** Enable RLS on the `profiles` and `favorites` tables to ensure that users can only access their own data.
  - **6.3: Basic Admin/User Roles**
    - **Guidance:** Add a `role` column to the `profiles` table to distinguish between regular users and admins. The `role` column should be a `text` field and should default to `user`.
    - **CCR:** C:2, C:10, R:3
    - **Verification:**
      - [ ] The `role` column should be added to the `profiles` table.
      - [ ] The `protectAdminRoutes` middleware should be updated to check for the `admin` role in the `profiles` table.
    - **Security Concerns:**
      - **Privilege Escalation:** Ensure that there is no way for a regular user to escalate their privileges to an admin.

### **Advanced Features**
  - **7.1: Enhanced Search Filters**
    - **Guidance:** The existing search functionality is already quite advanced, with components for cuisine types, distance, and quick filters. The next step is to enhance these filters with more options and to improve the user experience.
    - **CCR:** C:5, C:8, R:4
    - **Sub-tasks:**
      - **7.1.1: Add Price Range Filter**
        - **Guidance:** Add a filter for price range to the `AdvancedFilters.tsx` component. This could be a slider or a set of checkboxes.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] The price range filter should be added to the advanced filters.
          - [ ] The filter should correctly filter the food trucks by price range.
      - **7.1.2: Add Rating Filter**
        - **Guidance:** Add a filter for rating to the `AdvancedFilters.tsx` component. This could be a star rating component or a slider.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] The rating filter should be added to the advanced filters.
          - [ ] The filter should correctly filter the food trucks by rating.
      - **7.1.3: Improve UX of Existing Filters**
        - **Guidance:** Improve the user experience of the existing filters. This could include adding a "clear all" button, providing better feedback to the user when filters are applied, and making the filters more intuitive to use.
        - **CCR:** C:4, C:8, R:3
        - **Verification:**
          - [ ] The user experience of the search filters should be improved.
    - **SOTA Best Practices:**
      - **Real-time Filtering:** Use a state management library like Zustand or Redux to provide real-time filtering as the user interacts with the filters.
      - **Debouncing:** Debounce the filter inputs to prevent excessive API requests.
      - **Accessibility:** Ensure that the search filters are accessible to users with disabilities.
  - **7.2: User Reviews and Ratings**
    - **Guidance:** Implement a user reviews and ratings system. This will involve creating a new `reviews` table in Supabase, creating a form for submitting reviews, and displaying the reviews on the food truck details page.
    - **CCR:** C:6, C:8, R:6
    - **Sub-tasks:**
      - **7.2.1: Create `reviews` Table**
        - **Guidance:** Create a new table in Supabase called `reviews` with the following columns:
          - `id` (uuid, primary key)
          - `created_at` (timestamp with time zone)
          - `truck_id` (uuid, foreign key to `food_trucks.id`)
          - `user_id` (uuid, foreign key to `auth.users.id`)
          - `rating` (integer, between 1 and 5)
          - `review` (text, nullable)
        - **CCR:** C:2, C:10, R:2
        - **Verification:**
          - [ ] The `reviews` table should be created in Supabase with the correct schema.
      - **7.2.2: Create Review Form**
        - **Guidance:** Create a new component at `components/reviews/ReviewForm.tsx` that allows users to submit a review and a rating.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] The `ReviewForm` component should be created at the specified location.
          - [ ] The component should render correctly and be usable.
      - **7.2.3: Display Reviews**
        - **Guidance:** Create a new component at `components/reviews/ReviewList.tsx` that displays the reviews for a given food truck.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] The `ReviewList` component should be created at the specified location.
          - [ ] The component should correctly display the reviews for a food truck.
    - **Security Concerns:**
      - **Spam:** Implement measures to prevent spam reviews, such as requiring users to be logged in to submit a review.
      - **Data Validation:** Validate all review data before inserting it into the database.
  - **7.3: Food Truck Owner Portal**
    - **Guidance:** Create a portal for food truck owners to manage their listings. This will involve creating a new set of pages and components for the owner portal, as well as implementing a system for verifying that a user is the owner of a food truck.
    - **CCR:** C:8, C:7, R:7
    - **Sub-tasks:**
      - **7.3.1: Create Owner Verification System**
        - **Guidance:** Implement a system for verifying that a user is the owner of a food truck. This could involve a manual verification process or an automated system that checks for a specific domain name in the user's email address.
        - **CCR:** C:5, C:7, R:6
        - **Verification:**
          - [ ] The owner verification system should be functional and secure.
      - **7.3.2: Create Owner Portal Pages**
        - **Guidance:** Create the necessary pages for the owner portal, including a dashboard, a page for editing the food truck listing, and a page for viewing analytics.
        - **CCR:** C:6, C:8, R:5
        - **Verification:**
          - [ ] The owner portal pages should be created and should be functional.
      - **7.3.3: Implement Listing Management**
        - **Guidance:** Implement the functionality for food truck owners to edit their listings, including the menu, operating hours, and location.
        - **CCR:** C:5, C:8, R:5
        - **Verification:**
          - [ ] Food truck owners should be able to edit their listings.
    - **Security Concerns:**
      - **Authorization:** Ensure that only the owner of a food truck can edit its listing.
  - **7.4: Email Notifications**
    - **Guidance:** Implement a system for sending email notifications to users. This could include notifications for new reviews, updates to favorite food trucks, or promotional emails.
    - **CCR:** C:5, C:8, R:5
    - **Sub-tasks:**
      - **7.4.1: Choose an Email Service Provider**
        - **Guidance:** Research and select a high-speed, reliable transactional email service. SendGrid has reported latency issues. Top free alternatives to investigate are Mailtrap (100 emails/day), Brevo (300 emails/day), and MailerSend.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] A provider is selected and documented.
      - **7.4.2: Implement Email Sending**
        - **Guidance:** Implement the functionality for sending emails using the chosen email service provider. This will likely involve creating a new service in the `lib` directory.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] The application should be able to send emails.
      - **7.4.3: Create Email Templates**
        - **Guidance:** Create email templates for the different types of notifications that will be sent.
        - **CCR:** C:3, C:9, R:2
        - **Verification:**
          - [ ] The email templates should be created and should be well-designed.
    - **SOTA Best Practices:**
      - **Use a Transactional Email Service:** Use a service like SendGrid or Mailgun to send transactional emails.
      - **Provide an Unsubscribe Link:** All promotional emails should include an unsubscribe link.

### **Business Development & CRM**
  - **8.0: Internal CRM Strategy**
    - **Guidance:** Utilize the existing Supabase database and admin dashboard as a lightweight, internal CRM. This avoids the complexity and cost of integrating a third-party service.
    - **CCR:** C:1, C:10, R:1
    - **Verification:**
      - [ ] The project plan is updated to reflect this decision.
  - **8.1: SEO Optimization**
    - **Guidance:** Implement a comprehensive SEO strategy to improve the visibility of the application in search engine results.
    - **CCR:** C:6, C:8, R:5
    - **Sub-tasks:**
      - **8.1.1: Implement Metadata API**
        - **Guidance:** Use the Next.js Metadata API to define titles, descriptions, and other metadata for each page.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] Each page should have a unique and descriptive title and meta description.
      - **8.1.2: Generate Dynamic Metadata**
        - **Guidance:** Use the `generateMetadata` function to generate dynamic metadata for pages with dynamic content, such as the food truck details page.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] Dynamic pages should have unique and descriptive titles and meta descriptions.
      - **8.1.3: Create `sitemap.xml` and `robots.txt`**
        - **Guidance:** Create `sitemap.xml` and `robots.txt` files to help search engines crawl and index your site.
        - **CCR:** C:2, C:10, R:2
        - **Verification:**
          - [ ] The `sitemap.xml` and `robots.txt` files should be created and should be valid.
      - **8.1.4: Optimize Images**
        - **Guidance:** Use the `next/image` component to optimize images for performance and SEO.
        - **CCR:** C:3, C:9, R:3
        - **Verification:**
          - [ ] All images should be optimized using the `next/image` component.
      - **8.1.5: Implement Structured Data**
        - **Guidance:** Use structured data (e.g., JSON-LD) to provide more information to search engines about your content.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] Structured data should be implemented on the relevant pages.
  - **8.2: Analytics Dashboard**
    - **Guidance:** Implement an analytics dashboard to track key metrics, such as user engagement, traffic sources, and conversion rates.
    - **CCR:** C:5, C:8, R:4
    - **Sub-tasks:**
      - **8.2.1: Choose an Analytics Provider**
        - **Guidance:** Choose an analytics provider, such as Vercel Analytics or Google Analytics.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] An analytics provider should be chosen.
      - **8.2.2: Implement Analytics Tracking**
        - **Guidance:** Implement analytics tracking in the application. This will likely involve adding a tracking script to the `app/layout.tsx` file and sending events from the relevant components.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] Analytics tracking should be implemented and should be sending data to the chosen provider.
      - **8.2.3: Create Analytics Dashboard**
        - **Guidance:** Create a new page in the admin dashboard at `app/admin/analytics/page.tsx` that displays the analytics data.
        - **CCR:** C:4, C:8, R:4
        - **Verification:**
          - [ ] The analytics dashboard should be created at the specified location.
          - [ ] The dashboard should display the analytics data from the chosen provider.
  - **8.4: Revenue Model Implementation**
    - **Guidance:** Implement a revenue model for the application. This could include a subscription model, a freemium model, or a pay-per-use model.
    - **CCR:** C:7, C:7, R:7
    - **Sub-tasks:**
      - **8.4.1: Choose a Revenue Model**
        - **Guidance:** Choose a revenue model for the application.
        - **CCR:** C:2, C:9, R:2
        - **Verification:**
          - [ ] A revenue model should be chosen.
      - **8.4.2: Integrate with Stripe**
        - **Guidance:** Integrate with Stripe to handle payments. This will involve creating a Stripe account, getting API keys, and using the Stripe API to create charges.
        - **CCR:** C:6, C:8, R:6
        - **Verification:**
          - [ ] The application should be able to process payments with Stripe.
      - **8.4.3: Create Pricing Page**
        - **Guidance:** Create a pricing page that clearly explains the different pricing plans and features.
        - **CCR:** C:3, C:9, R:2
        - **Verification:**
          - [ ] The pricing page should be created and should be easy to understand.
    - **SOTA Best Practices:**
      - **Stripe:** Use Stripe to handle payments. It's a secure and easy-to-use platform with a great developer experience.

---

## 🚨 **CONTINGENCY PLANNING**

### **Supabase Auth Outage Fallback**
- **Concern:** A Supabase outage could prevent users from logging in.
- **Proposed Solution:** Implement a fallback authentication system using Firebase Auth.
- **Implementation Details:**
  - **Primary Auth:** Supabase remains the primary authentication provider.
  - **Fallback Auth:** Firebase Auth is used as a fallback.
  - **Custom JWTs:** When a user signs in with Firebase Auth, create a custom JWT that is compatible with Supabase. This JWT should include the user's ID and any other necessary claims (e.g., `role`).
  - **Client-Side Logic:** On the client-side, implement logic to detect if Supabase is unavailable. If it is, redirect the user to a fallback login page that uses Firebase Auth.
  - **Server-Side Logic:** On the server-side, implement logic to verify both Supabase and Firebase JWTs. This will allow you to protect your API routes and server-side rendered pages regardless of which authentication provider is used.
- **Security Risks and Conflicts:**
  - **JWT Security:** It is crucial to ensure that the custom JWTs are signed with a strong secret and that they have a short expiration time.
  - **User Synchronization:** You will need to decide how to handle user synchronization between Supabase and Firebase. For example, if a user signs up with Firebase, will you also create a corresponding user in Supabase?
  - **Complexity:** Implementing a fallback authentication system adds complexity to your application. It's important to weigh the benefits of having a fallback against the added complexity.

---

## 📁 **DOCUMENTATION CONSOLIDATION**

### **Active Documents** (Keep Updated)
- `docs/PROJECT_PLAN.md` - This document (single source of truth)
- `docs/WBS_ROADMAP.md` - Detailed task breakdown (reference)
- `docs/README.md` - Project overview

### **Archive These Documents** (Historical Reference)
- `CONSOLIDATED_LAUNCH_READINESS_PLAN.md` → `docs/archive/`
- `docs/STRATEGIC_LAUNCH_PLAN_REVISED.md` → Already in archive
- `docs/REMAINING_TASKS_SUMMARY.md` → Outdated, can be deleted

### **Specialized Documents** (Keep for Reference)
- `docs/AUTH_ARCHITECTURE.md` - Future authentication planning
- `docs/DATA_QUALITY_GUIDE.md` - Data pipeline documentation
- `docs/UI_DESIGN_GUIDE.md` - Design system documentation

---

## ✅ **SUCCESS METRICS**

### **Current Status**
- [x] Production deployment successful
- [x] Zero build errors
- [x] Core functionality working
- [x] License properly configured
- [ ] Admin security implemented
- [ ] Production monitoring active

### **Next Milestones**
- [ ] 10+ beta testers providing feedback
- [ ] Zero critical ESLint issues
- [ ] Admin dashboard secured
- [ ] Performance optimized for mobile

---

## 🔧 **QUICK REFERENCE**

### **Key Commands**
```bash
# Verify build status
npx tsc --noEmit && npm run build

# Check ESLint issues (cleaned up)
npx eslint . --format=compact

# Test production locally
npm run build && npm start

# Development server
npm run dev
```

### **Environment Setup**
- Node.js 18.17.0+
- All required environment variables configured in Vercel
- Supabase connection working
- GitHub auto-deployment active

### **Next Actions**
1. Verify CRON jobs are working in production
2. Implement admin security
3. Test core user flows (search, map, details)
4. Start collecting user feedback

---

*Last Updated: 2025-07-20*  
*Next Review: Weekly on Sundays*
