# Food Truck Finder Application

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rQOrGwmrQGh)
[![Code Quality](https://img.shields.io/badge/Code%20Quality-Professional-green?style=for-the-badge)](docs/ZERO_TRUST_VERIFICATION_PROTOCOL.md)
[![Launch Ready](https://img.shields.io/badge/Launch%20Ready-✅-brightgreen?style=for-the-badge)](CONSOLIDATED_LAUNCH_READINESS_PLAN.md)

## 🚀 **Enterprise-Grade Food Truck Discovery Platform (Updated)**

A cutting-edge, full-stack web application leveraging **enterprise-grade architecture** and modern development standards. 

### **Latest Milestones: Environment Variable Resolution & Modal Component System**
- **Key Fixes**: Resolved environment variable expansion issues and Supabase connectivity
- **New Achievement**: Completed unified Modal Component System with comprehensive accessibility and performance optimization
- **Current Focus**: Authentication and Role-Based Access Control (RBAC) setup for users, truck owners, and administrators

**Built with Zero Trust Development Protocol** - Ensuring every code change meets rigorous quality gates to deliver a robust production environment.

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

## Updated Features

### Core Functionality
- **Food Truck Discovery**: Find food trucks based on location, cuisine type, and operating status.
- **Detailed Information**: Comprehensive truck details including menus, operating hours, contacts.
- **Real-time Updates**: Receive live notifications of food truck location changes.

### Advanced Capabilities
- **AI-Powered Search 0 Filtering**: Sophisticated filtering for cuisine, price range, and operating status.
- **Event 6 Schedule Management**: Integrated scheduling for truck events.
- **Enhanced User Profiles**: Personalized profiles with role-based access (in-progress).
- **Security Hardening**: Advanced security measures and continuous threat monitoring.
- **Admin Dashboard Enhancements**:
  - **Food Truck Management**: CRUD operations for truck data.
  - **User Management**: Comprehensive user oversight capabilities.
  - **Data Pipeline Monitoring**: Track scraping jobs and data quality metrics.
  - **System Metrics 6 Alerts**: Real-time performance and health alerts.
  - **Analytics**: Track application usage and food truck popularity trends.
  - **Test Pipeline**: Advanced testing tools for scraping processes.

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

### **Key Architectural Decisions**
- **High TypeScript Coverage**: ~82% of the codebase is TypeScript, with a goal of 100% type safety.
- **Professional Code Organization**: Clear separation of concerns
- **Comprehensive Documentation**: Enterprise-grade documentation
- **Zero Trust Development**: Every change verified through quality gates
- **Clean Root Directory**: Only essential files in project root

---

## 🎯 **Quality Assurance**

### **Project Valuation & AI-Acceleration**
- **Scale**: **~39,000 Source Lines of Code (SLOC)** delivered in under two months by a solo developer with no prior professional experience.
- **Productivity**: An estimated **~54x acceleration factor** compared to traditional development models, as quantified by a COCOMO III analysis.
- **Capital Efficiency**: The project delivered an estimated **$1.5M in equivalent labor value** with a direct out-of-pocket cost of only **$18**.
- For a detailed breakdown, see the **[COCOMO III Project Analysis](docs/COCOMO_ANALYSIS.md)**.

---

### **Code Quality Metrics**
- **TypeScript Coverage**: 100% (Zero compilation errors)
- **ESLint Status**: Actively managed with a significant reduction in issues from over 135. All remaining issues are tracked and being systematically addressed.
- **Build Success**: 100% success rate
- **Test Coverage**: Comprehensive E2E and unit tests
- **Professional Standards**: Enterprise-grade architecture

### **Development Standards**
- **[Zero Trust Verification Protocol](docs/ZERO_TRUST_VERIFICATION_PROTOCOL.md)**: Every change verified
- **[Launch Readiness Plan](CONSOLIDATED_LAUNCH_READINESS_PLAN.md)**: Production deployment ready
- **[Professional Codebase Analysis](CODEBASE_STRUCTURE_ANALYSIS.md)**: Structure optimization

---

## 📜 License

This project is licensed under the **[Business Source License 1.1](LICENSE)**.

**Key points:**
- ✅ **Free for personal, educational, and non-profit use**
- ⚠️ **Commercial food service platforms require a commercial license**
- 🎯 **Converts to Apache 2.0 in 2029** (fully open source)

See the [LICENSE](LICENSE) file for complete terms and commercial use definitions.

**Commercial licensing:** zabrien@gmail.com

---

### Installation

To deploy this project locally, execute the following steps:

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
    Generate a `.env.local` file from the example:
    ```bash
    cp .env.local.example .env.local
    ```

    Populate the `.env.local` with desired values. The example file outlines how to configure keys and necessary values.

    **⚠️ IMPORTANT:** Avoid using `vercel env pull` for syncing env variables automatically as it risks overwriting your current setup.

    **Authentication Setup**:
    - **Supabase Authentication**: Powers user authentication and session management
    - **Critical Auth Variables**:
      - `NEXT_PUBLIC_SUPABASE_URL`: URL for your Supabase project
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public key for client-side Supabase connection
      - `SUPABASE_SERVICE_ROLE_KEY`: Service role key for server-side use
    - **OAuth Providers**: Utilize providers such as Google and GitHub for login
    - **Session Maintenance**: Secure token refresh handled by Supabase Auth

4.  **Execute Database Migrations**:
    Ensure Supabase is configured and migrations are applied via Supabase CLI:
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

This project is documented using the standard **7-document model** for professional software engineering projects.

| Document | Purpose |
|----------|----------|
| **[📝 Product Requirements (PRD)](docs/PRODUCT_REQUIREMENTS.md)** | What we're building, for whom, and why. |
| **[🛠️ Tech Stack](docs/TECH_STACK.md)** | The technologies used in the project. |
| **[🏗️ System Architecture](docs/ARCHITECTURE.md)** | The blueprint of the system. |
| **[👨‍💻 Developer Guide](docs/DEVELOPER_GUIDE.md)** | Comprehensive guide for developers including mock-up workflows. |
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
