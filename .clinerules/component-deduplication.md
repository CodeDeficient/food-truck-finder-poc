## Brief overview
This rules set outlines the process for deduplicating UI components and normalizing their imports to comply with the project's architecture requirements, specifically targeting Card and Badge components. The guidelines ensure that we eliminate redundant components and standardize file locations to improve maintainability and readability.

## Development workflow
  - **Identify and prioritize duplicates**: Use scripts/find-duplicate-component-names.js to identify components that exist in multiple directories. Prioritize UI primitives ( Cards, Buttons, Badges ) first.
  - **Refactor imports and locations**: Move duplicate components to the shared directory (components/UI).
  - **Verify and commit**: Ensure that all references to these components are updated to point to the new location. Re-run scripts/find-duplicates for confirmation.
  - **Fallback procedure**: If a direct script operation isn't viable, manually consolidate components. Log these actions in `docs/DUPLICATION_REMEDIATION_GUIDE.md` for documentation and future reference.

## Validation strategy
  - **Cross-check imports**: Run a comprehensive check to ensure consistent import paths across modules.
  - **Codebase-wide analysis**: Utilize the `search-files` tool to verify the removal of duplication and standardization of imports. Use the search patterns:
    ```
    SEARCH: import Card from `.*/Card` 
    REPLACE: import {Card} from @/components/ui/card
    ```
    ```
    SEARCH: import Badge from `.*\Badge`
    REPLACE: import {Badge} from @/components/ui/badge
    ```
  - **Commit confirmation**: Once all duplicate entries are identified, replace and re-run scripts/find-duplicates to validate that no duplications exist.

## SocialMediaSection Deduplication
- 📌 Moved SocialMediaSection to components/ui/SocialMediaSection.tsx
- 📌 Removed duplicate implementation in components/trucks/SocialMediaSection.tsx

<-- 2025-07-03 - Analysis2 task complete (SocialMediaSection duplication resolved) -->

## Code pattern examples
  - **Move Card**:
    - Move `components/trucks/TruckCard.tsx` to `components/ui/TruckCard.tsx`
    - Update imports in `components/admin/pipeline/*` to reference `@/components/ui/TruckCard`

  - **Move Badge**:
    - Move `components/status-indicator/Badge.tsx` to `@/components/ui/Badge.tsx`
    - Update imports in `components/analytics/DailyStats.tsx` to reference `@/components/ui/Badge`

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

## Recent Updates - Data Pipeline Duplicate Prevention

### Enhanced Duplicate Detection System
The food truck data pipeline now implements sophisticated duplicate prevention using:
- **Unicode Normalization**: Handles different Unicode representations of apostrophes and special characters
- **Fuzzy Matching**: Uses Levenshtein distance for name similarity scoring
- **Weighted Scoring**: Considers name, location, contact info, and menu similarity with configurable weights
- **Threshold-Based Merging**: Automatically merges entries above 80% similarity threshold

### Consistent Logic Across Environments
Both real-time processing and batch deduplication now use identical duplicate detection algorithms to ensure consistency. When import dependencies are problematic in batch scripts, duplicate prevention logic is copied directly into the scripts rather than imported.
