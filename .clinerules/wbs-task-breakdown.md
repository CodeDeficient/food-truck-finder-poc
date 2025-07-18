# WBS Task Breakdown Guidelines

## Objective
To establish a consistent and reliable methodology for breaking down complex tasks into a detailed Work Breakdown Structure (WBS). This ensures clarity, reduces risk, and provides a clear path to completion.

## WBS Standard
All WBS documents must adhere to the following standards:

1.  **Numbered, Hierarchical Structure:** All tasks must be numbered in a hierarchical fashion (e.g., 1.1, 1.1.1).
2.  **Checkbox Placeholders:** Each task must be preceded by a `[ ]` placeholder to be marked with `[x]` upon completion.
3.  **CCR Rating:** Each task must be rated on a scale of 0-10 for Complexity, Clarity, and Risk (CCR).
    *   **Complexity:** How difficult is the task to implement?
    *   **Clarity:** How well is the task understood?
    *   **Risk:** What is the potential for unintended side effects?
4.  **Fractal Tasks:** All tasks must be broken down into their smallest possible components, with a CCR rating of 4 or lower.
5.  **Detailed Guidance:** Each task must include specific, actionable guidance on how to complete it.
6.  **Verification Steps:** Each task must include a clear verification step to confirm that it has been completed successfully.

## Example WBS Task

```markdown
- **[ ] 1.1: Resolve Unused '@ts-expect-error' Directive**
  - **Error:** `error TS2578: Unused '@ts-expect-error' directive.`
  - **Guidance:** The `@ts-expect-error` directive on line 4 is no longer necessary and should be removed.
  - **CCR:** C:0, C:10, R:0
  - **Verification:** Run `npx tsc --noEmit --pretty | findstr "TS2578"` and confirm the error is gone.
