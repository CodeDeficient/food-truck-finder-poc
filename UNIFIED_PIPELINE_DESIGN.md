# Unified Pipeline Architecture Design

_Phase 1.1.2 - Consolidated System Design_

## Architecture Overview

The unified pipeline system will consolidate all existing pipeline functionality into a modular, extensible architecture with clear separation of concerns.

## Core Components

### 1. Pipeline Manager (`lib/pipelineManager.ts`)

**Central orchestrator for all pipeline operations**

```typescript
interface PipelineManager {
  // Core pipeline operations
  runPipeline(config: PipelineConfig): Promise<PipelineResult>;

  // Discovery operations
  runDiscovery(params: DiscoveryParams): Promise<DiscoveryResult>;

  // Processing operations
  processJobs(options: ProcessingOptions): Promise<ProcessingResult>;

  // Maintenance operations
  runMaintenance(): Promise<MaintenanceResult>;
}
```

### 2. Pipeline Processor (`lib/pipelineProcessor.ts`) - Enhanced

**Core job processing logic - already exists, will be enhanced**

- Unified job processing for all pipeline types
- Firecrawl + Gemini integration
- Retry mechanisms and error handling
- Database operations via centralized services

### 3. Discovery Engine (`lib/discoveryEngine.ts`) - Enhanced

**URL discovery and validation - already exists, will be enhanced**

- Tavily search integration
- Geographic targeting
- Quality filtering and validation
- Deduplication logic

### 4. Auto Scraper (`lib/autoScraper.ts`) - Enhanced

**Background scraping coordinator - already exists, will be enhanced**

- Staleness detection
- Automatic re-scraping
- URL management
- Integration with unified pipeline

### 5. Scheduler (`lib/scheduler.ts`) - New

**Unified scheduling system**

```typescript
interface Scheduler {
  scheduleDiscovery(config: ScheduleConfig): Promise<void>;
  scheduleMaintenance(config: ScheduleConfig): Promise<void>;
  scheduleProcessing(config: ScheduleConfig): Promise<void>;
}
```

## Data Flow Architecture

```
┌─────────────────┐
│   API Routes    │
│  /api/pipeline  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Pipeline Manager│
│  (Orchestrator) │
└─────────┬───────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐   ┌───────────┐
│Discovery│   │Processing │
│ Engine  │   │  Engine   │
└─────┬─┘   └─────┬─────┘
      │           │
      ▼           ▼
┌─────────────────────┐
│  Unified Services   │
│   (lib/supabase)    │
└─────────────────────┘
```

## Configuration System

### Pipeline Config Types

```typescript
interface PipelineConfig {
  type: 'discovery' | 'processing' | 'full' | 'maintenance';
  params: {
    maxUrls?: number;
    targetCities?: string[];
    priority?: number;
    skipDiscovery?: boolean;
  };
}

interface DiscoveryParams {
  cities: string[];
  maxUrls: number;
  searchTerms?: string[];
}

interface ProcessingOptions {
  maxJobs: number;
  priority: number;
  retryFailedJobs: boolean;
}
```

## API Route Consolidation

### Single Unified Endpoint: `/api/pipeline`

```typescript
POST /api/pipeline
{
  "action": "discovery" | "processing" | "full" | "maintenance",
  "config": PipelineConfig
}
```

**Actions:**

- `discovery`: Run URL discovery only
- `processing`: Process existing queued jobs only
- `full`: Run complete discovery + processing pipeline
- `maintenance`: Run maintenance checks and cleanup

### Migration Plan for Existing Routes:

- `/api/enhanced-pipeline` → `/api/pipeline` with `action: "full"`
- `/api/autonomous-discovery` → `/api/pipeline` with `action: "discovery"`
- Keep `/api/scrape` for simple direct scraping
- Remove `/api/scraper` (appears to be demo code) - Done.

## Database Service Consolidation

### Remove Duplicate Services

1. **Delete services from** `app/api/pipeline/route.ts`
2. **Standardize on** `lib/supabase.ts` services
3. **Ensure consistent usage** across all components

### Service Interfaces (Existing - No Changes Needed)

- `FoodTruckService` - Food truck CRUD operations
- `ScrapingJobService` - Job management
- `DataProcessingService` - Processing queue management
- `APIUsageService` - Usage tracking

## Error Handling Strategy

### Unified Error Types

```typescript
interface PipelineError {
  code: string;
  message: string;
  component: string;
  retry: boolean;
  details?: any;
}
```

### Error Categories

- **Discovery Errors**: API limits, network issues
- **Processing Errors**: Scraping failures, AI processing failures
- **Database Errors**: Connection issues, constraint violations
- **System Errors**: Configuration, dependency issues

## Monitoring and Logging

### Structured Logging

```typescript
interface PipelineLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  component: string;
  action: string;
  details: any;
}
```

### Metrics Collection

- Discovery success rates
- Processing throughput
- Error rates by component
- API usage tracking

## Benefits of Unified Architecture

### 1. **Reduced Complexity**

- Single point of entry for all pipeline operations
- Consistent interfaces and patterns
- Simplified testing and maintenance

### 2. **Improved Reliability**

- Centralized error handling
- Consistent retry mechanisms
- Better monitoring and observability

### 3. **Enhanced Modularity**

- Pluggable components
- Easy to add new pipeline types
- Clear separation of concerns

### 4. **Better Performance**

- Eliminate duplicate clients
- Shared connection pooling
- Optimized resource usage

### 5. **Easier Maintenance**

- Single codebase for pipeline logic
- Consistent configuration
- Simplified deployments

## Implementation Strategy

### Phase 1: Foundation

1. Create `PipelineManager`
2. Enhance existing components
3. Create unified API endpoint

### Phase 2: Migration

1. Update existing components to use PipelineManager
2. Migrate API routes
3. Remove duplicate services

### Phase 3: Cleanup

1. Remove redundant files
2. Update all references
3. Add comprehensive tests

## File Changes Required

### New Files

- `lib/pipelineManager.ts` - Central orchestrator
- `lib/scheduler.ts` - Unified scheduling

### Enhanced Files

- `lib/pipelineProcessor.ts` - Add manager integration
- `lib/discoveryEngine.ts` - Add manager integration
- `lib/autoScraper.ts` - Add manager integration

### Updated Files

- `app/api/pipeline/route.ts` - Use unified manager
- `app/api/enhanced-pipeline/route.ts` - Migrate to unified
- `app/api/autonomous-discovery/route.ts` - Migrate to unified

### Removed Files

- `lib/enhancedPipelineOrchestrator.ts` - Functionality moved to PipelineManager
- `lib/autonomousScheduler.ts` - Functionality moved to Scheduler
- Duplicate services in `app/api/pipeline/route.ts`
