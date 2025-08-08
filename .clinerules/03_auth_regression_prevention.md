# Authentication Regression Prevention Rule

**Created:** August 8, 2025  
**Priority:** HIGH  
**Category:** Security & Authentication

## Rule Statement

When working with authentication-related code, ALWAYS verify the following before making changes:

1. **OAuth Flow Integrity**
   - Never modify OAuth handlers without testing both implicit and code flows
   - Ensure social login buttons trigger immediate OAuth flow (no intermediate forms)
   - Maintain support for both GitHub and Google OAuth providers

2. **Hydration Safety**
   - All auth-dependent components must check for client-side mounting before accessing Supabase
   - Use `useState` and `useEffect` patterns to prevent SSR/client mismatches
   - Never access `window` or browser-only APIs during server-side rendering

3. **Session Management**
   - Preserve session persistence across page refreshes
   - Maintain proper role-based redirects after login
   - Ensure logout functionality clears all session data

4. **Security Practices**
   - NEVER expose user emails in client-side code or DOM
   - Use masked placeholders (••••••@••••••) for sensitive data display
   - Implement proper CSRF protection for all auth endpoints

## Implementation Checklist

Before committing any auth-related changes:

- [ ] Test Google OAuth login flow (multiple times)
- [ ] Test GitHub OAuth login flow
- [ ] Verify session persistence after browser refresh
- [ ] Confirm logout properly clears session
- [ ] Check no hydration errors in console
- [ ] Verify no email exposure in DOM or network tab
- [ ] Test role-based redirects work correctly
- [ ] Ensure profile/settings pages load without errors

## Common Pitfalls to Avoid

1. **DO NOT** create separate login paths for admin users
2. **DO NOT** show email/password forms when OAuth button is clicked
3. **DO NOT** redirect users to profile page after login (use homepage or dashboard)
4. **DO NOT** use Proxy objects for Supabase client exports (causes SSR issues)
5. **DO NOT** display actual user emails anywhere in the UI

## Testing Commands

```bash
# Run auth tests
npm run test:auth

# Check for hydration errors
npm run dev
# Then check browser console for hydration warnings

# Verify OAuth configuration
npx supabase status
```

## Related Files

Key authentication files that require extra care:
- `/app/(auth)/login/page.tsx`
- `/app/(auth)/signup/page.tsx`
- `/lib/supabase/client.ts`
- `/app/api/auth/callback/route.ts`
- `/hooks/useAuthHandler.ts`
- `/components/auth/AuthModal.tsx`

## Rollback Procedure

If authentication breaks after changes:

1. Immediately revert to last known working commit
2. Clear browser localStorage and cookies
3. Restart development server
4. Test OAuth flow before proceeding

## References

- [Blog Post: OAuth Social Login Redirect Fix](/blog/oauth-social-login-redirect-fix.md)
- [Blog Post: Authentication Hydration Solution](/blog/authentication-hydration-solution.md)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
