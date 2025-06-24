# Food Truck Finder Application Architecture Overview

This document provides a comprehensive overview of the Food Truck Finder application's architecture, covering its core components, data flow, database schema, and key functionalities. It consolidates information from various previous documentation sources, with the most recent and detailed information taking precedence.

## 1. Project Structure and Key Directories

The `food-truck-finder-poc` codebase is organized into several key directories, each serving a specific purpose:

-   **`app/`**: Contains the Next.js application's pages, API routes, and middleware.
    -   `app/page.tsx`: The main landing page.
    -   `app/layout.tsx`: Root layout for the Next.js application.
    -   `app/globals.css`: Global CSS styles.
    -   `app/middleware.ts`: Next.js middleware for request processing (e.g., authentication, routing).
    -   `app/admin/`: Pages and components for the administrative dashboard.
    -   `app/api/`: All API routes (serverless functions) for backend operations.
        -   `app/api/search/route.ts`: Handles food truck search queries.
        -   `app/api/trucks/route.ts`: API for retrieving food truck data.
        -   `app/api/events/route.ts`: API for retrieving event data.
        -   `app/api/scrape/route.ts`: Manual scraping trigger.
        -   `app/api/auto-scrape-initiate/route.ts`: Initiates auto-scraping.
        -   `app/api/cron/auto-scrape/route.ts`: Cron job endpoint for scheduled auto-scraping.
        -   `app/api/cron/quality-check/route.ts`: Cron job for data quality checks.
        -   `app/api/pipeline/route.ts`: Triggers and manages data pipeline runs.
        -   `app/api/gemini/route.ts`: Handles interactions with the Gemini AI model.

-   **`components/`**: Reusable React components, including UI elements and application-specific components.
    -   `components/FoodTruckInfoCard.tsx`: Displays detailed food truck information.
    -   `components/MapDisplay.tsx`: Renders the map with food truck locations.
    -   `components/SearchFilters.tsx`: Components for filtering search results.
    -   `components/TruckCard.tsx`: Card component for food truck summaries.
    -   `components/ui/`: Shadcn UI components.

-   **`lib/`**: Core logic, utility functions, database interactions, and external service integrations.
    -   `lib/supabase.ts`: Supabase client initialization and database operations.
    -   `lib/database.types.ts`: TypeScript types from Supabase schema.
    -   `lib/pipelineProcessor.ts`: Core logic for processing scraped data.
    -   `lib/autoScraper.ts`: Logic for automated web scraping.
    -   `lib/firecrawl.ts`: Integration with Firecrawl API.
    -   `lib/gemini.ts`: Integration with Gemini AI API.
    -   `lib/scheduler.ts`: Logic for scheduling tasks.
    -   `lib/ScraperEngine.ts`: Abstraction for different scraping methods.
    -   `lib/utils.ts`: General utility functions.
    -   `lib/types.ts`: Custom TypeScript types.
    -   `lib/activityLogger.ts`: Logging utility.

-   **`hooks/`**: Custom React hooks for reusable frontend logic.
    -   `hooks/UseMobile.tsx`: Hook for detecting mobile device usage.
    -   `hooks/UseToast.ts`: Hook for displaying toast notifications.

-   **`public/`**: Static assets like images.

-   **`styles/`**: Global stylesheets.

-   **`supabase/`**: Supabase configurations and database migrations.
    -   `supabase/migrations/`: SQL migration files.

-   **`tests/`**: All test files for the application.

## 2. Web Application Workflow

The web application workflow describes how users interact with the system, from authentication to accessing various features.

```mermaid
graph TD
    A[User Accesses Web App] --> B[Authentication & Authorization]
    B --> C[Frontend (Next.js)]
    C --> D[Search & Filter Food Trucks]
    C --> E[View Food Truck Details]
    C --> F[View Events & Schedules]
    C --> G[Admin Dashboard Access]

    D --> H[API: /api/search]
    E --> I[API: /api/trucks/[id]]
    F --> J[API: /api/events, /api/trucks/[id]/schedules]
    G --> K[API: /api/admin/*]

    H --> L[Supabase Database]
    I --> L
    J --> L
    K --> L

    L --> M[Data Pipeline]
    M --> L

    subgraph "User Interactions"
        D --> C
        E --> C
        F --> C
    end

    subgraph "Admin Features"
        G --> N[Manage Food Trucks]
        G --> O[Manage Events]
        G --> P[Monitor Data Quality]
        G --> Q[Configure Scraping]
        G --> R[View API Usage]
        N --> K
        O --> K
        P --> K
        Q --> K
        R --> K
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#f9f,stroke:#333,stroke-width:2px
    style E fill:#f9f,stroke:#333,stroke-width:2px
    style F fill:#f9f,stroke:#333,stroke-width:2px
    style G fill:#f9f,stroke:#333,stroke-width:2px
    style H fill:#bbf,stroke:#333,stroke-width:2px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bbf,stroke:#333,stroke-width:2px
    style K fill:#bbf,stroke:#333,stroke-width:2px
    style L fill:#fbb,stroke:#333,stroke-width:2px
    style M fill:#bfb,stroke:#333,stroke-width:2px
    style N fill:#ccc,stroke:#333,stroke-width:2px
    style O fill:#ccc,stroke:#333,stroke-width:2px
    style P fill:#ccc,stroke:#333,stroke-width:2px
    style Q fill:#ccc,stroke:#333,stroke-width:2px
    style R fill:#ccc,stroke:#333,stroke-width:2px
```

## 3. Enhanced Data Pipeline

The Enhanced Data Pipeline is a comprehensive, automated system for discovering, processing, and storing food truck data. It leverages existing infrastructure and adds intelligent orchestration, improving upon previous iterations.

### Architecture

```mermaid
graph TD
    A[Data Sources: Websites, APIs] --> B(Scraping Engine: Firecrawl, Custom Scrapers);
    B --> C[Data Ingestion & Initial Processing];
    C --> D[Raw Data Storage: Supabase (PostgreSQL)];
    D --> E[Data Transformation & Enrichment: Pipeline Processor];
    E --> F[Data Quality Checks & Validation];
    F --> G[Cleaned & Structured Data Storage: Supabase (PostgreSQL)];
    G --> H[API Endpoints: Search, Admin, Public];
    H --> I[Web Application: Next.js Frontend];
    I --> J[User Interface];

    subgraph "Monitoring & Feedback"
        K[Monitoring & Logging: Supabase Logs, Custom Metrics] --> E;
        K --> F;
        K --> H;
        J --> L[User Feedback & Reporting];
        L --> A;
    end

    subgraph "Admin & Management"
        M[Admin Dashboard] --> H;
        M --> B;
        M --> C;
        M --> E;
        M --> F;
        M --> K;
    end

    style A fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#bbf,stroke:#333,stroke-width:2px
    style C fill:#bfb,stroke:#333,stroke-width:2px
    style D fill:#fbb,stroke:#333,stroke-width:2px
    style E fill:#bbf,stroke:#333,stroke-width:2px
    style F fill:#bfb,stroke:#333,stroke-width:2px
    style G fill:#fbb,stroke:#333,stroke-width:2px
    style H fill:#f9f,stroke:#333,stroke-width:2px
    style I fill:#bbf,stroke:#333,stroke-width:2px
    style J fill:#bfb,stroke:#333,stroke-width:2px
    style K fill:#ccc,stroke:#333,stroke-width:2px
    style L fill:#ccc,stroke:#333,stroke-width:2px
    style M fill:#f9f,stroke:#333,stroke-width:2px
```

### Workflow Details

The enhanced pipeline operates in three main phases:

#### Phase 1: Intelligent Discovery

-   **Tavily Integration**: Enhanced search with location targeting.
-   **URL Validation**: Smart filtering to avoid duplicates and irrelevant sites.
-   **Database Storage**: New `discovered_urls` table with status tracking.
-   **Discovery Methods**: Multiple strategies (autonomous, location-specific, directory crawling).

#### Phase 2: Queue-Based Processing

-   **Existing Infrastructure**: Leverages current `scraping_jobs` system.
-   **Firecrawl Integration**: Web scraping.
-   **Gemini AI Processing**: Content extraction.
-   **Error Handling**: Built-in retry logic and status tracking.

#### Phase 3: Quality Assurance

-   **Data Validation**: Automatic quality scoring.
-   **Duplicate Detection**: Prevents redundant processing.
-   **Performance Monitoring**: Tracks success rates and processing times.

### API Endpoints for Pipeline Control: `/api/enhanced-pipeline`

-   **`full`**: Complete pipeline (discovery + processing + QA).
-   **`discovery-only`**: Only discover new URLs.
-   **`processing-only`**: Process existing discovered URLs.
-   **`location-specific`**: Target specific cities.

## 4. Database Schema

The application uses a PostgreSQL database managed by Supabase. Below is the entity-relationship diagram of the core tables:

```mermaid
erDiagram
    users {
        uuid id PK
        timestamp created_at
        text email
        text role
    }

    profiles {
        uuid id PK
        uuid user_id FK
        text username
        text full_name
        text avatar_url
        timestamp updated_at
    }

    food_trucks {
        uuid id PK
        timestamp created_at
        text name
        text description
        text location_lat
        text location_long
        text opening_hours
        text website
        text menu_url
        text contact_info
        text social_media
        text cuisine_type
        text price_range
    }

    events {
        uuid id PK
        timestamp created_at
        text name
        text description
        timestamp start_time
        timestamp end_time
        text location_name
        text location_lat
        text location_long
    }

    food_truck_schedules {
        uuid id PK
        uuid food_truck_id FK
        uuid event_id FK
        timestamp start_time
        timestamp end_time
        text location_details
    }

    scraper_configs {
        uuid id PK
        timestamp created_at
        text name
        text config_json
        boolean is_active
        timestamp last_run
        text status
    }

    api_usage_logs {
        uuid id PK
        timestamp created_at
        uuid user_id FK
        text endpoint
        text method
        integer response_status
        integer response_time_ms
    }

    data_quality_metrics {
        uuid id PK
        timestamp created_at
        uuid food_truck_id FK
        text metric_name
        numeric metric_value
        text details
    }

    discovered_urls {
        uuid id PK
        text url UNIQUE NOT NULL
        text source_directory_url
        text region
        text status
        text discovery_method
        timestamp discovered_at
        timestamp last_processed_at
        integer processing_attempts
        text notes
        jsonb metadata
        timestamp created_at
        timestamp updated_at
    }

    users ||--o{ profiles : "has"
    food_trucks ||--o{ food_truck_schedules : "has"
    events ||--o{ food_truck_schedules : "has"
    users ||--o{ api_usage_logs : "generates"
    food_trucks ||--o{ data_quality_metrics : "monitors"
    discovered_urls ||--o{ scraper_configs : "uses"
```

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

## 5. Related Documentation

-   **Google OAuth Setup Guide**: For detailed instructions on configuring Google OAuth authentication, refer to `docs/GOOGLE_OAUTH_SETUP_GUIDE.md`.
-   **Codebase Indexing for AI Agents**: For information on state-of-the-art practices for efficient codebase search and indexing for AI agents, refer to `docs/codebase_indexing.md`.
