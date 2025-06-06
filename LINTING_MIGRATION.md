# ESLint Flat Config is now authoritative

This project now uses the modern ESLint Flat Config format (`eslint.config.mjs`).

- The legacy `.eslintrc.json` is deprecated and has been removed (see `.eslintrc.json.REMOVED`).
- Only `eslint.config.mjs` should be edited for lint rules.
- `eslint.config.js` (duplicate) has been removed for clarity.
- All required plugins and dependencies are installed and up to date.
- Run `pnpm lint` or `pnpm lint:fix` to check or auto-fix code issues.

See `CODEBASE_RULES.md` for more details on code style and linting rules.
