# WBS Impact Analysis Protocol

## 1. Objective
To ensure that for every action item in the `WBS_ROADMAP.md`, a comprehensive impact analysis is performed to identify all directly associated and indirectly affected files. This protocol is a mandatory precursor to the implementation of any task.

## 2. Protocol Steps

For each WBS action item, the following steps must be executed and their results documented directly within the `WBS_ROADMAP.md` under the corresponding task.

### 2.1. Identify Associated Files
- **Definition**: Files that will be directly created, modified, or deleted to complete the task.
- **Action**: List these files explicitly.
- **Example**: `Associated Files: [app/api/auth/route.ts, lib/auth/utils.ts]`

### 2.2. Identify Affected Files (Dependency & Dependant Analysis)
- **Definition**: Files that are not directly modified but whose behavior or correctness could be impacted by changes to the "Associated Files". This includes consumers of exported functions, types, or components, as well as dependencies that might be affected by changes in the associated files.
- **Action**: Analyze the "Associated Files" to trace their impact across the codebase. Document the findings.
- **Analysis Techniques**:
    - **Imports/Exports**: Find all files that import from or are imported by the "Associated Files".
    - **Type/Interface Usage**: Find all files that use types, interfaces, or schemas defined in the "Associated Files".
    - **Component Usage**: For UI components, find all instances where the component is rendered.
    - **Test Files**: Identify all test files (`*.test.ts`, `*.spec.ts`) that cover any of the associated or affected files.
- **Example**: `Affected Files: [components/auth/LoginButton.tsx (imports from lib/auth/utils.ts), tests/auth.spec.ts (tests route.ts)]`

## 3. Tooling & Verification
- **`read_file`**: To inspect the contents of identified files for detailed analysis.
- **`search_files`**: To perform broad searches for dependencies using regex (e.g., `import .* from 'lib/auth/utils'`).
- **`list_code_definition_names`**: To get a high-level overview of the exports and structure of a file or directory.
- **Verification**: The documented list of files for each WBS item will be considered the scope of work for that task. Any changes outside this scope require re-running this protocol.

## 4. Rule Integration
This protocol is now a mandatory component of the "Zero-Trust Planning Protocol" and must be applied to every task in the `WBS_ROADMAP.md` before implementation begins.
