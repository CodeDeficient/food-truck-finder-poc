# Action Plan: Refactoring to React-Leaflet and Deduplicating UI

**Objective:** Resolve the "Map container is already initialized" error and improve code quality by migrating to an idiomatic `react-leaflet` implementation and consolidating duplicated UI components.

---

### **Developer's Briefing & Strategic Context**

*This section provides the "why" behind the action plan for the executing developer or AI.*

**1. The Core Problem (Diagnosis):**
The primary bug, "Map container is already initialized," is caused by a conflict between two different ways of creating a Leaflet map. The codebase currently contains both a manual implementation (via `hooks/useMapInitializer.ts`) and the `react-leaflet` library. These two systems are fighting for control over the same DOM element, leading to improper cleanup and re-initialization errors, especially in React's Strict Mode.

**2. The Evidence (How We Know):**
*   **`package.json` Analysis**: Confirmed that both `leaflet` (for manual use) and `react-leaflet` (the library) are installed dependencies.
*   **Code Review**:
    *   `hooks/useMapInitializer.ts` contains complex, manual logic to manage the map lifecycle.
    *   `components/map/MapContent.tsx` was found to be using *both* the manual hook and the `<MapContainer>` component from `react-leaflet`, which is the direct point of conflict.

**3. The Strategy (The "Why" Behind the Plan):**
*   **Prioritize `react-leaflet`**: We are choosing to eliminate the manual implementation and use `react-leaflet` exclusively. The library is purpose-built to handle React's lifecycle, state management, and cleanup idiomatically, which is far more robust and maintainable than a manual solution.
*   **SSR is a Key Consideration**: As a Next.js application, we must prevent the map component from rendering on the server. The standard and most effective way to do this is with a `next/dynamic` import, which will be a critical step.
*   **Address Code Duplication Concurrently**: The `jscpd` analysis revealed significant duplication of UI components (`Card`, `Badge`, etc.). The `.clinerules` for this project mandate that these be consolidated in the `components/ui` directory. Addressing this now reduces technical debt and prevents future inconsistencies.

**Conclusion for the AI:** Your task is to execute the following two-phase plan. Phase 1 stabilizes the map by removing the core conflict. Phase 2 improves overall code health by resolving the duplication issue.

---

## Phase 1: Stabilize the Map with `react-leaflet` (Core Fix)

*This phase focuses on removing the conflicting manual Leaflet implementation and using the `react-leaflet` library correctly.*

1.  **[X] Dependency Verification**:
    *   Confirmed `leaflet` and `react-leaflet` are in `package.json`.

2.  **[X] Refactor Core Map Component (`MapContent.tsx`)**:
    *   Removed the manual `MapInitializer` component and all associated logic.
    *   Rewrote `MapDisplay` to render `<MapContainer>` directly.
    *   Implemented a client-side-only rendering check.

3.  **[X] Delete Redundant Code**:
    *   Deleted the `hooks/useMapInitializer.ts` file.

4.  **[ ] Ensure Dynamic Loading (SSR Prevention)**:
    *   **Context**: Leaflet is a browser-only library and will throw errors if executed on the server. In Next.js, the standard way to prevent this is with a dynamic import.
    *   **Action**: Locate where the `MapDisplay` component (from `MapContent.tsx`) is imported and used (likely in a page component like `app/trucks/page.tsx` or `app/home/MainContent.tsx`).
    *   **Action**: Modify the import to use `next/dynamic`. This ensures the component and its children are only rendered on the client.
        ```javascript
        // Example for the parent component that renders the map
        import dynamic from 'next/dynamic';

        // The key is to use dynamic import for the component that contains the MapContainer
        const MapDisplay = dynamic(
          () => import('@/components/map/MapContent'),
          { 
            ssr: false, // This is the crucial part
            loading: () => <div style={{height: '400px', background: '#f0f0f0'}}><p>Loading map...</p></div> 
          }
        );
        ```
    *   **Verification**: The map should load without SSR-related errors, and the "Loading map..." message should appear briefly.

5.  **[ ] Final Map Verification**:
    *   **Action**: Run the application (`npm run dev`).
    *   **Verification**: Confirm the map renders correctly in the browser without any "Map container is already initialized" errors in the console.
    *   **Verification**: Test basic map interactions (pan, zoom).

---

## Phase 2: Consolidate Duplicated UI Components

*This phase addresses the code duplication found by `jscpd` and standardizes UI component usage based on the canonical definitions in `components/ui`.*

1.  **[X] Identify Duplicates**:
    *   Confirmed that `Card`, `Badge`, `Button`, etc., are used in many files, with canonical versions in `components/ui`.

2.  **[ ] Refactor `TruckCard.tsx` (High-Impact Target)**:
    *   **Context**: This component was identified as having a mix of correct and incorrect imports, along with using wrapper components instead of integrating logic directly.
    *   **Action**: Modify `components/TruckCard.tsx` to be a single, self-contained component.
        *   Merge the JSX and logic from `components/trucks/TruckCardHeader.tsx` directly inside the `<CardHeader>` section of `TruckCard.tsx`.
        *   Merge the JSX and logic from `components/ui/TruckCardContent.tsx` directly inside the `<CardContent>` section.
        *   Merge the JSX and logic from `components/trucks/TruckCardFooter.tsx` directly inside the `<CardFooter>` section.
    *   **Action**: Ensure all UI primitive components (`Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`, `Badge`, `Button`) are imported directly from `@/components/ui/[component-name]`.
    *   **Verification**: The `TruckCard` should render identically to its previous version.

3.  **[ ] Delete Redundant `TruckCard` Files**:
    *   **Action**: Once `TruckCard.tsx` is fully self-contained and verified, delete the following files:
        *   `components/trucks/TruckCardHeader.tsx`
        *   `components/ui/TruckCardContent.tsx`
        *   `components/trucks/TruckCardFooter.tsx`
    *   **Verification**: The application should build and run without errors after deletion.

4.  **[ ] Systematically Normalize All Other Component Imports**:
    *   **Action**: Using the output from the `find-duplicate-component-names.js` script as a guide, audit each listed file.
    *   **Action**: For each file, replace any incorrect, relative imports of `Card`, `Badge`, `Button`, etc., with the canonical path. For example:
        *   **Incorrect**: `import { Card } from '../ui/card';`
        *   **Correct**: `import { Card } from '@/components/ui/card';`
    *   **Verification**: After each file change, ensure the UI still renders correctly.

---

## Phase 3: Final Project-Wide Verification

1.  **[ ] Code Quality Checks**:
    *   **Action**: Run `npx eslint . --fix` to automatically fix any simple linting issues.
    *   **Action**: Run `npx eslint .` and `tsc --noEmit` to check for any remaining errors.
    *   **Verification**: Both commands should pass with zero errors.

2.  **[ ] Manual End-to-End Testing**:
    *   **Action**: Navigate through the application, paying special attention to pages with maps and cards.
    *   **Verification**: The application should be visually and functionally correct.
