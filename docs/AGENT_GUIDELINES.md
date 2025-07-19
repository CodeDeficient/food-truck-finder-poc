# AGENT GUIDELINES

This document provides a comprehensive set of rules, protocols, and guidelines for all AI agents working on the Food Truck Finder project. Adherence to these guidelines is mandatory to ensure effective collaboration, prevent conflicts, and maintain high code quality.

## 1. 🚨 CRITICAL: BEFORE YOU START - MANDATORY CHECKS

### Step 1: Verify Existing Implementation

Use `codebase-retrieval` to check for existing functionality before creating anything new.

```bash
"Show me all existing [service/route/component] implementations for [feature]"
```

### Step 2: Check for Duplicates

- **Database services**: Use `lib/supabase.ts` ONLY.
- **Pipeline operations**: Use `/api/pipeline` ONLY.
- **API routes**: Check existing routes first.
- **Components**: Check `components/` directory.

### Step 3: Review Current Rules

- Read the relevant sections of this document.
- Check `FILE_STRUCTURE_STANDARDS.md` for patterns.

### Step 4: ⚠️ STRUCTURAL CHANGE PREVENTION

If planning file removal, import path changes, or service consolidation:

- 🚨 **MANDATORY**: Follow `STRUCTURAL_CHANGE_PREVENTION_CHECKLIST.md`.
- 🚨 **MANDATORY**: Run `npm run lint > lint-before.json` to capture a baseline.
- 🚨 **MANDATORY**: Single agent assignment only.
- 🚨 **MANDATORY**: Plan import path changes before starting.

## 2. 🤖 AGENT EXCLUSIVITY PROTOCOL

### SINGLE AGENT RULE

**ONLY ONE AGENT** may work on linting remediation at any time.

#### BEFORE STARTING WORK:

1.  ✅ Check `PROJECT_PLANNING_AND_STATUS.md`: Is another agent marked as ACTIVE?
2.  ✅ If YES → STOP and coordinate handoff.
3.  ✅ If NO → Update status to ACTIVE in `PROJECT_PLANNING_AND_STATUS.md`.
4.  ✅ Run baseline check: `npm run lint`.
5.  ✅ Record baseline error count.

#### DURING WORK:

1.  ✅ Update progress in real-time.
2.  ✅ Commit frequently with clear messages.
3.  ✅ Never leave broken states uncommitted.
4.  ✅ Monitor error count after each change.
5.  ✅ Stop immediately if error count increases.

#### WHEN FINISHING:

1.  ✅ Run final linting check: `npm run lint`.
2.  ✅ Update final error count in `PROJECT_PLANNING_AND_STATUS.md`.
3.  ✅ Mark status as STANDBY.
4.  ✅ Update completion timestamps.
5.  ✅ Document any issues encountered.

## 3. 🚫 FORBIDDEN ACTIONS

### NEVER DO THESE THINGS:

- ❌ **Work simultaneously with another agent** on linting tasks.
- ❌ **Modify eslint.config.mjs** without creating a backup first.
- ❌ **Create duplicate service implementations**.
- ❌ **Skip the baseline linting check** before starting.
- ❌ **Commit changes that increase error count**.
- ❌ **Ignore governance framework protocols**.
- ❌ **Work on linting without updating `PROJECT_PLANNING_AND_STATUS.md`**.

### IMMEDIATE ROLLBACK TRIGGERS:

- 🚨 Error count increases unexpectedly.
- 🚨 Multiple agents detected as ACTIVE.
- 🚨 Configuration corruption detected.
- 🚨 Governance protocol violation.
- 🚨 Duplicate implementation created.

## 4. 🔄 HANDOFF PROCEDURES

### PLANNED HANDOFF (End of Phase):

**OUTGOING AGENT**:

1.  Complete all current phase tasks.
2.  Run comprehensive linting check.
3.  Update all progress tracking.
4.  Document any blockers or issues.
5.  Set status to STANDBY.
6.  Notify in `PROJECT_PLANNING_AND_STATUS.md`.

**INCOMING AGENT**:

1.  Read `PROJECT_PLANNING_AND_STATUS.md` thoroughly.
2.  Review previous agent's notes.
3.  Run baseline linting check.
4.  Verify no conflicts exist.
5.  Update status to ACTIVE.
6.  Begin next phase tasks.

### EMERGENCY HANDOFF (Issues Encountered):

**OUTGOING AGENT**:

1.  STOP all work immediately.
2.  Document exact issue encountered.
3.  Revert any problematic changes.
4.  Run linting check to verify stability.
5.  Mark status as BLOCKED.
6.  Request assistance in `PROJECT_PLANNING_AND_STATUS.md`.

**INCOMING AGENT**:

1.  Assess the documented issue.
2.  Coordinate resolution strategy.
3.  Apply fixes if capable.
4.  Update status appropriately.
5.  Continue or escalate as needed.

## 5. 🎯 TASK COORDINATION MATRIX

### PHASE-BASED ASSIGNMENT

| Phase                           | Agent Assignment               | Coordination Level |
| :------------------------------ | :----------------------------- | :----------------- |
| Phase 1: Pipeline Consolidation | Single Agent (Augment)         | High               |
| Phase 2: Admin Dashboard        | Can be parallel                | Medium             |
| Phase 3: Authentication         | Coordinate required            | High               |
| Phase 4: Data Quality           | Can be parallel                | Low                |
| Phase 5: Performance            | Single Agent                   | High               |
| Phase 6: Database Security      | Single Agent (Supabase expert) | High               |
| Phase 7: Code Quality           | Can be parallel                | Low                |

### FILE-BASED OWNERSHIP

| File Category               | Ownership    | Coordination |
| :-------------------------- | :----------- | :----------- |
| `lib/supabase.ts`           | Single Agent | Required     |
| `lib/pipelineManager.ts`    | Single Agent | Required     |
| `app/api/pipeline/route.ts` | Single Agent | Required     |
| `app/middleware.ts`         | Single Agent | Required     |
| `vercel.json`               | Single Agent | Required     |
| `components/`               | Multi-Agent  | Recommended  |
| `app/admin/`                | Multi-Agent  | Recommended  |
| `docs/`                     | Multi-Agent  | Optional     |
| `tests/`                    | Multi-Agent  | Optional     |

## 6. 🧪 TESTING REQUIREMENTS

### Before Committing

- [ ] All existing tests pass.
- [ ] New functionality has tests.
- [ ] **MANDATORY: No linting errors** (`npm run lint` must pass).
- [ ] **MANDATORY: TypeScript compiles** without errors.
- [ ] **MANDATORY: Structural changes verified** (if applicable).

### Test Types Needed

- **Unit tests**: For new services/functions.
- **Integration tests**: For API endpoints.
- **E2E tests**: For critical user flows.
- **Performance tests**: For pipeline operations.

## 7. 📊 PROGRESS TRACKING

### Development Plan Updates

Each agent MUST update the `PROJECT_PLANNING_AND_STATUS.md` with:

- Tasks started (mark as "🔄 In Progress").
- Tasks completed (mark as "✅ Complete").
- Issues encountered (mark as "⚠️ Blocked").
- Dependencies identified (mark as "🔗 Depends on X").

### Commit Message Format

```
[AGENT] [PHASE] Brief description

Examples:
[AUGMENT] [P1] Consolidate pipeline services
[CLINE] [P2] Add live data to admin dashboard
```

---

**🛡️ RULE OWNER**: Development Team
**📅 LAST UPDATED**: June 23, 2025
**🔄 REVIEW FREQUENCY**: After each phase completion
**⚖️ ENFORCEMENT**: Mandatory for all agents
