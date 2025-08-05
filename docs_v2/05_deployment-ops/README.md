# Deployment & Operations

## Current Data Pipeline Architecture

### GitHub Actions Workflows

The application uses **GitHub Actions** for automated data pipeline operations:

#### 🔄 **Scraping Pipeline**
- **File:** `.github/workflows/scrape-food-trucks.yml`
- **Schedule:** Every 6 hours (`cron: '0 */6 * * *'`)
- **Purpose:** Automated food truck data scraping from web sources
- **Features:**
  - Manual triggering via `workflow_dispatch`
  - Configurable job limits and debug logging
  - Proper error handling and reporting
  - 60-minute timeout protection

#### 📊 **Pipeline Benefits**
- ✅ **Cost Control:** No Vercel CRON job charges
- ✅ **Better Reliability:** GitHub's infrastructure
- ✅ **Enhanced Monitoring:** GitHub Actions logs
- ✅ **Flexible Scheduling:** Easy schedule modifications
- ✅ **Manual Control:** On-demand execution

### Deprecated Infrastructure

⚠️ **Legacy Vercel CRON Jobs (DEPRECATED)**
- `/api/cron/auto-scrape` - Returns 410 Gone
- `/api/cron/quality-check` - Returns 410 Gone
- These have been replaced by GitHub Actions workflows

### Future Enhancements

🔮 **Planned Improvements:**
- Additional GitHub Actions workflows for:
  - Data quality checking
  - Batch job creation in Supabase
  - Enhanced data processing
  - Fallback mechanisms

### Environment Configuration

**Required GitHub Secrets:**
```
GEMINI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FIRECRAWL_API_KEY
```

### Monitoring

- **GitHub Actions Logs:** Primary monitoring source
- **Admin Dashboard:** Manual quality checks and data monitoring
- **Console Logging:** Structured application logs

### Manual Operations

**Admin Dashboard Features:**
- Manual data quality assessment
- Pipeline monitoring
- Job status tracking
- Data cleanup operations

*For detailed workflow configuration, see `.github/workflows/scrape-food-trucks.yml`*
