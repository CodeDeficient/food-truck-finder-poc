# Remote web server design

_Automatically synced with your [v0.dev](https://v0.dev) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/rQOrGwmrQGh)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/codedeficients-projects/v0-remote-web-server-design](https://vercel.com/codedeficients-projects/v0-remote-web-server-design)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/rQOrGwmrQGh](https://v0.dev/chat/projects/rQOrGwmrQGh)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local Browser Debugging with browser-tools-mcp

This project uses [browser-tools-mcp](https://marketplace.visualstudio.com/items?itemName=browser-tools-mcp) for local browser-based debugging and inspection. To use:

1. Open the Command Palette in VS Code (`Ctrl+Shift+P`).
2. Search for and run `Browser Tools: Open Browser`.
3. Use the browser window to interact with your app at `http://localhost:3000` (or your dev server URL).
4. Use the browser-tools-mcp sidebar for DOM inspection, console, network, and accessibility audits.

See the [browser-tools-mcp documentation](https://marketplace.visualstudio.com/items?itemName=browser-tools-mcp) for advanced features and troubleshooting.

## Pre-commit Hooks with Husky and lint-staged

This project uses [Husky](https://typicode.github.io/husky/) to manage Git hooks and [lint-staged](https://github.com/okonet/lint-staged) to run linters on staged files, ensuring code quality and consistency before commits.

**How it works:**

- When you attempt to commit changes, Husky triggers the pre-commit hook.
- The pre-commit hook executes `pnpm exec lint-staged`.
- `lint-staged` then runs configured linters (`eslint --fix` and `prettier --write`) only on the files you've staged for commit.
- This process helps catch errors and enforce formatting standards automatically before code is added to the repository.

**Setup:**

1.  Husky and `lint-staged` are installed as dev dependencies.
2.  Husky is initialized (via `pnpm husky init` or automatically by the `prepare` script in `package.json`).
3.  The `.husky/pre-commit` hook is configured to run `pnpm exec lint-staged`.
4.  The `lint-staged` configuration in `package.json` specifies which commands to run on which file types.

# Food Truck Finder: Agentic Data Pipeline & Real-Time UI

## System Overview

This project implements an **agentic data pipeline** (autonomous web agent/data ingestion pipeline) that autonomously discovers, crawls, extracts, deduplicates, and ingests food truck data from the web. The system is designed for minimal manual intervention and leverages SOTA tools like Context7 and Tavily for discovery and extraction.

## How the Data Pipeline Works

- **Autonomous Discovery:** The backend agent regularly searches for new food truck directories and individual truck URLs using Firecrawl/Tavily.
- **URL Management:** Discovered directories and truck URLs are stored in a database table (e.g., `discovered_sources` or `pending_scrapes`).
- **Job Scheduling:** The agent schedules and triggers scraping jobs for new/unprocessed URLs.
- **Deduplication:** Ingestion logic upserts (updates if exists, inserts if not) based on a unique identifier (website URL or business name) to prevent duplicates.
- **Normalization:** Menu/category data is normalized to a canonical schema before DB insert.
- **Monitoring:** The pipeline tracks API usage, crawl coverage, and ingestion success/failure rates, alerting on anomalies.

## Real-Time Data Delivery to Users

- **Live UI Updates:** The frontend is designed to dynamically display new food trucks as they are scraped and ingested by the backend agent.
- **Tab-Based Navigation:** Each food truck is presented as a tab or card in the UI. As new trucks are discovered and processed, new tabs/cards appear in real time—no page reload required.
- **Fresh Data Guarantee:** The UI fetches the latest data from the backend (Supabase/PostgREST) using real-time subscriptions or polling, ensuring users always see the most up-to-date truck listings and menus.
- **Data Consistency:** As the agent updates or deduplicates truck entries, the UI reflects these changes instantly, providing a seamless, always-fresh experience.

## Key Search/Reference Terms

- "agentic data pipeline"
- "autonomous web agent"
- "autonomous data ingestion pipeline"
- "self-updating data pipeline"
- "web agent for data discovery and ingestion"

## Why This Matters

- This architecture enables a truly autonomous, scalable, and real-time food truck discovery platform.
- Using the right terminology in documentation and code ensures alignment with SOTA best practices and makes it easier to find and apply relevant workflows from the broader AI/data engineering community.

---

_See `SUMMARY.md` for a detailed technical breakdown and ongoing context updates._
