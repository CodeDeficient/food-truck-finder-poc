# Admin Dashboard Full Plan (SOTA, Context7-Informed)

## 1. Architecture & Security

- **Location:** `/admin` route in main Next.js app (can migrate to subdomain if needed).
- **Access Control:**
  - All `/admin` pages require authentication and `admin` role (Supabase Auth + RLS).
  - Middleware protects all admin routes; unauthorized users are redirected.
  - All admin API endpoints check for admin role.
  - Audit logging for all admin actions.
- **Separation of Concerns:**
  - All admin code in `app/admin/`.
  - No admin code imported into user-facing app.

## 2. Core Features (MVP)

- **Dashboard Home:**
  - Overview cards: # of food trucks, pending verifications, pipeline status, recent errors.
- **Food Truck Management:**
  - List, search, filter, and sort food trucks.
  - View/edit truck details (description, menu, prices, locations, status, quality score).
  - Add new food truck manually.
  - Bulk import/update (CSV/JSON).
- **Pipeline Monitoring:**
  - View scraping/processing job queue and status.
  - Retry/trigger jobs manually.
  - View logs/errors for each job.
- **Data Quality Management:**
  - View and edit data quality scores.
  - See flagged/low-quality records and take action.
- **Manual Scraping/Update Triggers:**
  - Trigger scrape/update for a specific truck or all trucks.
  - Schedule future scrapes.

## 3. Advanced Features (Phase 2+)

- **User Management:**
  - Manage admin users and roles.
  - View audit logs of admin actions.
- **Event/Calendar Management:**
  - Manage events and schedules for trucks.
  - Approve/flag submitted events.
- **Analytics:**
  - Visualize trends (new trucks, menu changes, event activity).
  - Export data (CSV/JSON).
- **Notifications:**
  - Email/slack alerts for pipeline failures, new trucks, etc.

## 4. UI/UX Best Practices (Context7 SOTA)

- **Design:**
  - Responsive, mobile-friendly layout.
  - Sidebar navigation, clear breadcrumbs, and search everywhere.
  - Use cards, tables, and modals for clarity.
  - Inline editing and optimistic UI for fast admin workflows.
- **Performance:**
  - Paginate and virtualize large lists.
  - Debounced search/filter.
- **Accessibility:**
  - Full keyboard navigation, ARIA labels, color contrast.
- **Testing:**
  - E2E tests for all admin flows (Playwright/Cypress).
  - Unit tests for all backend logic.
- **Maintainability:**
  - Modular components, clear folder structure, typed API responses.
  - Linting, Prettier, and code review required for all admin code.

## 5. Implementation Steps

1. Middleware for `/admin` route protection.
2. Admin layout (sidebar, header, notifications).
3. Food truck management page (list, edit, add, bulk import).
4. Pipeline monitoring/logs page.
5. Data quality management page.
6. Manual scrape/trigger page.
7. (Phase 2+) User management, event/calendar, analytics, notifications.

---

**References:**

- Context7 SOTA admin dashboard best practices (2024)
- Supabase RLS/auth docs
- Next.js app router patterns
- Vercel/MUI/Chakra admin templates
