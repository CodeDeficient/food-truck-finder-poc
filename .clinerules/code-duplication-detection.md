## Brief overview
This rule establishes strict protocols for code duplication detection, moving from manual identification to automated discovery using proven npm packages. Emphasizes CLI-based tooling and structured analysis paths.

## Tool Selection
  - **npm packages**:
    - **dupd** - Code duplication detection using npm modules
    - **ncp** - Windows-safe path comparison (resolves path separator issues)
  - **Windows compatibility**: 
    - Always use path.normalize in comparison scripts
    - Avoid batch files for automation

## Integration with Project
  - **CLI setup**:
     ```
     npm install -D dupd ncp
     node scripts/detect-dups.js
     ```
  - **Script structure**:
    - Create `detect-dups.js` in `scripts/`
    - Use dupd.compareSync to detect duplicate code blocks
    - Output results to `test-results/duplication-analysis-YYYY-MM-DD.json`
  - **ESLint integration**:
     ```javascript
     // eslint.config.mjs
     rules: {
       '@typescript-eslint/no-duplicate-imports': 'error',
     },
     ```

## Trigger cases
  - Any component appearing across >2 directories (Card/Button/Badge)
  - Filesystem renames preserving logical paths (truck-card vs TruckCard)
  - Structural duplication in auth/login vs admin/realtime components

## Reporting
  - Create test-results/duplication-analysis.json log
    - {"count": 42, "duplicates":["truck-card", "button-primary"]}
  - Generate summary markdown in docs/DUPLICATION_REPORT.md
  - Schedule post-merge hooks using husky
