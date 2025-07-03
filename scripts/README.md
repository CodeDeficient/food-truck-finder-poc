# OAuth Setup & Testing Scripts

This directory contains automated tools for Google OAuth configuration and testing in the Food Truck Finder application.

## 🚀 Quick Start

```bash
# Check current OAuth configuration status
npm run oauth:verify

# Test OAuth flow in development
npm run oauth:test:dev

# Test OAuth flow in production
npm run oauth:test:prod
```

## 📋 Scripts Overview

### 1. OAuth Configuration Verification (`verify-oauth-setup.js`)

**Purpose**: Comprehensive verification of Google OAuth setup status

**Features**:

- Environment variables validation
- Supabase connection testing
- Auth provider configuration check
- Redirect URL validation
- Setup recommendations

**Usage**:

```bash
node scripts/verify-oauth-setup.js
# or
npm run oauth:verify
```

**Output**:

- ✅ Configuration status checks
- ⚠️ Warnings for potential issues
- ❌ Errors that need resolution
- 📋 Step-by-step setup instructions

### 2. OAuth Flow Testing (`test-oauth-flow.js`)

**Purpose**: Automated testing of OAuth flow components

**Features**:

- Login page accessibility testing
- Auth callback route verification
- Supabase connection validation
- Environment configuration checks
- Test report generation

**Usage**:

```bash
# Test development environment
node scripts/test-oauth-flow.js --env=development
npm run oauth:test:dev

# Test production environment
node scripts/test-oauth-flow.js --env=production
npm run oauth:test:prod
```

**Output**:

- 📊 Test results summary
- 📄 Detailed JSON reports in `/reports` directory
- 💡 Recommendations for improvements
- 🔧 Automation commands for next steps

## 🔧 Configuration Requirements

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL="https://zkwliyjjkdnigizidlln.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### Manual Setup Steps

1. **Google Cloud Console**: Create OAuth 2.0 credentials
2. **Supabase Dashboard**: Configure Google provider
3. **Testing**: Verify OAuth flow works correctly

## 📖 Documentation

- **Setup Guide**: `docs/GOOGLE_OAUTH_SETUP_GUIDE.md`
- **API Reference**: `/api/admin/oauth-status` endpoint
- **Development Plan**: See Phase 3.1 in development plan

## 🔍 Troubleshooting

### Common Issues

1. **"OAuth client not found"**

   - Check Google Cloud Console configuration
   - Verify Client ID in Supabase settings

2. **"Redirect URI mismatch"**

   - Ensure redirect URIs match in both Google Console and Supabase
   - Check for typos in URLs

3. **"Provider not found"**
   - Enable Google provider in Supabase Dashboard
   - Verify credentials are saved correctly

### Debug Commands

```bash
# Check configuration status
npm run oauth:verify

# Test specific environment
npm run oauth:test:dev

# Check API status
curl http://localhost:3000/api/admin/oauth-status

# View detailed logs
npm run dev # Check console output during OAuth flow
```

## 📊 Test Reports

Test reports are automatically generated in the `/reports` directory:

```
reports/
├── oauth-test-development-[timestamp].json
├── oauth-test-production-[timestamp].json
└── ...
```

Each report includes:

- Test execution summary
- Individual test results
- Environment configuration
- Recommendations for improvements

## 🔄 Integration with Development Workflow

### Before OAuth Setup

1. Run `npm run oauth:verify` to check prerequisites
2. Follow recommendations in the output
3. Complete manual setup steps

### After OAuth Setup

1. Run `npm run oauth:test:dev` to verify development setup
2. Run `npm run oauth:test:prod` to verify production setup
3. Monitor `/api/admin/oauth-status` for ongoing status

### Continuous Monitoring

- OAuth status is available via API endpoint
- Admin dashboard shows real-time configuration status
- Automated alerts for configuration issues

## 🛡️ Security Considerations

- Scripts never log sensitive credentials
- OAuth credentials are validated but not exposed
- Test reports exclude sensitive information
- All network requests use secure protocols

## 🚀 Next Steps

After successful OAuth setup:

1. Test login flow manually at `/login`
2. Verify admin role assignment
3. Update admin user email to `zabrien@gmail.com`
4. Monitor OAuth usage in admin dashboard

## 📞 Support

For issues with OAuth setup:

1. Check the setup guide: `docs/GOOGLE_OAUTH_SETUP_GUIDE.md`
2. Run verification scripts for automated diagnosis
3. Review test reports for detailed error information
4. Check Supabase Auth logs for additional context
