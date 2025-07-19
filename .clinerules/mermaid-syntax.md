## Brief overview

This rule set outlines guidelines for writing Mermaid diagrams to ensure they render correctly.

## Development workflow

- **Rule 1.1: Escape Special Characters in Mermaid Diagrams**: When creating Mermaid diagrams, ensure that any node text containing special characters (e.g., `(`, `)`, `[`, `]`, `{`, `}`) is enclosed in double quotes (`""`) to prevent parsing errors.
  - _Trigger Case_: When a Mermaid diagram fails to render due to a parsing error.
  - _Example_: Instead of `C[Frontend (Next.js)]`, use `C["Frontend (Next.js)"]`.

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