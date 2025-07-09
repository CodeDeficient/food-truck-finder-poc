**Goal**: Eliminate or refactor 48 code clones identified by jscpd to improve code maintainability, adhere to project guidelines, and prevent introducing new issues.

**Clear Goals**:
- Identify all duplicate code instances using jscpd and categorize them (e.g., UI components, utility functions, hooks).
- Prioritize fixes based on file timestamps: newer files take precedence over older ones, as they are assumed to have more accurate and lint-compliant code.
- Refactor or delete duplicate code without violating any rules from the .clinerules/ directory (e.g., max-lines-per-function, type safety, and linting standards).
- Document all changes and ensure no new clones or errors are introduced.
- Complete the process within [insert specific timeline if known, e.g., 5-7 days], or leave flexible.

**Relevant Files and Directories**:
- **Primary Files**: Focus on `jscpd-report/jscpd-report.json` and files in the `CodeAnt/` directory (e.g., `CodeAnt/CodeAnt_analysis.md` and `CodeAnt/CodeAnt_analysis2.md`) for duplication analysis.
- **Codebase Structure**: Examine directories like `components/`, `hooks/`, `lib/`, and `app/` using tools like `list_files` or `search_files` to explore recursively.
- **Supporting Files**: Consult `.clinerules/component-deduplication.md` and other .clinerules/ files for deduplication strategies and rules.

**Helpful Examples**:
- **Deduplication Example**: From `component-deduplication.md`, use scripts like `find-duplicate-component-names.js` to identify and move duplicate components to `components/ui/`, updating imports with regex patterns.
- **Prioritization Example**: Check file timestamps to favor newer files; if unavailable, prioritize files with `.tsx` extensions for UI-related clones.
- **Validation Example**: After refactoring, run `npx eslint . --fix` to ensure type safety and compliance with .clinerules/ rules.

**Precise Constraints**:
- **Timestamp Priority**: Always verify file timestamps before editing or deleting; prefer newer files. If timestamps aren't accessible, use directory structure or version control history (e.g., via Git) to infer recency.
- **Rule Adherence**: Strictly follow .clinerules/ guidelines, such as:
  - `max-lines-per-function`: Keep functions under 50 lines.
  - Type Safety: Use explicit typing (e.g., interfaces) and handle nullish values with checks like `if (value !== undefined)`.
  - Linting: Run `npx eslint . --fix` before and after changes to catch errors.
- **Tool Limitations**: In ACT MODE, use tools like `replace_in_file` or `write_to_file` for edits, but only after confirming success. Avoid assumptions; always re-read files post-edit.
- **Output Format**: The final output should include a WBS checklist and documentation in `docs/DUPLICATION_REMEDIATION_GUIDE.md`.

**Additional Considerations**:
- **Risk Mitigation**: Re-check for clones post-fix using jscpd, and use `search_files` to verify no duplicates remain.
- **Timeframe**: Aim for completion in [specify if known], but be prepared to adjust based on feedback.
- **User Feedback**: After each phase, confirm with the user to ensure alignment.

**What's the User Really Trying to Do**: Systematically address code duplication to improve project quality, reduce maintenance overhead, and align with governance rules, likely stemming from recent linting errors or performance issues.

**Rules to Adhere To**: All actions must comply with .clinerules/ aka GEMINI.md, including precision in edits and post-implementation checks.

---

## Memory Management Guidelines

This section outlines how the `save_memory` tool should be used to store information for future interactions.

**Source of Truth**: The primary source of truth for operational guidelines and learnings is `GEMINI.md` (which includes the `.clinerules/` directory). Information in `GEMINI.md` is for general project context and rules applicable to all tasks.

**When to Use `save_memory`**:
- Use `save_memory` to store *user-specific* facts or preferences that are explicitly stated by the user.
- This tool is for information that helps personalize or streamline *your future interactions with the user*.

**What to Save (Examples)**:
- User's preferred coding style (e.g., "My preferred style is to use arrow functions for all React components.").
- Common project paths the user frequently references (e.g., "The main component directory is `components/ui/`.").
- Personal tool aliases or configurations (e.g., "I use `npm run dev` to start the development server.").

**What NOT to Save (Examples)**:
- General project context (e.g., "The project uses Next.js."). This belongs in `GEMINI.md`.
- Information that is already documented in `GEMINI.md` or other project files.
- Temporary conversational context.
- Long, complex, or rambling pieces of text. Facts should be concise.

**How to Use**:
- If the user explicitly asks you to remember something, use `save_memory` with the exact fact.
- If a user states a clear, concise piece of information that would help personalize future interactions, consider using `save_memory`. If unsure, you can ask the user, "Should I remember that for you?"
