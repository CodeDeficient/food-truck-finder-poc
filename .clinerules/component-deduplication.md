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
