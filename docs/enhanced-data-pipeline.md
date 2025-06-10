# Enhanced Food Truck Data Pipeline

## Overview

The Enhanced Data Pipeline is a comprehensive, automated system for discovering, processing, and storing food truck data. It improves upon the original proposal by leveraging existing infrastructure and adding intelligent orchestration.

## Architecture Comparison

### ❌ Original Proposed Workflow (Issues Identified)

1. **Search Phase**: Use Tavily API to search for food truck directories
2. **Database Storage**: Store URLs in Supabase (missing table)
3. **Web Scraping**: Use Firecrawl to scrape content
4. **Content Processing**: Parse with Gemini AI
5. **Data Storage**: Store in Supabase
6. **Frontend Integration**: Deliver to UI

**Problems with Original Proposal:**

- Missing `discovered_urls` table
- Linear workflow doesn't leverage existing queue system
- No error handling or retry logic
- No quality assurance phase
- Redundant with existing pipeline components

### ✅ Enhanced Workflow (Implemented Solution)

#### **Phase 1: Intelligent Discovery**

- **Tavily Integration**: Enhanced search with location targeting
- **URL Validation**: Smart filtering to avoid duplicates and irrelevant sites
- **Database Storage**: New `discovered_urls` table with status tracking
- **Discovery Methods**: Multiple strategies (autonomous, location-specific, directory crawling)

#### **Phase 2: Queue-Based Processing**

- **Existing Infrastructure**: Leverages current `scraping_jobs` system
- **Firecrawl Integration**: Already working web scraping
- **Gemini AI Processing**: Already working content extraction
- **Error Handling**: Built-in retry logic and status tracking

#### **Phase 3: Quality Assurance**

- **Data Validation**: Automatic quality scoring
- **Duplicate Detection**: Prevents redundant processing
- **Performance Monitoring**: Tracks success rates and processing times

## Database Schema

### New Table: `discovered_urls`

```sql
CREATE TABLE discovered_urls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url text UNIQUE NOT NULL,
    source_directory_url text,
    region text DEFAULT 'SC',
    status text DEFAULT 'new' CHECK (status IN ('new', 'processing', 'processed', 'irrelevant', 'failed')),
    discovery_method text DEFAULT 'manual' CHECK (discovery_method IN ('manual', 'autonomous_search', 'tavily_search', 'firecrawl_crawl', 'directory_crawl')),
    discovered_at timestamptz DEFAULT now(),
    last_processed_at timestamptz,
    processing_attempts integer DEFAULT 0,
    notes text,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Integration with Existing Tables

- **`scraping_jobs`**: Processing queue for discovered URLs
- **`food_trucks`**: Final destination for processed data
- **`api_usage`**: Tracks API consumption across all services

## API Endpoints

### Enhanced Pipeline API: `/api/enhanced-pipeline`

#### Actions Available:

1. **`full`**: Complete pipeline (discovery + processing + QA)
2. **`discovery-only`**: Only discover new URLs
3. **`processing-only`**: Process existing discovered URLs
4. **`location-specific`**: Target specific cities

#### Example Requests:

```javascript
// Full pipeline with limits
POST /api/enhanced-pipeline
{
  "action": "full",
  "maxUrlsToDiscover": 30,
  "maxUrlsToProcess": 15
}

// Location-specific discovery
POST /api/enhanced-pipeline
{
  "action": "location-specific",
  "targetCities": ["Charleston", "Columbia", "Greenville"],
  "maxUrlsToProcess": 10
}

// Process existing URLs only
POST /api/enhanced-pipeline
{
  "action": "processing-only",
  "maxUrlsToProcess": 25
}
```

## Key Components

### 1. Enhanced Discovery Engine (`lib/discoveryEngine.ts`)

- **Autonomous Discovery**: Finds food truck URLs across SC
- **Location-Specific Search**: Targets specific cities
- **URL Validation**: Smart filtering and deduplication
- **Multiple Search Strategies**: Tavily search, directory crawling, content extraction

### 2. Pipeline Orchestrator (`lib/enhancedPipelineOrchestrator.ts`)

- **Phase Management**: Coordinates discovery, processing, and QA
- **Error Handling**: Comprehensive error tracking and recovery
- **Performance Monitoring**: Detailed metrics and timing
- **Flexible Configuration**: Customizable limits and targets

### 3. Existing Infrastructure (Already Working)

- **Firecrawl Service**: Web scraping and content extraction
- **Gemini AI Service**: Structured data extraction
- **Supabase Integration**: Database operations and queue management
- **Job Processing**: Queue-based processing with retry logic

## Workflow Details

### Discovery Phase

1. **Search Strategy Selection**: Choose between full discovery or location-specific
2. **Tavily API Calls**: Execute targeted searches for food truck content
3. **URL Extraction**: Extract and validate potential food truck URLs
4. **Deduplication**: Check against existing URLs in database
5. **Storage**: Store new URLs in `discovered_urls` table with metadata

### Processing Phase

1. **Queue Management**: Fetch URLs with status 'new' from `discovered_urls`
2. **Job Creation**: Create `scraping_jobs` entries for each URL
3. **Firecrawl Processing**: Scrape website content and extract markdown
4. **Gemini AI Processing**: Extract structured food truck data
5. **Data Storage**: Store results in `food_trucks` table
6. **Status Updates**: Update URL status based on processing results

### Quality Assurance Phase

1. **Quality Scoring**: Evaluate data completeness and accuracy
2. **Duplicate Detection**: Identify and merge duplicate entries
3. **Performance Analysis**: Track success rates and processing times
4. **Error Reporting**: Generate reports on failed processing attempts

## Advantages Over Original Proposal

### ✅ **Leverages Existing Infrastructure**

- Uses proven Firecrawl + Gemini pipeline
- Builds on existing queue system
- Maintains current data quality standards

### ✅ **Intelligent Discovery**

- Multiple discovery strategies
- Smart URL validation and filtering
- Location-specific targeting capabilities

### ✅ **Robust Error Handling**

- Comprehensive error tracking
- Automatic retry logic
- Status-based processing flow

### ✅ **Scalable Architecture**

- Queue-based processing prevents overload
- Rate limiting protects external APIs
- Configurable processing limits

### ✅ **Quality Assurance**

- Automatic data validation
- Performance monitoring
- Duplicate prevention

## Usage Examples

### 1. Daily Automated Discovery

```javascript
// Run daily discovery for new food trucks
const result = await enhancedPipelineOrchestrator.runCompletePipeline({
  maxUrlsToDiscover: 50,
  maxUrlsToProcess: 20,
  skipDiscovery: false,
});
```

### 2. Location Expansion

```javascript
// Target new cities for expansion
const result = await enhancedPipelineOrchestrator.runCompletePipeline({
  targetCities: ['Spartanburg', 'Rock Hill', 'Summerville'],
  maxUrlsToProcess: 15,
});
```

### 3. Backlog Processing

```javascript
// Process accumulated discovered URLs
const result = await enhancedPipelineOrchestrator.runCompletePipeline({
  skipDiscovery: true,
  maxUrlsToProcess: 50,
});
```

## Monitoring and Metrics

The enhanced pipeline provides detailed metrics:

- **URLs Discovered**: Total new URLs found
- **URLs Processed**: Successfully processed URLs
- **Trucks Created**: New food truck entries created
- **Error Rates**: Processing failure rates
- **Performance Timing**: Phase-by-phase execution times

## Next Steps

1. **Deploy Migration**: Create `discovered_urls` table in production
2. **Test Pipeline**: Run enhanced pipeline in development environment
3. **Monitor Performance**: Track success rates and processing times
4. **Optimize Discovery**: Refine search queries and validation rules
5. **Scale Processing**: Adjust processing limits based on API quotas

## Conclusion

The Enhanced Data Pipeline addresses all issues in the original proposal while leveraging existing, proven infrastructure. It provides a robust, scalable solution for automated food truck discovery and data processing that integrates seamlessly with the current application architecture.
