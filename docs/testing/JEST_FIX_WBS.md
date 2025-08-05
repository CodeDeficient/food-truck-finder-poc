# WBS for Jest Test Suite Remediation

## 0. Preamble & Goals

**Vision:** Achieve a fully stable and reliable test suite where all tests pass. This is a critical prerequisite for implementing new features like Google OAuth, as it provides a safety net against regressions.

**Current State:** The test suite is currently unstable, with 17 failed suites due to a mix of configuration issues (`ReferenceError: jest is not defined`, ESM/CJS import errors) and specific test logic failures.

**Strategic Goals:**
- Eliminate all Jest configuration errors.
- Ensure seamless interoperability between Jest, TypeScript, and ES Modules.
- Fix all individual test logic failures.
- Establish a "green" test suite that can be run reliably in CI/CD pipelines.

---

## 1.0 Pre-Analysis & Setup

- **[ ] 1.1: Create WBS Document**: This document is the single source of truth for the task. (Completed by creating this file).
- **[x] 1.2: Baseline & Categorize Failures**:
    - **[x] 1.2.1: Execute `npm test`** to get a definitive list of all failing test suites.
    - **[x] 1.2.2: Categorize every failure** into one of these groups and list them here:
        
        **Category 1: `ReferenceError: jest is not defined`**
        - `tests/utils/typeGuards.test.ts` (lines 74, 81)
        - `__tests__/components/TruckContactInfo.test.tsx` (line 7)
        - `tests/lib/scraperEngine.test.ts` (line 6)
        - `tests/lib/firecrawl.test.ts` (line 7)
        - `tests/lib/autoScraper.test.ts` (line 4)
        
        **Category 2: ESM/CJS module import/require errors**
        - `lib/fallback/supabaseFallback.test.tsx` - Supabase ESM import issue (`isows/_esm/native.js`)
        - `__tests__/auth/AuthProvider.test.tsx` - Supabase ESM import issue
        - `components/auth/__tests__/AuthModal.test.tsx` - Supabase ESM import issue
        - `tests/lib/gemini.test.ts` - Supabase ESM import issue
        - `tests/lib/discoveryEngine.test.ts` - Supabase ESM import issue
        - `__tests__/accessibility-basic.test.js` - `require is not defined`
        - `__tests__/accessibility.test.js` - `SyntaxError: Unexpected token '<'`
        - `tests/lib/pipelineProcessor.test.ts` - `Cannot find module './pipeline/index.js'`
        
        **Category 3: Specific test logic failures**
        - `tests/lib/dataValidator.test.ts` - Expected "Menu item with empty name" not found
        - `tests/utils/typeGuards.test.ts` - Array validation logic error
        
    - **Tools:** `run_command`
    - **Verification:** The output of the test command is captured and failures are categorized above.

---

## 2.0 Phase 1: Fixing `ReferenceError: jest is not defined`

- **[ ] 2.1: Isolate and Conquer**: Target a single test file that exhibits the `ReferenceError`.
    - **Task:** Identify the first file from the baseline run in 1.2.2.
- **[ ] 2.2: Atomic Action**: Add `import { jest } from '@jest/globals';` to the top of the selected file.
    - **Tools:** `edit_files`
- **[ ] 2.3: Post-Action Verification**: Re-run the test for that specific file to confirm the `ReferenceError` is resolved.
    - **Tools:** `run_command`
- **[ ] 2.4: Scale the Fix**: Apply the same import statement to all other files affected by this error.
    - **Task:** Identify all files from the baseline with this error and create a single `edit_files` call.
    - **Tools:** `edit_files`
- **[ ] 2.5: Verification Checkpoint**:
    - **[ ] 2.5.1:** Run the full test suite (`npm test`).
    - **[ ] 2.5.2:** Document the new state of test failures.
    - **Tools:** `run_command`, `edit_files` (to update this doc).

---

## 3.0 Phase 2: Fixing Module Interoperability Errors

- **[ ] 3.1: Address CJS `require` issue**:
    - **File:** `__tests__/accessibility-basic.test.js`
    - **[ ] 3.1.1: Action**: Replace `const { axe, toHaveNoViolations } = require('jest-axe');` with `import { axe, toHaveNoViolations } from 'jest-axe';` and update `expect.extend(toHaveNoViolations);`.
    - **[ ] 3.1.2: Verification**: Run the specific test file to ensure the `require is not defined` error is gone.
    - **Tools:** `edit_files`, `run_command`
- **[ ] 3.2: Address ESM `import` issue with Supabase**:
    - **Analysis**: The error `Must use import to load ES Module ... isows/_esm/native.js` is a classic Jest + ESM issue. Our `.clinerules/esm-import-best-practices.md` documents verified solutions for this.
    - **[ ] 3.2.1: Apply Known ESM Rules**: Based on our established rules:
        - **Rule 6.5**: Use appropriate import/export syntax for each context (ESM vs CJS)
        - **Pattern**: ESM modules requiring environment variables should use dynamic imports
        - **Jest Config**: Update `transformIgnorePatterns` to exclude problematic ESM packages
    - **[ ] 3.2.2: Research Missing Patterns**: If our established rules don't cover specific scenarios, use `context7` and `tavily-search` for additional patterns.
    - **[ ] 3.2.3: Action**: Modify `jest.config.cjs` based on verified patterns:
        - Add `@supabase/*`, `isows/*` to `transformIgnorePatterns`
        - Ensure ESM preset is correctly configured
        - Verify environment variable loading patterns
    - **[ ] 3.2.4: Verification**: Run a test file that previously failed with this error (e.g., `components/auth/__tests__/AuthModal.test.tsx`) to confirm the fix.
    - **Tools:** `read_files` (for our rules), `context7`, `tavily-search`, `edit_files`, `run_command`
- **[ ] 3.3: Verification Checkpoint**:
    - **[ ] 3.3.1:** Run the full test suite (`npm test`).
    - **[ ] 3.3.2:** Document the new state of test failures.
    - **Tools:** `run_command`, `edit_files` (to update this doc).

---

## 4.0 Phase 3: Fixing Individual Test Logic Failures

- **[ ] 4.1: Address Remaining Test Failures**:
    - **Task:** Go through each remaining failing test one by one.
    - **For each test:**
        - **[ ] 4.1.X.1: Analyze the error message.**
        - **[ ] 4.1.X.2: Read the test file and the component it tests.**
        - **[ ] 4.1.X.3: Formulate a fix.**
        - **[ ] 4.1.X.4: Apply the fix.**
        - **[ ] 4.1.X.5: Verify the fix by running the single test.**
    - **Tools:** `read_files`, `edit_files`, `run_command`
- **[ ] 4.2: Verification Checkpoint**:
    - **[ ] 4.2.1:** Run the full test suite (`npm test`).
    - **[ ] 4.2.2:** Confirm all tests pass.
    - **Tools:** `run_command`

---

## 5.0 Final Verification

- **[ ] 5.1: Final TypeScript Check**: Run `npx tsc --noEmit`.
- **[ ] 5.2: Final Lint Check**: Run `npx eslint .`.
- **[ ] 5.3: Update Documentation**: Mark this WBS as complete.
