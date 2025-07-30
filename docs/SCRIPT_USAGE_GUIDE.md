# Script Usage Guide

**Date**: July 29, 2025
**Author**: Cline AI Assistant

## Purpose

This guide provides clear documentation on which scripts to use for specific tasks to avoid confusion with similarly named scripts in the `scripts/` directory.

## Current Verification Pipeline Scripts

### 1. Data Quality Verification Scripts

#### `scripts/get-unknown-trucks.js`
- **Purpose**: Check for any "Unknown Food Truck" placeholder entries in the database
- **When to use**: After job processing to verify no invalid data was created
- **Expected output**: Should return "No 'Unknown Food Truck' entries found" after our fixes

#### `scripts/check-current-state.js`
- **Purpose**: Get overall system statistics including truck counts, job statuses, and duplicate checks
- **When to use**: General system health check and verification
- **Expected output**: Shows 82 total food trucks, 0 duplicates, and job statistics

#### `scripts/check-jobs-table.js`
- **Purpose**: Check scraping_jobs table structure and available job types
- **When to use**: Verify job table schema and job type enum values
- **Expected output**: Lists all table fields and available job_type values

### 2. Job Management Scripts

#### `scripts/safe-convert-discovered-to-jobs.js` ✅ (RECOMMENDED)
- **Purpose**: Safely convert discovered URLs to pending scraping jobs with quality checks
- **When to use**: Creating new jobs for processing with proper error handling
- **Key features**: 
  - Quality scoring for URLs
  - Pre-filtering of non-food truck URLs
  - Error handling and retry logic
  - Safety limits (10 URLs per run by default)

#### `scripts/convert-discovered-to-jobs.js` ⚠️ (DEPRECATED)
- **Purpose**: Basic conversion of discovered URLs to jobs (older version)
- **When to use**: Only for comparison or legacy purposes
- **Note**: Use `safe-convert-discovered-to-jobs.js` instead for production use

### 3. Duplicate Detection Scripts

#### `scripts/find-merge-duplicates.cjs` ✅ (RECOMMENDED)
- **Purpose**: Batch duplicate detection and merging using enhanced algorithms
- **When to use**: Periodic duplicate cleanup with consistent logic
- **Key features**:
  - Unicode normalization
  - Fuzzy matching with Levenshtein distance
  - Weighted scoring system
  - Same logic as real-time processing

#### `scripts/test-duplicate-prevention.js` ⚠️ (TESTING)
- **Purpose**: Test duplicate prevention logic with sample data
- **When to use**: Development and testing scenarios
- **Note**: Not for production duplicate cleanup

### 4. GitHub Actions Pipeline Scripts

#### `scripts/github-action-scraper.js` ✅ (PRODUCTION)
- **Purpose**: Main GitHub Actions scraper script
- **When to use**: Production pipeline execution
- **Key features**:
  - Proper ESM/CJS interop
  - Environment variable handling
  - Error reporting and monitoring

#### Other scraper scripts (various names) ⚠️ (DEVELOPMENT)
- **Purpose**: Development and testing versions
- **When to use**: Only for local development and testing
- **Note**: Use `github-action-scraper.js` for production workflows

### 5. Job Cleanup and Maintenance Scripts

#### `scripts/check-duplicate-jobs.js` ✅ (RECOMMENDED)
- **Purpose**: Check for duplicate URLs in pending scraping jobs
- **When to use**: Before running the pipeline to identify resource waste
- **Key features**:
  - Groups jobs by URL and identifies duplicates
  - Shows detailed information about duplicate jobs
  - Provides cleanup statistics

#### `scripts/cleanup-duplicate-jobs.js` ✅ (RECOMMENDED)
- **Purpose**: Clean up duplicate URLs in pending scraping jobs
- **When to use**: After identifying duplicates to reduce resource waste
- **Key features**:
  - Keeps only the most recent job for each URL
  - Deletes older duplicate jobs
  - Interactive confirmation before deletion
  - Detailed cleanup summary

## Verification Workflow

### Step 1: Pre-Processing Verification
```bash
# Check current system state
node scripts/check-current-state.js

# Verify no "Unknown Food Truck" entries exist
node scripts/get-unknown-trucks.js

# Check job table structure
node scripts/check-jobs-table.js
```

### Step 2: Job Creation
```bash
# Create jobs from discovered URLs (recommended)
node scripts/safe-convert-discovered-to-jobs.js
```

### Step 3: Pipeline Processing
- Trigger GitHub Actions workflow manually or wait for scheduled run
- Monitor job processing through GitHub Actions interface

### Step 4: Post-Processing Verification
```bash
# Check results after processing
node scripts/check-current-state.js
node scripts/get-unknown-trucks.js

# Run batch duplicate cleanup (if needed)
node scripts/find-merge-duplicates.cjs
```

## Important Notes

1. **Script Naming Confusion**: Many scripts have similar names but different purposes. Always use the scripts marked with ✅ (RECOMMENDED) above.

2. **No Renaming**: Scripts are not being renamed to avoid breaking imports and references throughout the codebase.

3. **Production vs Development**: Scripts marked with ⚠️ are for development/testing only. Use ✅ scripts for production verification.

4. **Safety First**: The "safe" versions of scripts include additional error handling, quality checks, and safety limits.

5. **Consistent Logic**: Batch processing scripts now use the same duplicate detection logic as real-time processing to ensure consistency.

## Troubleshooting

If a script seems to not be working as expected:
1. Check the script usage guide above for the recommended alternative
2. Verify environment variables are loaded (`dotenv.config({ path: '.env.local' })`)
3. Check for ESM/CJS interop issues
4. Ensure proper permissions and database connectivity
