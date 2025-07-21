# CRON Job Fix Documentation

## Issue Summary

The CRON jobs were reporting success but data wasn't persisting to the database. Investigation revealed:

- **79 trucks reported as processed** but only **9 trucks in database**
- **82 scraping jobs stuck in "running" status** (some for weeks)
- Last successful job completion was in June 2025

## Root Cause

The issue was in the `triggerScrapingProcess` function in `lib/autoScraper.ts`:

```typescript
processScrapingJob(job.id).catch((error) => {
  console.error('Failed to process scraping job:', error);
});
```

This is a **fire-and-forget pattern** that doesn't wait for job completion. The problems:

1. **Vercel Function Timeout**: Hobby plan has 10-second timeout limit
2. **Async Processing**: Jobs start processing but the function returns immediately
3. **Silent Failures**: Jobs timeout after function returns, leaving them in "running" status

## Solution Architecture

### 1. Split Job Creation and Processing

Instead of processing jobs immediately, we:
- Create jobs in the CRON handler (lightweight, fast)
- Process jobs in a separate endpoint with proper timeout handling

### 2. New Components

#### `/api/cron/auto-scrape` (Modified)
- Only creates scraping jobs
- Prioritizes new URLs (priority: 10) vs existing (priority: 5)
- Returns quickly to avoid timeout

#### `/api/process-jobs` (New)
- Processes pending jobs in batches
- Respects Vercel timeout limits
- Handles failures gracefully

### 3. Implementation Details

```typescript
// Job creation (CRON)
- Check URLs to scrape
- Create jobs with priorities
- Complete within 8 seconds

// Job processing (Separate)
- Process up to 5 jobs per invocation
- 5-second timeout per job
- Mark failed jobs appropriately
```

## Usage

### 1. Reset Stuck Jobs
```bash
node scripts/reset-stuck-jobs.js
```

### 2. Test Job Processing
```bash
# Create jobs
curl -X POST https://your-app.vercel.app/api/cron/auto-scrape \
  -H "Authorization: Bearer $CRON_SECRET"

# Process jobs
curl -X POST https://your-app.vercel.app/api/process-jobs \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 3. Setup Vercel CRON

In `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-scrape",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/process-jobs",
      "schedule": "*/10 * * * *"
    }
  ]
}
```

## Monitoring

Check job status:
```bash
node scripts/check-cron-issue.js
```

## Future Improvements

1. **Upgrade to Vercel Pro**: Longer function timeouts (300s)
2. **Use Queue Service**: Implement proper job queue (BullMQ, SQS)
3. **Background Workers**: Use dedicated job processors
4. **Batch Processing**: Process multiple URLs in single Firecrawl/Gemini call

## Key Learnings

1. **Respect Platform Limits**: Always design for platform constraints
2. **Avoid Fire-and-Forget**: Track async operations properly
3. **Fail Gracefully**: Handle timeouts and mark jobs appropriately
4. **Monitor Continuously**: Regular checks prevent silent failures
