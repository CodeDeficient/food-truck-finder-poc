# Agent.md

## Purpose
This document consolidates all agent rules, governance protocols, and process documentation for Copilot/AI agents working in this codebase. It is informed by:
- Internal governance (see `🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md`, `CODEBASE_RULES.md`, etc.)
- State-of-the-art (SOTA) agent rules from the Context7 MCP Agent Rules library

---

## 1. Mission Objective
**Reduce linting errors to <10 using enterprise-grade automation and strict governance.**

---

## 2. Agent Governance Protocols
- **Single-Agent Policy:** Only one agent may perform linting remediation at a time.
- **Baseline Lint Check:** Always run a baseline lint check (`powershell -ExecutionPolicy Bypass -File scripts/count-errors.ps1`) before any code changes.
- **Error Count Verification:** After each batch of changes, verify that the error count has not increased. Never commit changes that increase the error count.
- **Config Drift Prevention:** Never modify `eslint.config.mjs` without backing up. Restore from backup if drift is detected.
- **No Duplicate Implementations:** Never create duplicate services or logic.
- **Structural Change Checklist:** Follow all steps in `STRUCTURAL_CHANGE_PREVENTION_CHECKLIST.md` before making structural changes.
- **Progress Tracking:** Update progress and agent status in the appropriate documentation after each batch.

---

## 3. Systematic Remediation Methodology
- **4-Step Approach:**
  1. Codebase retrieval
  2. Batch processing (target 15-20 fixes per batch)
  3. Quality verification (lint, type, and build checks)
  4. Progress tracking (update docs, error counts)
- **Static Priority List:** Use the static prioritized file list for maximum impact (Pareto 80/20 principle).
- **Batch Completion Verification:** Only run full linting after each batch, not before every file.
- **Manual Refactoring:** For max-lines-per-function and high-complexity violations, use manual extraction and decomposition patterns.

---

## 4. SOTA Agent Rules (Context7 MCP Highlights)
- **Rule Adoption:** Adopt and enforce rules that improve agent reliability, maintainability, and safety.
- **No Context Drift:** Agents must always operate with up-to-date context and never act on stale information.
- **Explicit Error Handling:** All errors must be logged with context and handled gracefully.
- **Single Responsibility:** Each agent or function should have a clear, single responsibility.
- **Automated Verification:** Use automated scripts and tools for error counting and verification.
- **Documentation:** All agent actions, decisions, and changes must be documented in a transparent, auditable way.

---

## 5. Success Criteria
- **Zero build errors** at all times
- **No new lint/type errors** after any batch
- **All governance protocols followed**
- **Progress and error counts updated in real time**

---

## 6. References
- `🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md`
- `CODEBASE_RULES.md`
- `MULTI_AGENT_COORDINATION.md`
- `STRUCTURAL_CHANGE_PREVENTION_CHECKLIST.md`
- Context7 MCP Agent Rules Library: https://github.com/steipete/agent-rules

---

> This document is the single source of truth for agent conduct, process, and governance in this codebase. All agents must read and comply before making any changes.
