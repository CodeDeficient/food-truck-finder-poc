## Brief overview
This document outlines project-specific development conventions and best practices for maintaining high-quality and consistent code throughout the 'food-truck-finder' project. These guidelines have emerged from the collaborative efforts to resolve linting errors, eliminate code duplication, and implement effective type safety enhancements.

## Communication style
- **Concise responses**: All interactions should be clear and to-the-point, focusing on actionable solutions with brief explanations to ensure efficient problem-solving cycles.
- **No speculative preferences**: Avoid adding rules based on assumptions. All included guidelines are directly derived from observed project development needs.

## Development workflow
- **Strict TypeScript setup**: Ensure `tsconfig.json` enforces `strict: true` with all related flags enabled.
- **Component separation**: Use dedicated hooks for business logic to maintain modular component design (`e.g., hooks/* use...`).
- **Automated code fixes**: Prioritize the usage of automated fix scripts (`scripts/fix-scripts`) during linting sessions for bulk error correction.

## Coding best practices
- **Explicit prop typing**: Always define component props using `type` or `interface` to improve type safety and readability.
- **Component naming**: Use `KebabCase` for CSS classes and styles. Follow `PascalCase` syntax for React components and hooks.
- **Avoid `any` types**: Replace generic `any` type declarations with explicit type definitions or use `Record<string, unknown>` when generics are required.

## Linting & formatting strategies
- **Batch linting**: Combine lint checks (`scripts/batch-lint.sh`) with automated formatters (`prettier`). Include linter errors threshold configurations.
- **Duplicate detection**: Regularly run duplication detection tools (`scripts/find-duplicate-component-names.js`) to maintain architectural alignment per duplication remediation guidelines.

## Architectural guidelines
- **Feature first architecture**: Isolate feature-specific UI components within dedicated directories (`components/feature-name/`).
- **Middleware patterns**: Wrap custom middleware layers around Supabase client operations using `@lib/supabaseMiddleware.ts`.

## UI/UX preferences
- **Semantic component structure**: Utilize semantic layout components (`Header`, `Main`, `Section`) to structure content according to accessibility standards.

## Comment verbosity
- **Purpose-driven comments**: Add brief inline comments for complex logic blocks that aren't self-explanatory, adhering to SOTA (State of the Art) documentation practices.
