# DUPLICATION REMEDIATION GUIDE

This guide provides a comprehensive overview of strategies, tools, and best practices for identifying and eliminating duplicate code in various forms across our project. It leverages lessons from our `.clinerules/` documentation and external research, consolidated to optimize code quality, maintainability, and development efficiency.

## 1. Overview

Duplicate code can take several forms:
- **Identical Blocks**: Exact repetitions of code blocks across different files or within the same file.
- **Logical Duplication**: Similar logic implemented in multiple places with slight variations.
- **Configuration Duplication**: Redundant or repeated configuration settings across components or modules.
- **UI Patterns**: Repeated React component structures or JSX patterns.
- **Imports and Dependencies**: Repeated imports of the same modules in different files.

Addressing these duplication types proactively improves codebase health and developer productivity while maintaining performance and scalability.

## 2. Strategies to Identify and Eliminate Duplication

### Code Deduplication
1. **Static Code Analysis**: Use tools like ESLint and SonarJS with rules like `sonarjs/no-duplicate-string`, `sonarjs/no-identical-functions`, and custom regex-based patterns to detect duplicate code blocks and functions.
2. **Visual Code Inspection**: Perform code reviews and utilize IDE features to highlight similar code fragments. For example, VSCode can highlight duplicate blocks using extensions like "Duplicate Code Finder".
3. **Semantic Hashing**: Implement checksum-based deduplication checks in build scripts using libraries like `js-string-hash` to identify identical function bodies at transpile time.

### Import Consolidation
1. **Enforce Module Path Validation**: Integrate `eslint-plugin-import` rules like `rules: {"import/no-duplicate": "error"}` in **eslint.config.mjs** to automatically flag duplicate imports. Configure grouping rules via `import/order` and `import/group-path-order`.
2. **Automate Sorting and Merging**: Utilize `eslint-plugin-perfectionist` for automated import sorting and duplicate consolidation. This plugin can deduplicate imports and group related modules together based on patterns.

### Logical Deduplication
1. **Extract Reusable Functions**: Consolidate repeated logic into pure functions that can be shared across components. For example, create utility handlers like:
    ```javascript
    export function getAuthToken(tokenProvider, refreshInterval="1hr"){
        // Logic for acquiring token
    }
    ```
2. **Implement Algorithmic Validation**: Leverage similarity detection tools like `diff-lib` or `fuzzysearch` to compare function implementations and highlight logical duplication. Use a threshold pattern match >= 80% for alerts.

### Configuration Refactoring
1. **Centralize Configurations**: Migrate repeated configuration settings to a single source of truth using modules like **config.js** to prevent duplication in **components/trucks/TruckContent.tsx** and **hooks/realtime/useTruckLocation.tsx**.
2. **Establish Environmental Constants**: Use dynamic imports with `import('node:path).resolve()` to ensure uniform configuration paths in `components/map/MapContent.tsx`.

### UI Component Optimization
1. **Consolidate React Components**: Identify similar UI components across different directories (e.g., TruckCard.tsx vs. AdminFoodTruckCard.tsx) and refactor into a shared component base in **components/ui/cards** like:
    ```jsx
    <SharedCard truck={truckData} size="large" admin={false} />
    ```
2. **Implement Shared Visual Patterns**: Create a UI Kit library pattern in components/ui/ using **Tailwind CSS classes** to prevent duplication in **map/MapDisplay.tsx**, where multiple identical button classes are detected. This ensures consistency.

## 3. Implementation Plan

### Phase 1: Audit & Remediation

1. **Comprehensive Scanning**
   - Run `npm install eslint-plugin-perfectionist eslint-plugin-sonarjs eslint-plugin-import`
   - Enable audit commands like `eslint . --fix` and `pmd/cpd -m 3`
   - Leverage `sonar js` CLI for logic-specific duplication
   - Check for repeated file names like `supabaseConfig.js` across the codebase

2. **Cross-Reference Naming Patterns**
   - Compare function names using regex groups to identify similar patterns, such as:
     - `getTruckData`, `fetchTruckInfo`, `retrieveTruckDetails`
     - Migrate to a unified function `getTruckDetails()`

3. **Review Component Hierarchy**
   - Analyze `components/ui` for redundant components like multiple **AlertBox** components across different context sections
   - Identify duplicate form builders in **FormBuilder.tsx** vs. **FieldInput.component.tsx**

### Phase 2: Pattern Replacement

1. **Function Extraction & Refactoring**
   - Migrate inline authentication functions like:
      ```javascript
       async function _handleAuth(loginData, provider="gemini") {
          // Logic from MapContent.tsx
       }
      ```
   - Convert to shared module functions in hooks/auth/useFirebaseLogin.js

2. **Automate Imports Consolidation**
   - Update `eslint.config.mjs` to enforce deduplicated imports (e.g., avoid multiple React imports):
      ```javascript
      module.exports = {
        rules: {
          "import/no-duplicate": "error"
      }
      ```

3. **Consolidate UI & Component Libraries**
   - Merge buttons/links/modals into `components/ui/UniversalButton` following the pattern defined in `.clinerules/code-org/react-composition`.

### Phase 3: Preventive Protocols

1. **Pre-CI/CD Hooks for Dupe Prevention**
   - Implement `lint-staged` scripts to run `eslint . --fix` pre-commit. Example `.husky/pre-commit` script:
      ```json5
      module.exports = {
        "*.{js,jsx,ts,tsx}": [
           "eslint --fix",
           "git add"
         ]
      };
      ```

2. **Continuous Deduplication Scans**
   - Schedule **SonarScanner** analysis nightly to monitor for duplicates and notify developers through Jira tickets. Create an automated trigger that connects with the Quality Gate's Slackbot integration.

3. **Implement Coding Standards Training**
   - Develop a coding standards enforcement training plan in `docs/SOPA_COMPLIANCE/coding-standards-checklist.md` referencing the duplication remediation guide.

4. **Establish Code Review Guidelines**
   - Mandate duplicate code prevention checks in all `PULL_REQUEST_TEMPLATE.md` files, including mandatory reviews for component consolidation across `/admin` and `/truck-finder` modules.

## 4. Resources

1. **SOP Documentation**: **.clinerules/code-org/react-composition.md**
2. **Quality Gate Configuration**: **&#39;.github/workflows/quality-gates.yml&#39;**
3. **Project Planning Overview**: **docs/PROJECT_PLANNING_AND_STATUS.md**
4. **Code Remediation Checklist**: **docs/CODE_REMEDIATION_CHECKLIST.md**

***

By following this comprehensive duplication remediation guide, we can effectively eliminate redundant code patterns, streamline our development processes, and maintain a clean, efficient, and scalable codebase. This proactive approach ensures that we adhere to the highest standards of coding quality and facilitate seamless collaboration across our development team.
