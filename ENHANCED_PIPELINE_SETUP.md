# Enhanced Pipeline Setup Guide

## 🚨 Current Issue Resolution

You're getting the error: `ERROR: 42703: column "discovery_method" does not exist`

This means your `discovered_urls` table exists but is missing some columns that the enhanced pipeline expects.

## 🔧 Quick Fix Steps

### Step 1: Fix Database Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of fix-discovered-urls-table.sql
-- This will add all missing columns safely
```

Or simply copy and run the `fix-discovered-urls-table.sql` file I created.

### Step 2: Verify Table Structure

After running the fix, your `discovered_urls` table should have these columns:

- `id` (uuid, primary key)
- `url` (text, unique)
- `status` (text, with check constraint)
- `discovery_method` (text, with check constraint) ← **This was missing**
- `discovered_at` (timestamptz)
- `last_processed_at` (timestamptz)
- `processing_attempts` (integer)
- `notes` (text)
- `metadata` (jsonb)
- `source_directory_url` (text)
- `region` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 🚀 Testing the Enhanced Pipeline

### Option 1: Test API Endpoint

```bash
# Start your development server
npm run dev

# Test the enhanced pipeline
curl -X POST http://localhost:3000/api/enhanced-pipeline \
  -H "Content-Type: application/json" \
  -d '{
    "action": "discovery-only",
    "targetCities": ["Charleston"],
    "maxUrlsToDiscover": 5
  }'
```

### Option 2: Test Components Directly

```bash
# Run the simple test script
node test-pipeline-simple.js
```

## 📋 Enhanced Pipeline Actions Available

### 1. Full Pipeline

```json
{
  "action": "full",
  "maxUrlsToDiscover": 30,
  "maxUrlsToProcess": 15
}
```

### 2. Discovery Only

```json
{
  "action": "discovery-only",
  "targetCities": ["Charleston", "Columbia"],
  "maxUrlsToDiscover": 20
}
```

### 3. Processing Only

```json
{
  "action": "processing-only",
  "maxUrlsToProcess": 25
}
```

### 4. Location-Specific

```json
{
  "action": "location-specific",
  "targetCities": ["Charleston", "Columbia", "Greenville"],
  "maxUrlsToProcess": 10
}
```

## 🔍 What the Enhanced Pipeline Does

### Phase 1: Discovery

- Uses Tavily API to search for food truck URLs
- Validates URLs to filter out irrelevant sites
- Stores discovered URLs in `discovered_urls` table
- Supports location-specific targeting

### Phase 2: Processing

- Fetches URLs with status 'new' from database
- Creates scraping jobs for each URL
- Uses existing Firecrawl + Gemini pipeline
- Updates URL status based on processing results

### Phase 3: Quality Assurance

- Validates data quality scores
- Identifies potential duplicates
- Generates performance reports

## 🎯 Key Improvements Over Original Proposal

✅ **Leverages Existing Infrastructure**

- Uses proven Firecrawl + Gemini pipeline
- Builds on existing queue system
- Maintains current data quality standards

✅ **Intelligent Discovery**

- Multiple discovery strategies
- Smart URL validation and filtering
- Location-specific targeting

✅ **Robust Error Handling**

- Comprehensive error tracking
- Automatic retry logic
- Status-based processing flow

✅ **Scalable Architecture**

- Queue-based processing prevents overload
- Rate limiting protects external APIs
- Configurable processing limits

## 🔧 Troubleshooting

### If you get database errors:

1. Run `fix-discovered-urls-table.sql` in Supabase SQL Editor
2. Verify all columns exist with the query at the end of the script
3. Check your environment variables are set correctly

### If Tavily searches return mock data:

1. Ensure `TAVILY_API_KEY` is set in your `.env.local`
2. The API will use mock data if the key is missing (this is intentional for testing)

### If processing fails:

1. Check that your existing `scraping_jobs` table is working
2. Verify Firecrawl and Gemini API keys are configured
3. Start with small batch sizes (maxUrlsToProcess: 5)

## 📊 Monitoring

The enhanced pipeline provides detailed metrics:

- URLs discovered per phase
- Processing success rates
- Error counts and types
- Performance timing data

## 🎉 Next Steps

1. **Fix Database**: Run the `fix-discovered-urls-table.sql` script
2. **Test Discovery**: Try the discovery-only action first
3. **Monitor Performance**: Start with small batches and scale up
4. **Review Results**: Check the `discovered_urls` and `food_trucks` tables

## 📚 Documentation

- Full documentation: `docs/enhanced-data-pipeline.md`
- API reference: GET `/api/enhanced-pipeline` for endpoint details
- Database schema: `supabase/migrations/010_create_discovered_urls_table.sql`

Your enhanced pipeline is ready to go once you fix the database schema! 🚀
