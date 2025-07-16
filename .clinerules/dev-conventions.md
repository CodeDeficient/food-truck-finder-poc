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

## Zero-Trust Validation Enforcement Rules

### Mandatory Linting Protocol

Every file modification must trigger this exact sequence:

1.  **Pre-Change Linting**: Run `npx eslint [specific-file]` and record the baseline.
2.  **Post-Change Linting**: Run `npx eslint [specific-file]` and compare to the baseline.
3.  **Associated Files Linting**: Run `npx eslint [directory]` to check broader impact.
4.  **Project-Wide Check**: Run `npx tsc --noEmit` to ensure no project-wide breakage.

### File Impact Analysis Requirements

For every file touched, identify and lint-check these categories:

**Direct Dependencies**:
- [ ] Files that import the changed file.
- [ ] Files that export to the changed file.
- [ ] Test files associated with the changed file.

**Indirect Dependencies**:
- [ ] Files that use types exported from the changed file.
- [ ] Files that extend interfaces from the changed file.
- [ ] Configuration files that reference the changed file.

**Runtime Dependencies**:
- [ ] Files that interact with the changed file at runtime.
- [ ] Files that share state with the changed file.
- [ ] Files that depend on the changed file's side effects.

### Repetitive Validation Cycle Enforcement

The AI developer must complete these validation cycles for EVERY task, without exception:

**Cycle 1: Syntax and Compilation**
- [ ] Verify file syntax is correct.
- [ ] Verify TypeScript compilation succeeds.
- [ ] Verify no new compilation errors were introduced.

**Cycle 2: Linting and Code Quality**
- [ ] Verify ESLint rules pass on modified files.
- [ ] Verify no new linting errors were introduced.
- [ ] Verify associated files maintain linting standards.

**Cycle 3: Functional Verification**
- [ ] Verify intended functionality works as expected.
- [ ] Verify no regressions in existing functionality.
- [ ] Verify error handling works correctly.

**Cycle 4: Integration Testing**
- [ ] Verify imports and exports work correctly.
- [ ] Verify no breaking changes to dependent files.
- [ ] Verify type compatibility across boundaries.

**Cycle 5: Performance and Side Effects**
- [ ] Verify no performance degradation.
- [ ] Verify no unintended side effects.
- [ ] Verify memory usage remains acceptable.

### Failure Response Protocol

When any validation cycle fails:

1.  **Immediate Stop**: Cease all forward progress.
2.  **Rollback**: Restore to the last known good state.
3.  **Document**: Record what failed and why.
4.  **Re-analyze**: Determine the root cause before retrying.
5.  **Modify Approach**: Adjust the strategy based on the failure analysis.