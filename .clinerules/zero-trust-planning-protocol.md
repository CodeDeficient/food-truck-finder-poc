# Zero-Trust Planning & Execution Protocol

## 1. Objective
To establish a rigorous, comprehensive, and fault-tolerant planning and execution methodology that minimizes technical debt, reduces execution errors, and ensures all development work is meticulously researched, planned, and verified.

## 2. Core Principles
- **Never Trust, Always Verify:** Do not assume any step will succeed. Every action must be followed by a verification step.
- **Plan Fractally:** Break down every task into its smallest possible, independently verifiable components.
- **Anticipate Failure:** For every action, identify potential failure points and define fallback strategies in advance.
- **Measure Twice, Cut Once:** Prioritize exhaustive research and analysis before writing any code.

## 3. The WBS (Work Breakdown Structure) Standard
All tasks must be broken down into a detailed WBS document before execution begins. This document is the single source of truth for the task.

### WBS Requirements:
- **[ ] Hierarchical & Numbered Tasks:** All tasks must be numbered (e.g., 1.1, 1.1.1) and have a `[ ]` checkbox.
- **[ ] High-Level Context:** The WBS must begin with a preamble establishing the overall vision, current state, and strategic goals, ensuring any developer can understand the "why" behind the tasks.
- **[ ] Complexity, Clarity, and Risk (CCR) Rating:** Each task must be rated from 0-10.
    - **Complexity (C):** How difficult is the implementation?
    - **Clarity (C):** How well is the task understood? (Target: 8+)
    - **Risk (R):** What is the potential for unintended side effects? (Target: 3 or lower)
- **[ ] Fractal Breakdown:** No task with a CCR rating greater than 4 in Complexity or Risk, or less than 8 in Clarity, is considered "atomic." It must be broken down further until all sub-tasks meet these thresholds.
- **[ ] Detailed Guidance:** Each task must include specific, actionable implementation steps.
- **[ ] Tools & Libraries:** Explicitly list the primary tools and libraries to be used for the task.
- **[ ] Common Pitfalls & Fallbacks:** Proactively identify potential failure points and define clear fallback or contingency plans.
- **[ ] Impact Analysis:**
    - **Associated Files:** List all files that will be directly modified.
    - **Affected Files:** List all files that could be indirectly impacted (e.g., through imports, type dependencies).
    - **Security Impact:** Analyze potential security risks introduced by the change. This includes, but is not limited to: data exposure, injection vulnerabilities, insecure direct object references, and permission escalations. For any new table with user-specific data, confirm that RLS is planned.
- **[ ] Verification Steps:** Provide explicit commands or procedures to verify the task's successful completion.
- **[ ] Verification Checkpoints:** Major sections of the WBS must conclude with a dedicated "Verification Checkpoint" task that consolidates all necessary checks (`tsc`, `eslint`, `jscpd`, manual E2E tests) to ensure the stability of the codebase before proceeding.

## 4. Git Workflow & Execution Protocol
The following workflow, incorporating a feature branching strategy, must be adhered to for every major WBS section (e.g., 2.0, 3.0).

### Step 1: Create a Feature Branch
- **Action:** Before beginning a new major section of the WBS, create a dedicated feature branch from the `main` branch.
- **Branch Naming Convention:** `feature/WBS-X.X-brief-description` (e.g., `feature/WBS-2.0-admin-security`).
- **Example:** `git checkout main && git pull && git checkout -b feature/WBS-2.0-admin-security`

### Step 2: Research & Refine
- **Action:** Conduct exhaustive research on the tasks within the WBS section.
- **Goal:** Refine the WBS with detailed implementation notes, ensuring all CCR ratings are at or below the defined thresholds.

### Step 3: Pre-Action Verification (PAV)
- **Action:** Before making any changes on the new branch, verify the current state of the system.
- **Example:** Run `npx tsc --noEmit` to get a baseline TypeScript error count. Run `git status` to confirm a clean working directory.

### Step 4: Execute Atomic Action
- **Action:** Perform a single, atomic action as defined in the WBS.
- **Example:** Execute one `replace_in_file` operation, run one `npm install` command, or create one new file.

### Step 4: Post-Action Verification (PoAV)
- **Action:** Immediately after the action, verify its outcome.
- **Example:**
    - After `replace_in_file`, re-read the file to confirm the change was applied correctly.
    - After `npm install`, check `package.json` and `package-lock.json`.
    - Run `npx tsc --noEmit` and `npx eslint .` to ensure no new errors were introduced.
- **Protocol:** If PoAV fails, **STOP**. Do not proceed. Re-evaluate the plan, revert the change if necessary, and return to Step 1.

### Step 5: Document & Commit (Create Checkpoint)
- **Action:** After each successful PoAV, commit the change with a descriptive, atomic message that references the WBS task number.
- **Example:** `git commit -m "feat(auth): WBS-2.1.3.1 - Draft RBAC ENUM types"`
- **Goal:** Maintain a clean, verifiable, and well-documented project history, with clear checkpoints that facilitate safe rollbacks.

### Step 6: Complete Feature and Merge
- **Action:** Once all tasks and the final verification checkpoint for the WBS section are complete, merge the feature branch back into `main`.
- **Example:** `git checkout main && git pull && git merge --no-ff feature/WBS-2.0-admin-security && git push`

## 5. Rule Integration
This protocol is now a core operational guideline. It supersedes any previous, less rigorous planning methods. All future actions will be governed by this document.
