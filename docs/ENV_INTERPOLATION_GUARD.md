# Environment Interpolation Regression Guard

## Overview

The environment interpolation regression guard prevents environment variable interpolation tokens (like `${VARIABLE_NAME}`) from accidentally being deployed to production. This guard runs automatically as part of the build process and fails the build if any interpolation tokens are found in `.env.local`.

## How It Works

### Automated Check (CI/Production)

The regression guard is automatically triggered during:

1. **Prebuild Step**: Runs automatically before `npm run build`
2. **Vercel Deployments**: Vercel runs `npm run build` which triggers the prebuild check
3. **Local Development**: Any time you run `npm run build` locally

### Manual Check

You can manually run the check at any time:

```bash
npm run env:check
```

## What It Checks

The script scans `.env.local` for patterns like:
- `${VARIABLE_NAME}`
- `${API_KEY}`
- `${SECRET_TOKEN}`
- Any other `${...}` interpolation syntax

## Success vs Failure

### ✅ Success (Exit Code 0)
- No `.env.local` file exists
- `.env.local` exists but contains no interpolation tokens
- All environment variables have actual values

### ❌ Failure (Exit Code 1)
- `.env.local` contains `${...}` interpolation tokens
- Build process stops immediately
- Clear error message with line numbers and affected variables

## Example Output

### When Interpolation is Found (Fails Build)
```
❌ FAIL: Environment variable interpolation detected in .env.local

The following lines contain interpolation tokens that should be replaced with actual values:
================================================================================
Line 4: CRON_SECRET="${CRON_SECRET}"
  → Interpolation tokens: ${CRON_SECRET}
Line 8: FIRECRAWL_API_KEY="${FIRECRAWL_API_KEY}"
  → Interpolation tokens: ${FIRECRAWL_API_KEY}

💡 To fix this issue:
  1. Replace ${VARIABLE_NAME} tokens with actual secret values
  2. Ensure all environment variables are properly set
  3. Re-run the build after fixing the interpolation

⚠️  This check prevents builds with unresolved environment variable placeholders
```

### When No Interpolation is Found (Passes)
```
✅ PASS: No environment variable interpolation found in .env.local
```

## Fixing Interpolation Issues

When the guard fails, you need to replace interpolation tokens with actual values:

### Before (Fails)
```env
CRON_SECRET="${CRON_SECRET}"
FIRECRAWL_API_KEY="${FIRECRAWL_API_KEY}"
GEMINI_API_KEY="${GEMINI_API_KEY}"
```

### After (Passes)
```env
CRON_SECRET="your-actual-cron-secret-here"
FIRECRAWL_API_KEY="fc-1234567890abcdef"
GEMINI_API_KEY="AIzaSyABC123DEF456GHI789JKL"
```

## Integration Points

### package.json Scripts
- `prebuild`: Runs automatically before `build`
- `env:check`: Manual check command
- `build`: Triggers prebuild which runs the guard

### CI/CD Integration
- **Vercel**: Automatically runs during deployment builds
- **GitHub Actions**: Can be added to workflow files
- **Local Development**: Runs when building locally

## Files

- **Script**: `scripts/check-env-interpolation.mjs`
- **Package Config**: `package.json` (prebuild script)
- **Documentation**: This file

## Why This Matters

Environment variable interpolation tokens in production can cause:
- **Application Failures**: Undefined or literal `${VAR}` strings in config
- **Security Issues**: Exposed placeholder text instead of actual secrets
- **Debugging Nightmares**: Hard-to-trace configuration problems
- **Runtime Errors**: Missing API keys causing service failures

The regression guard catches these issues before they reach production, ensuring that all environment variables are properly resolved.

## Troubleshooting

### Guard Passes But App Still Fails
- Check that actual environment variable values are correct
- Verify environment variables are available at runtime
- Ensure variables are properly loaded in the application

### Guard Fails in CI But Not Locally
- Check if `.env.local` exists in your repository (it shouldn't be committed)
- Verify CI is using the correct environment setup
- Ensure secrets are properly configured in your deployment platform

### Need to Bypass the Guard (Emergency)
```bash
# Skip prebuild and build directly (NOT RECOMMENDED)
NODE_ENV=production npx next build
```

⚠️ **Warning**: Bypassing the guard defeats its purpose and may cause production issues.

## Related Scripts

- `scripts/list-interpolated-vars.mjs`: Comprehensive analysis tool (doesn't fail builds)
- `scripts/check-env-interpolation.mjs`: Regression guard (fails builds)
