# Codebase Overview: A Needle in the Haystack Guide

This document provides a high-level overview of the `food-truck-finder-poc` codebase, acting as a guide to help quickly locate relevant code sections and understand the project's structure.

## Project Root (`c:/AI/food-truck-finder-poc`)

The root directory contains configuration files, project-wide documentation, and top-level scripts.

- `package.json`: Defines project metadata, scripts, and dependencies.
- `next.config.mjs`: Next.js specific configuration.
- `tsconfig.json`: TypeScript configuration.
- `jest.config.ts`, `playwright.config.ts`: Testing framework configurations.
- `SUMMARY.md`: The main index for project documentation.
- `README.md`: General project introduction.
- `docs/`: Contains all project documentation, including diagrams and this overview.

## Core Application Directories

### `app/`

This directory contains the Next.js application's pages, API routes, and middleware.

- **`app/page.tsx`**: The main landing page of the application.
- **`app/layout.tsx`**: Defines the root layout for the Next.js application.
- **`app/globals.css`**: Global CSS styles.
- **`app/middleware.ts`**: Next.js middleware for request processing (e.g., authentication, routing).

#### `app/admin/`

Contains pages and components related to the administrative dashboard.

- **`app/admin/page.tsx`**: Admin dashboard entry point.
- **`app/admin/food-trucks/page.tsx`**: Interface for managing food truck data.
- **`app/admin/events/page.tsx`**: Interface for managing events.
- **`app/admin/pipeline/page.tsx`**: Interface for monitoring and managing the data pipeline.
- **`app/admin/auto-scraping/page.tsx`**: Configuration and monitoring for auto-scraping.
- **`app/admin/data-quality/page.tsx`**: Data quality metrics and reports.
- **`app/admin/users/page.tsx`**: User management interface.
- **`app/admin/analytics/page.tsx`**: Application analytics.

#### `app/api/`

Contains all API routes for the Next.js application. These are serverless functions that handle various backend operations.

- **`app/api/search/route.ts`**: Handles food truck search queries.
- **`app/api/trucks/route.ts`**: API for retrieving food truck data.
- **`app/api/events/route.ts`**: API for retrieving event data.
- **`app/api/scrape/route.ts`**: Manual scraping trigger.
- **`app/api/auto-scrape-initiate/route.ts`**: Initiates the auto-scraping process.
- **`app/api/cron/auto-scrape/route.ts`**: Cron job endpoint for scheduled auto-scraping.
- **`app/api/cron/quality-check/route.ts`**: Cron job endpoint for scheduled data quality checks.
- **`app/api/pipeline/route.ts`**: Triggers and manages data pipeline runs.
- **`app/api/gemini/route.ts`**: Handles interactions with the Gemini AI model.

### `components/`

Contains reusable React components, including UI elements and application-specific components.

- **`components/FoodTruckInfoCard.tsx`**: Displays detailed information about a food truck.
- **`components/MapDisplay.tsx`**: Renders the map with food truck locations.
- **`components/SearchFilters.tsx`**: Components for filtering search results.
- **`components/TruckCard.tsx`**: A card component for displaying a food truck summary.
- **`components/ui/`**: Shadcn UI components (e.g., `button.tsx`, `input.tsx`, `dialog.tsx`).

### `lib/`

Contains core logic, utility functions, database interactions, and external service integrations.

- **`lib/supabase.ts`**: Supabase client initialization and common database operations.
- **`lib/database.types.ts`**: TypeScript types generated from the Supabase database schema.
- **`lib/pipelineProcessor.ts`**: Core logic for processing scraped data and transforming it for the database.
- **`lib/autoScraper.ts`**: Logic for automated web scraping.
- **`lib/firecrawl.ts`**: Integration with the Firecrawl API for web scraping.
- **`lib/gemini.ts`**: Integration with the Gemini AI API.
- **`lib/scheduler.ts`**: Logic for scheduling tasks (e.g., cron jobs).
- **`lib/ScraperEngine.ts`**: Abstraction for different scraping methods.
- **`lib/utils.ts`**: General utility functions.
- **`lib/types.ts`**: Custom TypeScript types used across the application.
- **`lib/activityLogger.ts`**: Logging utility for application activities.

### `hooks/`

Contains custom React hooks for reusable logic in frontend components.

- **`hooks/UseMobile.tsx`**: Hook for detecting mobile device usage.
- **`hooks/UseToast.ts`**: Hook for displaying toast notifications.

### `public/`

Contains static assets like images.

- `public/placeholder-logo.png`: Placeholder images.

### `styles/`

Contains global stylesheets.

- `styles/globals.css`: Global CSS styles (also imported in `app/globals.css`).

### `supabase/`

Contains Supabase-related configurations and database migrations.

- **`supabase/migrations/`**: SQL migration files for database schema changes.

### `tests/`

Contains all test files for the application.

- **`tests/e2e.test.ts`**: General end-to-end tests.
- **`tests/pipeline.e2e.test.ts`**: End-to-end tests for the data pipeline.
- **`tests/pipeline.load.e2e.test.ts`**: Load testing for the pipeline.
- **`tests/pipeline.monitoring.e2e.test.ts`**: Monitoring-related tests for the pipeline.
- **`tests/pipeline.upscaling.e2e.test.ts`**: Upscaling tests for the pipeline.
- **`tests/utils/testUtils.ts`**: Utility functions for testing.
- **`tests/README.md`**: Documentation for the testing suite.

## Finding Specific Functionality

To find specific functionality, consider the following:

- **Frontend UI/Pages**: Look in `app/` for pages and `components/` for reusable UI elements.
- **API Endpoints**: Check `app/api/` for server-side logic exposed via HTTP.
- **Core Business Logic/Utilities**: Explore `lib/` for data processing, external integrations, and shared functions.
- **Database Schema/Migrations**: Refer to `supabase/migrations/` for database structure.
- **Authentication/Authorization**: `app/middleware.ts` and `lib/supabase.ts` are key.
- **Scraping Logic**: `lib/autoScraper.ts`, `lib/firecrawl.ts`, `lib/ScraperEngine.ts`.
- **Data Pipeline**: `lib/pipelineProcessor.ts` and related API routes in `app/api/pipeline/`.
- **Admin Features**: `app/admin/` and corresponding API routes in `app/api/admin/`.
- **Testing**: `tests/` directory.
