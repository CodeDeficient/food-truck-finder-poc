# Food Truck Finder Application

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rQOrGwmrQGh)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Professional-green?style=for-the-badge)](docs/ZERO_TRUST_VERIFICATION_PROTOCOL.md)
[![Launch Ready](https://img.shields.io/badge/Launch%20Ready-✅-brightgreen?style=for-the-badge)](CONSOLIDATED_LAUNCH_READINESS_PLAN.md)

## 🚀 **Enterprise-Grade Food Truck Discovery Platform**

A modern, full-stack web application built with **professional-grade architecture** and **enterprise development standards**. Features an AI-powered data pipeline, comprehensive admin dashboard, and real-time food truck discovery capabilities.


## Key Technologies

- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS
- **State Management**: Zustand, React Hooks
- **Backend & Database**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Web Scraping**: Firecrawl
- **AI-Powered Search**: Tavily AI
- **AI/ML**: Google Gemini API (`@google/genai`)
- **Mapping**: Leaflet, React-Leaflet
- **UI Components**: Radix UI, Shadcn UI
- **Testing**: Playwright (E2E), Jest (Unit/Integration)
- **Type Safety**: TypeScript

## Features

- **Food Truck Discovery**: Easily find food trucks based on location, cuisine type, and operating status.
- **Detailed Information**: View comprehensive details for each food truck, including menus, operating hours, contact information, and social media links.
- **Real-time Updates**: Get live updates on food truck locations and availability.
- **Advanced Search & Filtering**: Robust search capabilities with filters for cuisine type, price range, and operating status.
- **Event & Schedule Management**: Integration for food truck events and operating schedules.
- **User Profiles**: Personalized user profiles for enhanced experience.
- **Data Quality Metrics**: Built-in functions and dashboards to monitor and ensure data quality.
- **Comprehensive Security**: Implemented security hardening measures across the application and database.
- **Admin Dashboard**: A secure and comprehensive interface for administrators, currently under active development. It includes:
  - **Food Truck Management**: CRUD operations for food truck data.
  - **User Management**: Oversee and manage user accounts.
  - **Data Pipeline Monitoring**: Track scraping jobs, data quality, and automated cleanup processes.
  - **System Metrics & Alerts**: Real-time monitoring of application performance and system health, with configurable alerts.
  - **Analytics**: Insights into application usage and food truck popularity.
  - **Test Pipeline**: Tools for testing data scraping and processing pipelines.

## AI-Powered Data Pipeline

The backbone of the Food Truck Finder is its intelligent, automated data pipeline. This system is responsible for discovering, processing, and storing food truck data from various online sources.

### Key Components:

- **Tavily AI for Intelligent Discovery**: The pipeline uses Tavily's AI-powered search API to intelligently discover new food trucks and their websites. This allows for a more efficient and targeted approach to data acquisition compared to traditional web scraping.
- **Firecrawl for Web Scraping**: Once a potential food truck website is identified, Firecrawl is used to reliably scrape the necessary data, such as menus, operating hours, and contact information. Firecrawl's robust infrastructure ensures a high success rate and handles the complexities of web scraping.
- **Gemini AI for Data Extraction**: The scraped data is then processed by Google's Gemini AI, which extracts and structures the information into a consistent format.
- **Supabase for Data Storage**: The cleaned and structured data is stored in a Supabase PostgreSQL database, providing a reliable and scalable data storage solution.

## Architecture Diagrams

### Web Application Workflow

```mermaid
flowchart TD
    A["User Accesses Web App"] --> B["Authentication & Authorization"]
    B --> C["Frontend (Next.js)"]
    C --> D["Search & Filter Food Trucks"]
    C --> E["View Food Truck Details"]
    C --> F["View Events & Schedules"]
    C --> G["Admin Dashboard Access"]

    D --> H["/api/search"]
    E --> I["/api/trucks/[id]"]
    F --> J["/api/events, /api/trucks/[id]/schedules"]
    G --> K["/api/admin/*"]

    H --> L["Supabase Database"]
    I --> L
    J --> L
    K --> L

    L --> M["Data Pipeline"]
    M --> L

    subgraph "User Interactions"
        D
        E
        F
    end

    subgraph "Admin Features"
        G --> N["Manage Food Trucks"]
        G --> O["Manage Events"]
        G --> P["Monitor Data Quality"]
        G --> Q["Configure Scraping"]
        G --> R["View API Usage"]
        N --> K
        O --> K
        P --> K
        Q --> K
        R --> K
    end
```

### Enhanced Data Pipeline Architecture

```mermaid
flowchart TD
    A["Data Sources: Websites, APIs"] --> B["Scraping Engine: Firecrawl, Custom Scrapers"]
    B --> C["Data Ingestion & Initial Processing"]
    C --> D["Raw Data Storage: Supabase (PostgreSQL)"]
    D --> E["Data Transformation & Enrichment: Pipeline Processor"]
    E --> F["Data Quality Checks & Validation"]
    F --> G["Cleaned & Structured Data Storage: Supabase (PostgreSQL)"]
    G --> H["API Endpoints: Search, Admin, Public"]
    H --> I["Web Application: Next.js Frontend"]
    I --> J["User Interface"]

    subgraph "Monitoring & Feedback"
        K["Monitoring & Logging: Supabase Logs, Custom Metrics"] --> E
        K --> F
        K --> H
        J --> L["User Feedback & Reporting"]
        L --> A
    end

    subgraph "Admin & Management"
        M["Admin Dashboard"] --> H
        M --> B
        M --> C
        M --> E
        M --> F
        M --> K
    end
```

## 🏗️ **Professional Project Structure**

Built with **enterprise-grade architecture** following industry best practices:

```
food-truck-finder/
├── 📁 app/                    # Next.js App Router (pages & API routes)
├── 📁 components/             # Reusable UI components
│   ├── admin/                 # Admin dashboard components
│   ├── home/                  # Home page components
│   ├── search/                # Search & filtering components
│   ├── trucks/                # Food truck display components
│   └── ui/                    # Base UI components (Shadcn/Radix)
├── 📁 lib/                    # Core utilities & business logic
│   ├── api/                   # API route handlers
│   ├── auth/                  # Authentication utilities
│   ├── data-quality/          # Data validation & cleanup
│   ├── gemini/                # AI integration (Google Gemini)
│   ├── pipeline/              # Data processing pipeline
│   ├── security/              # Security utilities
│   └── supabase/              # Database services
├── 📁 hooks/                  # Custom React hooks
├── 📁 types/                  # TypeScript type definitions
├── 📁 public/                 # Static assets
├── 📁 styles/                 # Global styles & themes
├── 📁 docs/                   # Comprehensive documentation
│   ├── analysis/              # Code analysis reports
│   ├── baselines/             # Test baselines
│   ├── debug/                 # Debug documentation
│   └── errors/                # Error documentation
├── 📁 tests/                  # Test suite
│   ├── config/                # Test configurations
│   └── results/               # Test results & reports
├── 📁 scripts/                # Development & deployment scripts
├── 📁 supabase/               # Database schema & migrations
└── 📄 [config files]          # Essential configuration only
```



---

## 📜 License

This project is licensed under the **[Business Source License 1.1](LICENSE)**.

**Key points:**
- ✅ **Free for personal, educational, and non-profit use**
- ⚠️ **Commercial food service platforms require a commercial license**
- 🎯 **Converts to Apache 2.0 in 2029** (fully open source)

See the [LICENSE](LICENSE) file for complete terms and commercial use definitions.

**Commercial licensing:** @NFTMedi on X

---

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
    Create a `.env.local` file by copying the example file:

    ```bash
    cp .env.local.example .env.local
    ```

    Then, fill in the required environment variables in the `.env.local` file. Refer to the comments in the `.env.local.example` file for guidance on where to find the necessary API keys and other values.

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
3.  Make your changes and ensure they adhere to our [Linting and Code Quality Guide](docs/LINTING_AND_CODE_QUALITY_GUIDE.md).
4.  Write tests for your changes.
5.  Ensure all tests pass and linting checks are clear.
6.  Commit your changes with a descriptive message.
7.  Push your branch and open a pull request.

## Local Development & Debugging

### Development Scripts

The `package.json` includes a variety of scripts to streamline development, testing, and quality assurance:

- **Core Development**:
  - `npm run dev`: Starts the Next.js development server.
  - `npm run build`: Builds the application for production.
  - `npm run start`: Starts the production server.
- **Linting & Formatting**:
  - `npm run lint`: Runs ESLint on all `.js`, `.jsx`, `.ts`, `.tsx` files.
  - `npm run lint:fix`: Automatically fixes linting errors.
  - `npm run lint:count`: Counts the total number of linting errors.
  - `npm run format`: Formats code using Prettier.
- **Testing**:
  - `npm run test`: Runs Jest unit/integration tests.
  - `npm run test:watch`: Runs Jest in watch mode.
  - `npm run test:coverage`: Runs Jest tests with code coverage.
  - `npm run test:e2e`: Runs basic Playwright E2E tests.
  - `npm run test:e2e:playwright`: Runs all Playwright tests.
  - `npm run test:e2e:pipeline`: Runs Playwright tests specific to the data pipeline.
  - `npm run test:e2e:upscaling`: Runs Playwright tests for pipeline upscaling.
  - `npm run test:e2e:load`: Runs Playwright load tests for the pipeline.
  - `npm run test:e2e:monitoring`: Runs Playwright tests for monitoring features.
  - `npm run test:pipeline:all`: Runs all Playwright pipeline-related E2E tests.
  - `npm run test:e2e:all`: Runs all Playwright E2E tests.
  - `npm run test:e2e:report`: Shows the Playwright test report.
  - `npm run test:setup`: Runs setup scripts for testing.
  - `npm run test:pipeline:health`: Runs Playwright tests specifically for the System Health Dashboard.
- **Quality Gates & Type Checking**:
  - `npm run quality:gates`: Executes quality gate checks (e.g., linting, type checking).
  - `npm run quality:check`: Runs type checking and linting.
  - `npm run quality:fix`: Fixes linting errors and runs type checking.
  - `npm run type-check`: Performs TypeScript type checking.
  - `npm run type-coverage`: Checks TypeScript type coverage (at least 95%).
  - `npm run complexity:check`: Checks for cognitive complexity violations.
- **Error & Baseline Management**:
  - `npm run error:count`: Counts current linting errors.
  - `npm run baseline:capture`: Captures a baseline of current errors.
  - `npm run baseline:compare`: Compares current errors against the baseline.
- **OAuth Flow Testing**:
  - `npm run oauth:verify`: Verifies OAuth setup.
  - `npm run oauth:test`: Tests the OAuth flow.
  - `npm run oauth:test:dev`: Tests OAuth flow in development environment.
  - `npm run oauth:test:prod`: Tests OAuth flow in production environment.
- **Monitoring**:
  - `npm run monitoring:update`: Updates monitoring configurations.
- **TypeScript Migration (ts-migrate)**:
  - `npm run ts-migrate:init`: Initializes `ts-migrate`.
  - `npm run ts-migrate:migrate`: Migrates JavaScript to TypeScript.
  - `npm run ts-migrate:reignore`: Re-ignores files for `ts-migrate`.
- **Database**:
  - `npm run db:backup`: Backs up the database.
  - `npm run db:restore`: Restores the database.
  - `npm run db:migrate:check`: Checks for database migration changes.
- **Security**:
  - `npm run security:audit`: Runs `npm audit` and a custom security scan.
  - `npm run security:deps`: Runs `npm audit` with a moderate audit level.
- **Data Pipeline & Scraping**:
  - `npm run pipeline:validate`: Validates food truck data.
  - `npm run pipeline:sync`: Syncs truck locations.
  - `npm run pipeline:cleanup`: Cleans up stale data.
  - `npm run scraper:run`: Runs the web scraper.
  - `npm run scraper:validate`: Validates scraped data.
  - `npm run scraper:schedule`: Schedules scraping jobs.
- **Owner & Data Management**:
  - `npm run owner:sync`: Syncs owner updates.
  - `npm run owner:validate`: Validates owner data.
  - `npm run data:merge`: Merges scraped and owner data.
  - `npm run data:conflicts`: Resolves data conflicts.
  - `npm run data:priority`: Applies data priority rules.
- **GPS & Notifications**:
  - `npm run gps:validate`: Validates GPS coordinates.
  - `npm run gps:track`: Tracks location changes.
  - `npm run notifications:owners`: Notifies owners.
- **Billing & Verification**:
  - `npm run billing:process`: Processes subscriptions.
  - `npm run billing:trials`: Manages free trials.
  - `npm run billing:notifications`: Sends billing notifications.
  - `npm run verification:process`: Processes verification requests.
  - `npm run verification:badge`: Updates verification badges.
- **Analytics**:
  - `npm run analytics:revenue`: Analyzes revenue metrics.
  - `npm run analytics:conversion`: Tracks trial conversions.
  - `npm run analytics:engagement`: Measures owner engagement.
  - `npm run analytics:trucks`: Analyzes truck data.
- **Onboarding & Feature Management**:
  - `npm run onboard:uprooted`: Onboards a specific food truck.
  - `npm run add:uprooted-truck`: Adds a specific food truck.
  - `npm run add:uprooted-events`: Adds events for a specific food truck.
  - `npm run features:unlock`: Unlocks premium features.
  - `npm run features:restrict`: Restricts expired features.
- **Marketing & Ads**:
  - `npm run marketing:campaigns`: Runs marketing campaigns.
  - `npm run marketing:retention`: Runs owner retention campaigns.
  - `npm run ads:serve`: Serves contextual ads.
  - `npm run ads:revenue`: Calculates ad revenue.
- **Gemini & Fallback**:
  - `npm run gemini:test`: Tests the Gemini connection.
  - `npm run gemini:usage`: Checks Gemini usage.
  - `npm run locations:verify`: Verifies locations.
  - `npm run fallback:test`: Tests the Supabase fallback.


## 📚 **Documentation**


| Document | Purpose |
|----------|----------|
| **[📝 Product Requirements (PRD)](docs/PRODUCT_REQUIREMENTS.md)** | What we're building, for whom, and why. |
| **[🛠️ Tech Stack](docs/TECH_STACK.md)** | The technologies used in the project. |
| **[🏗️ System Architecture](docs/ARCHITECTURE.md)** | The blueprint of the system. |
| **[🎨 Frontend Guide](docs/FRONTEND_GUIDE.md)** | A guide to the frontend codebase. |
| **[⚙️ Backend Guide](docs/BACKEND_GUIDE.md)** | A guide to the backend codebase. |
| **[📡 API Reference](docs/API_REFERENCE.md)** | Detailed documentation for all API endpoints. |
| **[🤝 Contributing Guide](docs/CONTRIBUTING.md)** | How to contribute to the project. |

### **Professional Standards**
- ✅ **Enterprise-grade documentation** indistinguishable from professional teams
- ✅ **Visual diagrams** for complex processes and architectures  
- ✅ **Comprehensive API reference** with examples and error handling
- ✅ **Zero Trust development protocol** ensuring code quality
- ✅ **Professional project structure** analysis and optimization

## 🔬 SOTA RESEARCH FINDINGS & IMPLEMENTATION GUIDELINES

### Next.js & TypeScript Best Practices (2024-2025)

#### Code Quality Standards

- **ESLint Configuration**: Use `next/core-web-vitals` and `next/typescript` for optimal linting
- **Type Safety**: Leverage TypeScript for enhanced type safety and early error detection
- **Error Boundaries**: Implement graceful error handling with proper error boundaries
- **Performance**: Use `unstable_cache` with tags for efficient data caching strategies

#### Development Workflow

- **Incremental Development**: Small, atomic changes with frequent linting verification
- **Testing Strategy**: Comprehensive unit, integration, and E2E testing
- **Code Organization**: Modular folder structure with clear separation of concerns
- **Documentation**: JSDoc comments for complex functions and comprehensive API documentation

### Food Truck Finder Application Best Practices

#### Data Pipeline Excellence

- **Web Scraping Ethics**: Respect robots.txt, implement rate limiting, and follow platform terms
- **Data Quality Framework**: Implement comprehensive data validation and quality scoring
- **Real-time Updates**: Use Server-Sent Events or WebSocket for live data updates
- **Error Handling**: Robust error handling with retry mechanisms and graceful degradation

#### Security & Performance

- **Authentication**: Implement SOTA authentication patterns with proper session management
- **Rate Limiting**: Intelligent rate limiting with backoff strategies for API calls
- **Caching Strategy**: Multi-layer caching with appropriate invalidation strategies
- **Monitoring**: Comprehensive monitoring with real-time alerts and performance tracking
