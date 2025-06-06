# Admin Dashboard Architecture

## Chosen Approach: Integrated Admin Route with Robust Access Control

- **Location:** `/admin` route within the main Next.js app (not a separate app or subdomain for now).
- **Access Control:**
  - All `/admin` pages require authentication.
  - Only users with an `admin` role (stored in Supabase Auth or a roles table) can access admin features.
  - Use Supabase RLS and middleware to enforce access control at both the API and UI level.
- **Separation of Concerns:**
  - All admin components, pages, and logic live under `app/admin/`.
  - No admin code is imported into user-facing pages/components.
- **Scalability:**
  - If stricter separation is needed in the future, the admin dashboard can be moved to a subdomain or separate app with minimal refactoring.
- **Security:**
  - All admin API endpoints check for admin role.
  - Consider rate limiting and audit logging for admin actions.
- **Maintainability:**
  - Modularize admin features (data editing, pipeline monitoring, quality management) as separate components/pages under `app/admin/`.

## Implementation Plan

1. **Middleware:**
   - Add middleware to protect all `/admin` routes, redirecting unauthenticated or unauthorized users.
2. **Admin Layout:**
   - Create a shared layout for admin pages (sidebar, header, etc.).
3. **Role Management:**
   - Store user roles in Supabase (either in the `users` table or a dedicated `roles` table).
   - Use Supabase RLS to restrict sensitive data/actions to admins.
4. **Core Features:**
   - View/Edit food truck data
   - Monitor pipeline status/logs
   - Manage data quality scores
   - Trigger manual scrapes/updates
5. **Future:**
   - If needed, move admin dashboard to a subdomain or separate app for stricter isolation.
