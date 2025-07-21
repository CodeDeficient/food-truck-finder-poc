# WBS Impact & Cross-Reference Protocol

## 1. Objective
To ensure that every code modification or file creation triggers a systematic impact analysis and cross-reference check. This protocol prevents misalignments such as mismatched types, cloned code, broken dependencies, or suboptimal code integrations, and is a mandatory precursor to the implementation of any task.

## 2. Protocol Steps

### 2.1. Pre-Change Analysis
Before making any changes, perform the following analysis:

- **Identify Associated & Affected Files:**
    - **Associated Files**: List all files that will be directly created, modified, or deleted.
        - *Example*: `Associated Files: [app/api/auth/route.ts, lib/auth/utils.ts]`
    - **Affected Files (Dependencies)**: Identify all files that import or depend on the file to be modified. This includes consumers of exported functions, types, components, and associated test files.
        - *Example*: `Affected Files: [components/auth/LoginButton.tsx (imports from lib/auth/utils.ts), tests/auth.spec.ts (tests route.ts)]`

- **Review Contracts:**
    - Review the existing function signatures, types, and component props to understand the "contract" that the file has with the rest of the codebase.

### 2.2. Post-Change Verification
After making modifications, perform the following verification steps:

- **Run Automated Checks:** After every 10-15 edits, run the following checks to catch any issues early:
  - `npx tsc --noEmit`
  - `npx eslint .`
  - `npx jscpd .`

- **Perform Manual Cross-Reference Check:** After the automated checks pass, manually verify that the changes are consistent with the rest of the codebase. This includes:
  - **Type Consistency:** Ensure that the types in the modified file are consistent with the types in the files that import it.
  - **Prop Consistency:** Ensure that the props in the modified component are consistent with the props in the components that use it.
  - **Function Signature Consistency:** Ensure that the function signatures in the modified file are consistent with the function signatures in the files that call them.
  - **No New Duplication:** Ensure that the changes do not introduce any new code duplication.

## 3. Tooling
- **`read_file`**: To inspect the contents of identified files for detailed analysis.
- **`search_files`**: To perform broad searches for dependencies using regex (e.g., `import .* from 'lib/auth/utils'`).
- **`list_code_definition_names`**: To get a high-level overview of the exports and structure of a file or directory.

## 4. Rule Integration
This protocol is a mandatory component of the "Zero-Trust Planning Protocol" and "Zero-Trust Post-Action Verification Protocol". It must be applied to every task before and after implementation.
