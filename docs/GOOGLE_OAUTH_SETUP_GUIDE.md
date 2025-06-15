# Google OAuth Setup Guide for Food Truck Finder

## Overview
This guide provides step-by-step instructions to configure Google OAuth authentication for the Food Truck Finder application using Supabase Auth.

**🚀 Quick Start:** Run `node scripts/verify-oauth-setup.js` to check your current configuration status.

## Prerequisites
- Supabase project: `zkwliyjjkdnigizidlln`
- Google Cloud Console access
- Admin access to Supabase dashboard
- Node.js installed for running verification scripts

## 🔧 Automated Verification Tools

Before starting manual configuration, use these tools to verify your setup:

```bash
# Check current OAuth configuration status
node scripts/verify-oauth-setup.js

# Test OAuth flow (after configuration)
node scripts/test-oauth-flow.js --env=development
node scripts/test-oauth-flow.js --env=production
```

## Step 1: Google Cloud Console Setup

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "New Project" or select existing project
3. Name: "Food Truck Finder Auth"
4. Click "Create"

### 1.2 Enable Required APIs
1. Navigate to "APIs & Services" > "Library"
2. Search for and enable these APIs:
   - **Google+ API** (for user profile access)
   - **Google Identity and Access Management (IAM) API** (recommended)
3. Click "Enable" for each

### 1.3 Configure OAuth Consent Screen
1. Go to "APIs & Services" > "OAuth consent screen"
2. Select **"External"** user type (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: "Food Truck Finder"
   - **User support email**: `user@example.com`
   - **App logo**: (optional, but recommended for production)
   - **App domain**: `food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app`
   - **Developer contact**: `user@example.com`
4. **Scopes**: Add these essential scopes:
   - `../auth/userinfo.email` (to access user's email)
   - `../auth/userinfo.profile` (to access user's basic profile)
   - `openid` (for OpenID Connect)
5. **Test users** (for development): Add `user@example.com`
6. Save and continue through all steps

### 1.4 Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. **Application type**: "Web application"
4. **Name**: "Food Truck Finder Web Client"
5. **Authorized JavaScript origins**:
   ```
   https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app
   http://localhost:3000
   http://localhost:3001
   ```
6. **Authorized redirect URIs**:
   ```
   https://zkwliyjjkdnigizidlln.supabase.co/auth/v1/callback
   https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```
7. Click "Create"
8. **🔑 IMPORTANT**: Copy and securely save:
   - **Client ID** (starts with numbers, ends with `.apps.googleusercontent.com`)
   - **Client Secret** (random string)

> ⚠️ **Security Note**: Never commit these credentials to version control!

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to [Supabase Dashboard](https://app.supabase.com/project/zkwliyjjkdnigizidlln/auth/providers)
2. Navigate to "Authentication" > "Providers"
3. Find **"Google"** in the list and toggle it **ON**
4. Enter your Google OAuth credentials from Step 1.4:
   - **Client ID**: Paste your Google Client ID (ends with `.apps.googleusercontent.com`)
   - **Client Secret**: Paste your Google Client Secret
5. **Skip nonce check**: Leave this **unchecked** for production (check only for local development if needed)
6. Click **"Save"**

### 2.2 Configure Site URL and Redirect URLs
1. In the same Supabase Auth settings, go to "URL Configuration"
2. **Site URL**: Set to production URL:
   ```
   https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficient-projects.vercel.app
   ```
3. **Additional Redirect URLs**: Add these for development and production:
   ```
   https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficient-projects.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   ```
4. Click **"Save"**

### 2.3 Verify Authentication Settings
1. Check that **"Enable email confirmations"** is configured as needed
2. Ensure **"Enable signup"** is enabled if you want new users to register
3. Review **"JWT expiry"** settings (default 3600 seconds is fine)
4. Save any changes

## Step 3: Environment Variables (Already Configured)

The following environment variables are already set in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://zkwliyjjkdnigizidlln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[Already configured]"
SUPABASE_SERVICE_ROLE_KEY="[Already configured]"
```

## Step 4: Testing OAuth Flow

### 4.1 Development Testing
1. Start development server: `npm run dev`
2. Navigate to: `http://localhost:3000/login`
3. Click "Google" button
4. Complete OAuth flow
5. Verify redirect to admin dashboard

### 4.2 Production Testing
1. Deploy to Vercel (if not already deployed)
2. Navigate to production login page
3. Test Google OAuth flow
4. Verify admin role assignment

## Step 5: Admin User Configuration

### 5.1 Update Admin User Email
The current admin placeholder `admin@example.com` should be replaced with `user@example.com`:

1. In Supabase Dashboard > Authentication > Users
2. Find the admin user
3. Update email to `user@example.com`
4. Ensure role is set to `admin` in profiles table

### 5.2 Verify Role-Based Access
1. Test login with `user@example.com`
2. Verify access to `/admin` routes
3. Test non-admin user access (should be denied)

## Security Considerations

### Environment Variables
- Never commit OAuth credentials to version control
- Use different credentials for development and production
- Rotate credentials regularly

### Redirect URI Security
- Only add trusted domains to authorized redirect URIs
- Use HTTPS in production
- Validate redirect_to parameters

### User Verification
- Implement email verification for new users
- Monitor OAuth login attempts
- Set up audit logging for admin actions

## Troubleshooting

### Common Issues
1. **"OAuth client not found"**: Check Client ID configuration
2. **"Redirect URI mismatch"**: Verify redirect URIs in Google Console
3. **"Access denied"**: Check OAuth consent screen configuration
4. **"Invalid client"**: Verify Client Secret in Supabase

### Debug Steps
1. Check browser console for errors
2. Verify Supabase Auth logs
3. Test with different browsers/incognito mode
4. Check Google Cloud Console audit logs

## Completion Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth 2.0 credentials created
- [ ] Google provider enabled in Supabase
- [ ] Redirect URIs configured
- [ ] Admin user email updated to `user@example.com`
- [ ] Development OAuth flow tested
- [ ] Production OAuth flow tested
- [ ] Role-based access verified

## Next Steps

After completing OAuth setup:
1. Update development plan to mark Phase 3.1.1-3.1.4 as complete
2. Test admin dashboard access with Google OAuth
3. Implement audit logging for admin actions
4. Configure additional security measures (2FA, session management)

---

**Status**: Ready for implementation
**Priority**: HIGH (Phase 3.1.1-3.1.4)
**Estimated Time**: 15 minutes setup + 5 minutes testing
