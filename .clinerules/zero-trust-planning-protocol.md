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
- **[ ] Complexity, Clarity, and Risk (CCR) Rating:** Each task must be rated from 0-10.
    - **Complexity (C):** How difficult is the implementation?
    - **Clarity (C):** How well is the task understood?
    - **Risk (R):** What is the potential for unintended side effects?
- **[ ] Fractal Breakdown:** No task with a CCR rating greater than 4 in any category is considered "atomic." It must be broken down further until all sub-tasks are at or below CCR 4.
- **[ ] CCR Enhancement/Reduction:** Any task with a Complexity of 5 or higher, a Risk of 5 or higher, or a Clarity of 4 or lower must undergo a dedicated research and breakdown phase to reduce its CCR ratings before implementation begins.
- **[ ] Detailed Guidance:** Each task must include specific, actionable implementation steps.
- **[ ] Impact Analysis:**
    - **Associated Files:** List all files that will be directly modified.
    - **Affected Files:** List all files that could be indirectly impacted (e.g., through imports, type dependencies).
- **[ ] Fallback/Workaround Strategy:** Define a clear contingency plan if the primary approach fails.
- **[ ] Verification Steps:** Provide explicit commands or procedures to verify the task's successful completion.

## 4. Execution Workflow
The following workflow must be adhered to for every task defined in the WBS.

### Step 1: Research & Refine
- **Action:** Conduct exhaustive research on the task. This may involve using search tools, reading documentation, or analyzing existing code.
- **Goal:** Refine the WBS with detailed implementation notes, ensuring all CCR ratings are at or below 4.

### Step 2: Pre-Action Verification (PAV)
- **Action:** Before making any changes, verify the current state of the system.
- **Example:** Run `npx tsc --noEmit` to get a baseline TypeScript error count. Run `git status` to confirm a clean working directory.

### Step 3: Execute Atomic Action
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
- **Action:** Once a logical block of atomic tasks that constitutes a major WBS item is complete and fully verified, commit the changes with a descriptive message that references the WBS task number(s). This commit serves as a safe checkpoint before proceeding to the next major task.
- **Goal:** Maintain a clean, verifiable, and well-documented project history, with clear checkpoints that facilitate safe rollbacks.

## 5. Rule Integration
This protocol is now a core operational guideline. It supersedes any previous, less rigorous planning methods. All future actions will be governed by this document.
