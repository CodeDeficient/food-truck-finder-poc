# Secret Management & Rotation Plan

**Date Created:** 2025-07-21  
**Status:** ACTIVE - CRITICAL SECURITY UPDATE REQUIRED  
**Next Review:** 2025-10-21  

## 🚨 **CURRENT CRITICAL ISSUE**

**Issue:** CRON_SECRET contains 2024 timestamp - **6+ MONTHS OLD**  
**Risk Level:** **HIGH** - Potential unauthorized access to CRON endpoints  
**Action Required:** **IMMEDIATE** secret regeneration and deployment  

---

## **📋 SECRET INVENTORY**

### **Authentication & Authorization**
| Secret Name | Purpose | Location | Last Updated | Rotation Schedule | Status |
|-------------|---------|----------|--------------|-------------------|--------|
| `CRON_SECRET` | CRON job authentication | Vercel + Local | **2024 (OUTDATED)** | 90 days | 🚨 **CRITICAL** |
| `JWT_SECRET` | API authentication | Vercel + Local | Unknown | 90 days | ⚠️ **AUDIT NEEDED** |
| `SUPABASE_SERVICE_ROLE_KEY` | Database admin access | Vercel + Local | 2024-05-31 | 180 days | ⚠️ **CHECK NEEDED** |

### **Third-Party API Keys**
| Secret Name | Purpose | Location | Last Updated | Rotation Schedule | Status |
|-------------|---------|----------|--------------|-------------------|--------|
| `FIRECRAWL_API_KEY` | Web scraping service | Vercel + Local | 2024-05-31 | 365 days | ✅ **OK** |
| `GEMINI_API_KEY` | AI processing | Vercel + Local | 2024-05-31 | 365 days | ✅ **OK** |
| `GOOGLE_GEMINI_API_KEY` | Alternative AI key | Vercel + Local | Unknown | 365 days | ⚠️ **AUDIT NEEDED** |
| `TAVILY_API_KEY` | Search API | Vercel + Local | Unknown | 365 days | ⚠️ **AUDIT NEEDED** |
| `GOOGLE_API_KEY` | Maps/Location services | Vercel + Local | 2024-06-01 | 365 days | ✅ **OK** |

### **Database & Infrastructure**
| Secret Name | Purpose | Location | Last Updated | Rotation Schedule | Status |
|-------------|---------|----------|--------------|-------------------|--------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public database access | Vercel + Local | 2024-05-31 | 180 days | ⚠️ **CHECK NEEDED** |
| `DATABASE_PASSWORD` | Direct DB connection | Local only | Unknown | 90 days | ⚠️ **AUDIT NEEDED** |

---

## **🔄 ROTATION SCHEDULES**

### **High-Risk Secrets (90 days)**
- `CRON_SECRET` - Protects critical automation
- `JWT_SECRET` - Core authentication
- `DATABASE_PASSWORD` - Direct database access

### **Medium-Risk Secrets (180 days)**
- `SUPABASE_SERVICE_ROLE_KEY` - Database admin
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public database access

### **Low-Risk Secrets (365 days)**
- Third-party API keys (usually managed by providers)

---

## **📍 SECRET LOCATIONS & UPDATE PROCEDURES**

### **Vercel Environment Variables**
```bash
# List current secrets
vercel env ls

# Add/Update secret
vercel env add [SECRET_NAME]
vercel env rm [OLD_SECRET_NAME]  # If renaming

# Pull latest for local development
vercel env pull .env.local
```

### **Local Development**
- File: `.env.local`
- ⚠️ **Never commit this file to git**
- Update from Vercel: `vercel env pull .env.local`

### **Supabase Dashboard**
- Service Role Keys: Project Settings → API
- Database Password: Project Settings → Database
- RLS Policies: May need updates if keys change

---

## **🔧 EMERGENCY ROTATION PROCEDURE**

### **When to Rotate Immediately:**
1. **Security breach suspected**
2. **Secret accidentally exposed** (logs, public repos, etc.)
3. **Key older than maximum age**
4. **Personnel changes** (team member leaves)
5. **Compliance requirements**

### **Emergency Steps:**
1. **Generate new secret** (see tools below)
2. **Update Vercel immediately**
3. **Test all affected endpoints**
4. **Update local development**
5. **Monitor for broken services**
6. **Document the change**

---

## **🛠 SECRET GENERATION TOOLS**

### **High-Security Secrets (CRON_SECRET, JWT_SECRET):**
```bash
# 32-byte base64 encoded
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Alternative: 64-character hex
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **UUIDs (for service identifiers):**
```bash
node -e "console.log(require('crypto').randomUUID())"
```

### **API Keys:**
- Usually provided by service providers
- Check provider dashboard for rotation procedures

---

## **📊 MONITORING & ALERTS**

### **Automated Checks Needed:**
- [ ] **Monthly secret age audit**
- [ ] **Quarterly access log review**
- [ ] **Semi-annual full rotation**

### **Warning Indicators:**
- Secrets approaching expiration (30 days before)
- Failed authentication attempts on CRON endpoints
- Unusual API usage patterns
- Service degradation after key rotations

---

## **🎯 IMMEDIATE ACTION ITEMS**

### **Priority 1: CRITICAL (Today)**
- [ ] **Regenerate CRON_SECRET** with new secure value
- [ ] **Update Vercel production environment**
- [ ] **Update Vercel preview environment**  
- [ ] **Test both CRON endpoints** with new secret
- [ ] **Update local `.env.local`**

### **Priority 2: HIGH (This Week)**
- [ ] **Audit all other secrets** for age/security
- [ ] **Verify JWT_SECRET exists and is secure**
- [ ] **Check Supabase keys are still valid**
- [ ] **Document current secret ages**

### **Priority 3: MEDIUM (This Month)**
- [ ] **Implement automated secret age monitoring**
- [ ] **Create secret rotation calendar**
- [ ] **Set up rotation reminder system**

---

## **📋 TESTING CHECKLIST**

After any secret rotation:

### **CRON_SECRET Testing:**
- [ ] Test `POST /api/cron/auto-scrape` with new secret
- [ ] Test `POST /api/cron/quality-check` with new secret
- [ ] Verify old secret is rejected (401 Unauthorized)
- [ ] Check CRON job logs in Vercel

### **Database Keys Testing:**
- [ ] Test Supabase client connection
- [ ] Verify RLS policies still work
- [ ] Test service role operations

### **API Keys Testing:**
- [ ] Test Firecrawl integration
- [ ] Test Gemini AI processing
- [ ] Test Tavily search functionality

---

## **📚 REFERENCES**

- [OWASP Key Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [NIST SP 800-57 Key Management Guidelines](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)

---

## **🔐 SECRET GENERATION RECORD**

### **CRON_SECRET Rotation Log:**

**Latest Rotation:** 2025-07-21T15:50:49Z
- **Algorithm:** crypto.randomBytes(32).toString('base64')
- **Next Rotation:** 2025-10-21 (90 days)
- **Status:** ⚠️ **REQUIRES MANUAL GENERATION** - Never store actual secrets in documentation
- **Generation Command:** `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

---

*This document should be updated after every secret rotation and reviewed quarterly.*
