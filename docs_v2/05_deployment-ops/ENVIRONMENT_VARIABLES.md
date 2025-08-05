# Environment Variables Configuration

This document provides comprehensive guidance for managing environment variables across all deployment environments.

---

## 🔧 **Required Environment Variables**

### **Supabase Database**
```bash
# Client-side (public) - Required for frontend database access
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Server-side only - Required for backend database operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### **AI Services**
```bash
# Gemini AI API - Required for content processing
GEMINI_API_KEY=your_gemini_api_key_here

# Alternative Gemini key (legacy support)
GOOGLE_API_KEY=your_google_api_key_here
```

### **Web Scraping Services**
```bash
# Firecrawl API - Required for web scraping
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Tavily Search API - Optional for discovery features
TAVILY_API_KEY=your_tavily_api_key_here
```

### **Optional Services**
```bash
# Google Maps/Location services (if using Google location features)
GOOGLE_MAPS_API_KEY=your_maps_api_key_here
```

---

## 🌍 **Environment-Specific Configuration**

### **Development (.env.local)**
For local development, create a `.env.local` file in the project root:

```bash
# Supabase (Development Project)
NEXT_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_anon_key
SUPABASE_SERVICE_ROLE_KEY=dev_service_key

# AI Services (Development/Testing Keys)
GEMINI_API_KEY=dev_gemini_key
FIRECRAWL_API_KEY=dev_firecrawl_key

# Optional
TAVILY_API_KEY=dev_tavily_key
```

**Important**: 
- ✅ `.env.local` is automatically ignored by Git
- ❌ Never commit actual API keys to version control
- 🔄 Use `vercel env pull .env.local` to sync from Vercel

### **Production (Vercel)**
Set environment variables in Vercel dashboard:

```bash
# Navigate to Vercel project settings
vercel env ls                    # List current variables
vercel env add VARIABLE_NAME     # Add new variable
vercel env rm OLD_VARIABLE       # Remove old variable
```

### **GitHub Actions**
Required secrets for automated workflows:

```bash
# In GitHub repository → Settings → Secrets and variables → Actions
GEMINI_API_KEY                   # For AI processing
NEXT_PUBLIC_SUPABASE_URL         # For database access
NEXT_PUBLIC_SUPABASE_ANON_KEY    # For database access
SUPABASE_SERVICE_ROLE_KEY        # For database operations
FIRECRAWL_API_KEY               # For web scraping
```

---

## 🔒 **Security Best Practices**

### **Variable Naming Conventions**
- **Client-side variables**: Must use `NEXT_PUBLIC_` prefix
- **Server-side variables**: No prefix (automatically secure)
- **Secrets**: Never include in client-side variables

### **Key Management**
```bash
# ✅ Secure server-side (hidden from client)
SUPABASE_SERVICE_ROLE_KEY=secret_key
GEMINI_API_KEY=secret_key

# ✅ Public client-side (safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anon_key_safe_for_client

# ❌ Never do this (exposes secrets to client)
NEXT_PUBLIC_SECRET_KEY=secret_key  # Wrong!
```

### **Environment Validation**
The application validates required environment variables at startup:

```typescript
// Example validation in your app
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'GEMINI_API_KEY',
  'FIRECRAWL_API_KEY'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

---

## 🔄 **Variable Management Workflows**

### **Local Development Setup**
```bash
# 1. Clone repository
git clone your-repo-url
cd your-project

# 2. Install dependencies
npm install

# 3. Get environment variables from Vercel
vercel env pull .env.local

# 4. Verify variables are loaded
npm run dev
```

### **Adding New Variables**
```bash
# 1. Add to Vercel (production)
vercel env add NEW_VARIABLE_NAME

# 2. Add to GitHub Actions secrets (if needed for workflows)
# Go to GitHub → Settings → Secrets → Actions

# 3. Update local development
vercel env pull .env.local

# 4. Update this documentation
# Add variable to required/optional sections above
```

### **Rotating Secrets**
```bash
# 1. Generate new secret (varies by service)
# 2. Update in Vercel
vercel env add OLD_VARIABLE_NAME  # With new value
# 3. Update in GitHub Actions (if applicable)
# 4. Update local development
vercel env pull .env.local
# 5. Test all functionality
# 6. Remove old secret from provider (Supabase, Google, etc.)
```

---

## 🧪 **Testing Environment Variables**

### **Local Testing**
```bash
# Test environment loading
npm run build    # Should succeed without errors
npm run dev      # Should start without missing variable errors
```

### **Production Testing**
```bash
# Test deployment
vercel --prod    # Deploy to production
# Check deployment logs for any missing variable errors
```

### **GitHub Actions Testing**
```bash
# Trigger manual workflow run
# Check action logs for any missing secrets errors
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Missing environment variable" errors**
```bash
# Check if variable exists in current environment
echo $VARIABLE_NAME

# For Next.js, check if client variables have NEXT_PUBLIC_ prefix
echo $NEXT_PUBLIC_SUPABASE_URL

# Reload environment variables
vercel env pull .env.local
```

#### **Variables not updating**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Redeploy on Vercel
vercel --prod
```

#### **GitHub Actions secrets not working**
- Verify secret names match exactly (case-sensitive)
- Check that secrets are set in the correct repository
- Ensure workflow has access to secrets

### **Environment Variable Conflicts**
The application handles multiple API keys gracefully:

```bash
# If both are set, GOOGLE_API_KEY takes precedence
GOOGLE_API_KEY=key1
GEMINI_API_KEY=key2
# Result: Uses GOOGLE_API_KEY

# Logs will show: "Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using GOOGLE_API_KEY."
```

---

## 📋 **Environment Variables Checklist**

### **Development Setup**
- [ ] `.env.local` file created
- [ ] All required variables set
- [ ] `npm run dev` starts successfully
- [ ] Database connection working
- [ ] AI services responding

### **Production Deployment**
- [ ] All variables set in Vercel dashboard
- [ ] Build succeeds on Vercel
- [ ] Application functions correctly in production
- [ ] No console errors about missing variables

### **GitHub Actions**
- [ ] All required secrets set in GitHub
- [ ] Workflow runs successfully
- [ ] No secret-related errors in action logs

---

## 📚 **Related Documentation**

- [Supabase Environment Setup](https://supabase.com/docs/guides/getting-started/local-development)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

*Last Updated: January 2025*  
*This document is automatically updated as environment requirements change.*
