# AUTH UI IMPACT ANALYSIS

## Step 2: High-Level File Impact & Dependency Map

### Associated Files Enumeration

**Core Authentication Files:**
- `app/auth/AuthProvider.tsx` - Main authentication context provider
- `components/home/AppHeader.tsx` - Application header component
- `lib/auth/authHelpers.ts` - Authentication utility functions

**New Auth UI Components (Identified):**
- `app/login/page.tsx` - Login page with email/Google auth
- `components/login/EmailFormFields.tsx` - Email form input fields
- `components/admin/UserMenu.tsx` - User dropdown menu component

### Direct Dependencies Matrix

| File | Imports AuthProvider | Imports supabase.auth | Direct Auth Dependency | Role |
|------|---------------------|----------------------|------------------------|------|
| `app/auth/AuthProvider.tsx` | ❌ | ✅ (lines 16, 40, 52) | Core Provider | Context Provider |
| `app/admin/layout.tsx` | ✅ (line 9) | ❌ | High | Layout Wrapper |
| `hooks/useAdminAuth.ts` | ✅ (line 1) | ❌ | High | Hook Consumer |
| `hooks/useAuthHandlers.ts` | ❌ | ✅ (lines 51, 63, 110) | High | Auth Actions |
| `app/login/page.tsx` | ❌ | ❌ | Medium | UI Consumer |
| `components/admin/UserMenu.tsx` | ❌ | ❌ | Medium | UI Consumer |
| `app/access-denied/page.tsx` | ❌ | ✅ (line 83) | Medium | Auth Action |
| `app/user-dashboard/page.tsx` | ❌ | ✅ (lines 47, 97) | Medium | Auth Check |
| `app/owner-dashboard/page.tsx` | ❌ | ✅ (lines 54, 104) | Medium | Auth Check |
| `lib/auth/authHelpers.ts` | ❌ | ✅ (line 9) | High | Utility |
| `components/home/AppHeader.tsx` | ❌ | ❌ | Low | UI Only |

### Indirect Dependencies Matrix

| File | Uses useAuth Hook | Auth State Dependent | Role-Based Logic | Impact Level |
|------|------------------|---------------------|------------------|--------------|
| `components/admin/UserMenu.tsx` | ✅ (via props) | ✅ | ✅ | High |
| `app/admin/layout.tsx` | ✅ (via useAdminAuth) | ✅ | ✅ | High |
| `hooks/useAdminAuth.ts` | ✅ (line 17) | ✅ | ✅ | High |
| `app/login/page.tsx` | ❌ | ✅ (via useAuthHandlers) | ✅ | Medium |
| `app/access-denied/page.tsx` | ❌ | ✅ | ❌ | Medium |
| `app/user-dashboard/page.tsx` | ❌ | ✅ | ✅ | Medium |
| `app/owner-dashboard/page.tsx` | ❌ | ✅ | ✅ | Medium |
| `components/login/EmailFormFields.tsx` | ❌ | ❌ | ❌ | Low |
| `components/home/AppHeader.tsx` | ❌ | ❌ | ❌ | Low |

### Authentication Flow Dependencies

**supabase.auth Usage Analysis:**
```
lib/auth/authHelpers.ts:9          - supabase.auth.getUser()
hooks/useAuthHandlers.ts:51         - supabase.auth.signInWithPassword()
hooks/useAuthHandlers.ts:63         - supabase.auth.getUser()
hooks/useAuthHandlers.ts:110        - supabase.auth.signInWithOAuth()
app/auth/AuthProvider.tsx:16        - supabase.auth.signOut()
app/auth/AuthProvider.tsx:40        - supabase.auth.getSession()
app/auth/AuthProvider.tsx:52        - supabase.auth.onAuthStateChange()
app/access-denied/page.tsx:83       - supabase.auth.signOut()
app/user-dashboard/page.tsx:47      - supabase.auth.getUser()
app/user-dashboard/page.tsx:97      - supabase.auth.signOut()
app/owner-dashboard/page.tsx:54     - supabase.auth.getUser()
app/owner-dashboard/page.tsx:104    - supabase.auth.signOut()
```

### Impact Risk Assessment (CCR C:3 Cl:3 R:4)

**Complexity (C:3):**
- Multiple auth flows (email, OAuth, session management)
- Role-based routing logic
- Context provider state management

**Clarity (Cl:3):**
- Well-defined separation of concerns
- Clear import paths and dependencies
- Documented component interfaces

**Risk (R:4):**
- Auth changes affect critical user flows
- Multiple dashboard pages depend on auth state
- Breaking auth context breaks entire admin system

### Runtime Dependencies

**Auth Context Flow:**
1. `app/admin/layout.tsx` wraps with `<AuthProvider>`
2. `hooks/useAdminAuth.ts` consumes auth context via `useAuth()`
3. `components/admin/UserMenu.tsx` receives user state as props
4. Dashboard pages check auth state on load

**Critical Dependencies:**
- Admin layout requires AuthProvider wrapper
- All admin components depend on useAuth hook
- Dashboard routing depends on user role
- Sign-out functionality used across multiple components

### Verification Status
✅ **COMPLETED** - AUTH_UI_IMPACT.md committed with comprehensive dependency analysis

**Files Analyzed:** 11 core auth-related files  
**Direct Dependencies:** 6 high-impact files  
**Indirect Dependencies:** 5 medium-impact files  
**supabase.auth Usage:** 12 distinct calls across 7 files

**Recommendations:**
1. Any changes to AuthProvider.tsx require testing of all admin pages
2. supabase.auth API changes must be verified in 7+ files
3. Role-based routing changes affect 4 dashboard implementations
4. Auth UI changes should maintain existing useAuth hook interface
