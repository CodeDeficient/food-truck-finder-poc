# Food Truck Finder Application

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rQOrGwmrQGh)

## Overview

The Food Truck Finder Application is a modern web application designed to help users discover and locate food trucks in their vicinity. It provides real-time information on food truck locations, operating hours, menus, and ratings. The project emphasizes adherence to State-of-the-Art (SOTA) best practices in software development, including robust data pipelines, comprehensive testing, and high code quality standards.

## Features

-   **Food Truck Discovery**: Easily find food trucks based on location, cuisine type, and operating status.
-   **Detailed Information**: View comprehensive details for each food truck, including menus, operating hours, contact information, and social media links.
-   **Real-time Updates**: Get live updates on food truck locations and availability.
-   **Advanced Search & Filtering**: Robust search capabilities with filters for cuisine type, price range, and operating status.
-   **Event & Schedule Management**: Integration for food truck events and operating schedules.
-   **User Profiles**: Personalized user profiles for enhanced experience.
-   **Data Quality Metrics**: Built-in functions and dashboards to monitor and ensure data quality.
-   **Comprehensive Security**: Implemented security hardening measures across the application and database.
-   **Admin Dashboard**: A secure and comprehensive interface for administrators, currently under active development. It includes:
    -   **Food Truck Management**: CRUD operations for food truck data.
    -   **User Management**: Oversee and manage user accounts.
    -   **Data Pipeline Monitoring**: Track scraping jobs, data quality, and automated cleanup processes.
    -   **System Metrics & Alerts**: Real-time monitoring of application performance and system health, with configurable alerts.
    -   **Analytics**: Insights into application usage and food truck popularity.
    -   **Test Pipeline**: Tools for testing data scraping and processing pipelines.

## Architecture Diagrams

### Web Application Workflow

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

### Enhanced Data Pipeline Architecture

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

## Technologies Used

-   **Framework**: Next.js (React)
-   **Styling**: Tailwind CSS
-   **State Management**: React Hooks
-   **Backend & Database**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage, Edge Functions)
-   **Data Scraping**: Custom web scraping pipeline with robust error handling and data quality checks.
-   **Mapping**: Leaflet, React-Leaflet
-   **UI Components**: Radix UI, Shadcn UI, cmdk, vaul, sonner, input-otp, react-day-picker, react-resizable-panels
-   **Charting**: Recharts
-   **Date Handling**: date-fns
-   **Icons**: Lucide React
-   **Form Management**: React Hook Form, Zod (for validation)
-   **Type Safety**: TypeScript
-   **Linting & Formatting**: ESLint, Prettier, Husky, lint-staged
-   **Testing**: Playwright (E2E), Jest (Unit/Integration)
-   **Monitoring**: Custom API monitoring and system alerts.
-   **AI/ML**: Google Gemini API (`@google/genai`)
-   **Utilities**: clsx, tailwind-merge, next-themes, js-cookie, embla-carousel-react, zod

## Installation

To set up the project locally, follow these steps:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/codedeficients/food-truck-finder-poc.git
    cd food-truck-finder-poc
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    # or using pnpm
    pnpm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory and add your Supabase project credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```
    You can find these in your Supabase project settings under `API`.

4.  **Run Database Migrations**:
    Ensure your Supabase database is set up and run any pending migrations. You can apply migrations using the Supabase CLI:
    ```bash
    npx supabase db push
    ```

## Usage

To run the application in development mode:

```bash
npm run dev
# or using pnpm
pnpm dev
```

The application will be accessible at `http://localhost:3000`.

## Contributing

We welcome contributions to the Food Truck Finder Application! Please follow these guidelines:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix`.
3.  Make your changes and ensure they adhere to our [Linting and Code Quality Guide](LINTING_AND_CODE_QUALITY_GUIDE.md).
4.  Write tests for your changes.
5.  Ensure all tests pass and linting checks are clear.
6.  Commit your changes with a descriptive message.
7.  Push your branch and open a pull request.

## Local Development & Debugging

### Development Scripts

The `package.json` includes a variety of scripts to streamline development, testing, and quality assurance:

-   **Linting & Formatting**:
    -   `npm run lint`: Runs ESLint on all `.js`, `.jsx`, `.ts`, `.tsx` files.
    -   `npm run lint:fix`: Automatically fixes linting errors.
    -   `npm run lint:count`: Counts the total number of linting errors.
    -   `npm run format`: Formats code using Prettier.
-   **Testing**:
    -   `npm run test`: Runs Jest unit/integration tests.
    -   `npm run test:coverage`: Runs Jest tests with code coverage.
    -   `npm run test:e2e`: Runs Playwright E2E tests (basic).
    -   `npm run test:e2e:playwright`: Runs all Playwright tests.
    -   `npm run test:e2e:pipeline`: Runs Playwright tests specific to the data pipeline.
    -   `npm run test:e2e:upscaling`: Runs Playwright tests for pipeline upscaling.
    -   `npm run test:e2e:load`: Runs Playwright load tests for the pipeline.
    -   `npm run test:e2e:monitoring`: Runs Playwright tests for monitoring features.
    -   `npm run test:pipeline:all`: Runs all Playwright pipeline-related E2E tests.
    -   `npm run test:e2e:all`: Runs all Playwright E2E tests.
    -   `npm run test:e2e:report`: Shows the Playwright test report.
    -   `npm run test:setup`: Runs setup scripts for testing.
    -   `npm run test:pipeline:health`: Runs Playwright tests specifically for the System Health Dashboard.
-   **Quality Gates & Type Checking**:
    -   `npm run quality:gates`: Executes quality gate checks (e.g., linting, type checking).
    -   `npm run quality:check`: Runs type checking and linting.
    -   `npm run quality:fix`: Fixes linting errors and runs type checking.
    -   `npm run type-check`: Performs TypeScript type checking.
    -   `npm run type-coverage`: Checks TypeScript type coverage (at least 95%).
    -   `npm run complexity:check`: Checks for cognitive complexity violations.
-   **Error & Baseline Management**:
    -   `npm run error:count`: Counts current linting errors.
    -   `npm run baseline:capture`: Captures a baseline of current errors.
    -   `npm run baseline:compare`: Compares current errors against the baseline.
-   **OAuth Flow Testing**:
    -   `npm run oauth:verify`: Verifies OAuth setup.
    -   `npm run oauth:test`: Tests the OAuth flow.
    -   `npm run oauth:test:dev`: Tests OAuth flow in development environment.
    -   `npm run oauth:test:prod`: Tests OAuth flow in production environment.
-   **Monitoring**:
    -   `npm run monitoring:update`: Updates monitoring configurations.
-   **TypeScript Migration (ts-migrate)**:
    -   `npm run ts-migrate:init`: Initializes `ts-migrate`.
    -   `npm run ts-migrate:migrate`: Migrates JavaScript to TypeScript.
    -   `npm run ts-migrate:reignore`: Re-ignores files for `ts-migrate`.

### Browser Debugging with browser-tools-mcp

This project uses [browser-tools-mcp](https://marketplace.visualstudio.com/items?itemName=browser-tools-mcp) for local browser-based debugging and inspection. To use:

1.  Open the Command Palette in VS Code (`Ctrl+Shift+P`).
2.  Search for and run `Browser Tools: Open Browser`.
3.  Use the browser window to interact with your app at `http://localhost:3000` (or your dev server URL).
4.  Use the browser-tools-mcp sidebar for DOM inspection, console, network, and accessibility audits.

See the [browser-tools-mcp documentation](https://marketplace.visualstudio.com/items?itemName=browser-tools-mcp) for advanced features and troubleshooting.

### Pre-commit Hooks with Husky and lint-staged

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks and [lint-staged](https://github.com/okonet/lint-staged) to run linters on staged files, ensuring code quality and consistency before commits.

**How it works:**

-   When you attempt to commit changes, Husky triggers the pre-commit hook.
-   The pre-commit hook executes `pnpm exec lint-staged`.
-   `lint-staged` then runs configured linters (`eslint --fix` and `prettier --write`) only on the files you've staged for commit.
-   This process helps catch errors and enforce formatting standards automatically before code is added to the repository.

**Setup:**

1.  Husky and `lint-staged` are installed as dev dependencies.
2.  Husky is initialized (via `pnpm husky init` or automatically by the `prepare` script in `package.json`).
3.  The `.husky/pre-commit` hook is configured to run `pnpm exec lint-staged`.
4.  The `lint-staged` configuration in `package.json` specifies which commands to run on which file types.
## Documentation

For a comprehensive overview of the application's architecture, data pipeline, and database schema, please refer to the [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md). For linting and code quality guidelines, refer to the [Linting and Code Quality Guide](LINTING_AND_CODE_QUALITY_GUIDE.md). For project planning and status updates, refer to the [Project Planning and Status](docs/PROJECT_PLANNING_AND_STATUS.md). For guidelines on agent interactions and development, refer to the [Agent Guidelines](docs/AGENT_GUIDELINES.md).

## 🔬 SOTA RESEARCH FINDINGS & IMPLEMENTATION GUIDELINES

### Next.js & TypeScript Best Practices (2024-2025)

#### Code Quality Standards
-   **ESLint Configuration**: Use `next/core-web-vitals` and `next/typescript` for optimal linting
-   **Type Safety**: Leverage TypeScript for enhanced type safety and early error detection
-   **Error Boundaries**: Implement graceful error handling with proper error boundaries
-   **Performance**: Use `unstable_cache` with tags for efficient data caching strategies

#### Development Workflow
-   **Incremental Development**: Small, atomic changes with frequent linting verification
-   **Testing Strategy**: Comprehensive unit, integration, and E2E testing
-   **Code Organization**: Modular folder structure with clear separation of concerns
-   **Documentation**: JSDoc comments for complex functions and comprehensive API documentation

### Food Truck Finder Application Best Practices

#### Data Pipeline Excellence
-   **Web Scraping Ethics**: Respect robots.txt, implement rate limiting, and follow platform terms
-   **Data Quality Framework**: Implement comprehensive data validation and quality scoring
-   **Real-time Updates**: Use Server-Sent Events or WebSocket for live data updates
-   **Error Handling**: Robust error handling with retry mechanisms and graceful degradation

#### Security & Performance
-   **Authentication**: Implement SOTA authentication patterns with proper session management
-   **Rate Limiting**: Intelligent rate limiting with backoff strategies for API calls
-   **Caching Strategy**: Multi-layer caching with appropriate invalidation strategies
-   **Monitoring**: Comprehensive monitoring with real-time alerts and performance tracking
