## Brief overview
This rule set outlines the correct configuration practices for Supabase environment variables in the food truck finder project, specifically addressing the proper naming conventions for client-side accessible variables.

## Development workflow
- **Rule 1.1: Correct Supabase Environment Variable Naming**: Always use the `NEXT_PUBLIC_` prefix for Supabase URL and anonymous key variables that need to be accessible client-side. Never use `SUPABASE_URL` alone as it's incorrect for client-side access.
  - _Trigger Case_: When configuring environment variables for Supabase integration
  - _Example_: 
    ```bash
    # ✅ Correct - Client-side accessible
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    
    # ❌ Incorrect - Will not work client-side
    SUPABASE_URL=your_supabase_url
    ```

- **Rule 1.2: Environment Variable Validation**: Always validate Supabase environment variables at application startup to ensure they are properly configured.
  - _Trigger Case_: Application initialization or configuration loading
  - _Example_:
    ```javascript
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }
    ```

- **Rule 1.3: Consistent Environment Variable Usage**: Use the same environment variable names across all environments (local, development, production) to maintain consistency.
  - _Trigger Case_: Setting up new environments or configuring CI/CD pipelines
  - _Example_: GitHub Actions workflow configuration
    ```yaml
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
    ```

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
