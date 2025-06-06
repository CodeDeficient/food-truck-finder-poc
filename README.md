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
