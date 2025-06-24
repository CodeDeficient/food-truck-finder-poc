# Food Truck Finder Application

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rQOrGwmrQGh)

## Overview

The Food Truck Finder Application is a modern web application designed to help users discover and locate food trucks in their vicinity. It provides real-time information on food truck locations, operating hours, menus, and ratings. The project emphasizes adherence to State-of-the-Art (SOTA) best practices in software development, including robust data pipelines, comprehensive testing, and high code quality standards.

## Features

-   **Food Truck Discovery**: Easily find food trucks based on location, cuisine type, and operating status.
-   **Detailed Information**: View comprehensive details for each food truck, including menus, operating hours, contact information, and social media links.
-   **Real-time Updates**: Get live updates on food truck locations and availability.
-   **Search & Filtering**: Advanced search and filtering options to narrow down food truck results.
-   **Admin Dashboard**: (Under Development) A secure admin interface for managing food truck data, monitoring system metrics, and overseeing data quality.

## Technologies Used

-   **Frontend**: Next.js, React, TypeScript, Tailwind CSS
-   **Backend**: Next.js API Routes, Supabase (PostgreSQL, Auth, Storage, Edge Functions)
-   **Data Scraping**: Custom web scraping pipeline with robust error handling and data quality checks.
-   **Testing**: Playwright (E2E), Jest (Unit/Integration)
-   **Linting & Formatting**: ESLint, Prettier, Husky, lint-staged
-   **Monitoring**: Custom API monitoring and system alerts.

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
    Ensure your Supabase database is set up and run any pending migrations. (Details on specific migration commands will be added here if needed).

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

For a comprehensive overview of the application's architecture, data pipeline, and database schema, please refer to the [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md). For linting and code quality guidelines, refer to the [Linting and Code Quality Guide](LINTING_AND_CODE_QUALITY_GUIDE.md).

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
