# Cline's Operational Rules & Learnings

This file documents the rules, best practices, and key learnings I develop while working on this codebase. Adhering to these rules ensures consistency, quality, and alignment with project governance.

## **Rule Set: Linting Remediation**

### **1. Prioritization Protocol**

- **Rule 1.1:** Always prioritize manual refactoring for `max-lines-per-function` and `sonarjs/cognitive-complexity` errors over any other linting rule. These require architectural judgment and are unsafe to automate.
- **Rule 1.2:** Address high-confidence automatable errors (e.g., `unused-import`, `no-null`) before tackling medium-confidence or manual errors to achieve the quickest reduction in error count.
- **Rule 1.3:** When addressing manual errors, use the output of `scripts/get-high-impact-files.cjs` to systematically target files with the highest error counts first.

### **2. Automation Governance**

- **Rule 2.1:** Do not automate fixes for `@typescript-eslint/strict-boolean-expressions`. The risk of introducing logical errors by misinterpreting developer intent with nullable values is too high. This was learned from the `revert-boolean-fixer-damage.cjs` script, which was created to undo previous failed automation attempts.
- **Rule 2.2:** Automation for type-safety rules (`no-explicit-any`, `no-unsafe-assignment`) must be treated as medium-confidence. While some patterns can be fixed, a full solution requires manual type annotation and contextual understanding.
- **Rule 2.3:** For error object stringification, use `JSON.stringify()` instead of `String()` when the error type is `unknown` or `any`. The `@typescript-eslint/no-base-to-string` rule prevents unsafe stringification of objects that could result in `[object Object]` output.

### **3. Refactoring & Code Modification**

- **Rule 3.1:** When a function exceeds the `max-lines-per-function` limit, apply the following refactoring patterns in order of preference:
  1.  **Component Extraction:** If the code is in a React component, extract JSX into smaller, focused sub-components.
  2.  **Custom Hook Extraction:** Encapsulate state management, data fetching, or complex business logic within custom hooks (`use...`).
  3.  **Service/Helper Function Extraction:** Decompose non-UI logic into separate service modules or utility functions with single responsibilities.
- **Rule 3.2:** When fixing `sonarjs/prefer-read-only-props`, carefully assess the mutability requirements of the object. Applying `readonly` incorrectly can cause cascading issues. Prioritize `readonly` for props objects and data models that are not intended to be mutated.

## **Rule Set: General Operations**

### **1. Command & Script Execution**

- **Rule 1.1:** Before running any fixing script, always get a baseline error count using `node scripts/count-errors.cjs`. After the script runs, get a new count to precisely measure the impact of the changes.
- **Rule 1.2:** Use the `scripts/analyze-error-patterns.cjs` script to get a detailed breakdown of error types. This is the source of truth for identifying automation candidates.

### **2. Documentation & Reporting**

- **Rule 2.1:** All significant actions, analyses, and status changes must be logged in `🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md`. This is the central coordination point.
- **Rule 2.2:** Any new, broadly applicable learning or operational standard must be codified and added to this `.clinerules` file.

## **Rule Set: Code Style**

### **1. Function Length**

    - **Rule 1.1:** New functions cannot exceed 50 lines.
    - **Rule 1.2:** This rule is enforced by the `max-lines-per-function` linting rule.
