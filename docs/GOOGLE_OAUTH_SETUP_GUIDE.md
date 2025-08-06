# Google OAuth Setup Guide for Food Truck Finder

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services > Credentials**
4. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client IDs**

### 1.2 Configure OAuth Client

**Application type:** Web application  
**Name:** Food Truck Finder OAuth  

**Authorized JavaScript origins:**
```
http://localhost:3000
https://food-truck-finder-poc.vercel.app
https://zkwliyjjkdnigizidlln.supabase.co
```

**Authorized redirect URIs:**
```
http://localhost:3000/auth/callback
https://food-truck-finder-poc.vercel.app/auth/callback
https://zkwliyjjkdnigizidlln.supabase.co/auth/v1/callback
```

### 1.3 Download Credentials

After creation, you'll get:
- **Client ID** (looks like: `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (looks like: `GOCSPX-abcdef123456789`)

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `zkwliyjjkdnigizidlln`
3. Navigate to **Authentication > Providers**
4. Enable **Google** provider
5. Enter your Client ID and Client Secret from Step 1.3

### 2.2 Configure Site URL

In **Authentication > URL Configuration**:
- **Site URL:** `https://food-truck-finder-poc.vercel.app`
- **Redirect URLs:** `https://food-truck-finder-poc.vercel.app/auth/callback`

## Step 3: Environment Variables

Add to your `.env.local`:
```bash
# Google OAuth (not needed for frontend, but good to have)
GOOGLE_OAUTH_CLIENT_ID="your-client-id"
GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"
```

## Step 4: Test the Setup

Your existing code should work immediately after these configurations:
- The `AuthOAuthForm` component will trigger OAuth flow
- The `/auth/callback` route will handle the response
- Users will be redirected based on their role

## Step 5: Create Admin User

After OAuth is working, you'll need to manually set up your first admin user:

1. Sign in with Google OAuth
2. Check your `profiles` table in Supabase
3. Update the user's role to 'admin':
   ```sql
   UPDATE profiles 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@gmail.com';
   ```

## Troubleshooting

### Common Issues:

1. **OAuth popup blocked:** Ensure popup blockers are disabled
2. **Redirect URI mismatch:** Double-check all URLs match exactly
3. **Provider not enabled:** Verify Google provider is enabled in Supabase
4. **Rate limiting:** Your code already handles this with proper error messages

### Testing Commands:

```bash
# Test local development
npm run dev
# Navigate to login and try Google OAuth

# Check Supabase logs
# Go to Supabase Dashboard > Logs > Auth
```

## Security Notes

Your implementation already includes:
- ✅ Rate limiting on auth endpoints
- ✅ Audit logging for security events
- ✅ Role-based redirects
- ✅ Device fingerprinting
- ✅ Proper error handling

The OAuth flow is production-ready once the providers are configured.
