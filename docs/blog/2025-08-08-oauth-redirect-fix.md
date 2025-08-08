# OAuth Social Login Redirect Fix: Streamlining User Experience

**Author:** Claude 4.1 Opus (working with Daniel King)  
**Date:** August 8, 2025

---

## 1. The Problem: Broken OAuth Flow & Poor UX

After our recent authentication system overhaul, we discovered that Google OAuth social login had completely broken. Users attempting to sign in with Google were experiencing:

- **500 Internal Server Errors** after successful Google authentication
- **Redirect loops** bouncing between login page and callback routes
- **Token fragments in URLs** (`#access_token=...`) not being processed
- **Poor UX** - users being sent to profile pages instead of returning to the homepage

The root cause? A cascade of issues stemming from improper Supabase client initialization in server-side route handlers and mismatched OAuth flow implementations.

## 2. Technical Deep Dive: Understanding the Failure

### The Supabase Client Export Problem

Our callback route was importing the Supabase client from a barrel export that used a complex Proxy pattern:

```typescript
// The problematic import
import { supabase } from '@/lib/supabase';

// Which was exporting through multiple re-exports
export * from './supabase/client.js';
```

This caused the server-side route handler to fail when trying to access `supabase.auth.exchangeCodeForSession()`.

### OAuth Flow Mismatch

Supabase was returning authentication tokens as URL fragments (after `#`) which server-side route handlers cannot read:

```
http://localhost:3000/login?error=no_code#access_token=eyJhbG...
```

This is the "implicit flow" behavior, but our callback route expected the "authorization code flow" with `?code=...` query parameters.

## 3. The Multi-Layered Solution

### Layer 1: Fix Server-Side Supabase Client

We updated the callback route to create its own Supabase client directly:

```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  // Create Supabase client for this request
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect(`${origin}/login?error=config`);
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  // ... rest of handler
}
```

### Layer 2: Client-Side Token Handler

We created a new client-side handler to process tokens from URL fragments:

```typescript
// app/auth/handler/page.tsx
'use client';

export default function AuthHandler() {
  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        
        if (accessToken && refreshToken) {
          const { getSupabase } = await import('@/lib/supabase/client');
          const supabase = getSupabase();
          
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          // ... redirect logic
        }
      }
    };
    handleAuth();
  }, []);
}
```

### Layer 3: Fix Hook Client Initialization

Updated authentication hooks to only call `getSupabase()` inside event handlers:

```typescript
// components/auth/useAuthModal.ts
const handleOAuthSignIn = async (provider: Provider) => {
  if (!mounted) return;
  
  const supabase = getSupabase(); // Only call when mounted
  // ... OAuth logic
};
```

### Layer 4: Improve User Experience

Most importantly, we fixed the redirect logic to send users back to the homepage (map view) after login:

```typescript
// Before: Complex role-based redirects to profile/admin/owner pages
switch (profile?.role) {
  case 'admin':
    router.push('/admin');
    break;
  case 'food_truck_owner':
    router.push('/owner-dashboard');
    break;
  default:
    router.push('/profile');
}

// After: Simple, user-friendly approach
if (redirectTo === '/') {
  // For regular login, everyone goes to homepage
  router.push('/');
}
```

## 4. Results & Impact

The comprehensive fix delivered:

### ✅ **Working OAuth Flow**
- Google social login now works seamlessly
- Proper token handling for both implicit and code flows
- No more 500 errors or redirect loops

### ✅ **Better User Experience**
- Users return to the homepage (map) after login - what they actually want
- No forced navigation to profile pages
- Smooth, intuitive authentication flow

### ✅ **Robust Architecture**
- Dual-handler approach supports both OAuth flows
- Proper SSR/client separation
- Clean error handling and fallbacks

## 5. Key Lessons Learned

### Server-Side Pitfalls
- **Don't rely on complex exports** in server-side route handlers
- **Create dedicated clients** for server-side operations
- **Handle both OAuth flows** - implicit (fragments) and code flow

### User Experience Principles
- **Users want to continue their journey**, not be redirected to profile pages
- **Homepage is home** - return users there after authentication
- **Keep it simple** - complex role-based redirects can wait until needed

### Testing Insights
- **Test in incognito mode** to avoid session conflicts
- **Check URL fragments** not just query parameters
- **Verify both OAuth initiation and callback** handling

## 6. What's Next

With OAuth working properly, we can focus on:

- **Launch readiness** - Final testing and polish
- **User onboarding** - Welcome flows and tutorials
- **Feature completion** - Food truck owner dashboards
- **Performance optimization** - Map loading and data queries

The authentication system is now truly production-ready, providing a solid foundation for our upcoming launch.

---