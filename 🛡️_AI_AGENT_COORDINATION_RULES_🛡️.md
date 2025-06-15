# 🛡️ AI AGENT COORDINATION RULES
## LINTING REMEDIATION SPECIFIC PROTOCOLS

╔══════════════════════════════════════════════════════════════════════════════╗
║                        🚨 CRITICAL COORDINATION RULES 🚨                    ║
║                                                                              ║
║  These rules are MANDATORY for all AI agents working on linting remediation ║
║  Violation of these rules can cause catastrophic project damage              ║
╚══════════════════════════════════════════════════════════════════════════════╝

## 🤖 AGENT EXCLUSIVITY PROTOCOL

### SINGLE AGENT RULE
**ONLY ONE AGENT** may work on linting remediation at any time.

#### BEFORE STARTING WORK:
```markdown
1. ✅ Check Command Center: Is another agent marked as ACTIVE?
2. ✅ If YES → STOP and coordinate handoff
3. ✅ If NO → Update status to ACTIVE in Command Center
4. ✅ Run baseline check: npm run lint
5. ✅ Record baseline error count
```

#### DURING WORK:
```markdown
1. ✅ Update progress in real-time
2. ✅ Commit frequently with clear messages
3. ✅ Never leave broken states uncommitted
4. ✅ Monitor error count after each change
5. ✅ Stop immediately if error count increases
```

#### WHEN FINISHING:
```markdown
1. ✅ Run final linting check: npm run lint
2. ✅ Update final error count in Command Center
3. ✅ Mark status as STANDBY
4. ✅ Update completion timestamps
5. ✅ Document any issues encountered
```

## 🚫 FORBIDDEN ACTIONS

### NEVER DO THESE THINGS:
- ❌ **Work simultaneously with another agent** on linting tasks
- ❌ **Modify eslint.config.mjs** without creating backup first
- ❌ **Create duplicate service implementations**
- ❌ **Skip the baseline linting check** before starting
- ❌ **Commit changes that increase error count**
- ❌ **Ignore governance framework protocols**
- ❌ **Work on linting without updating Command Center**

### IMMEDIATE ROLLBACK TRIGGERS:
- 🚨 Error count increases unexpectedly
- 🚨 Multiple agents detected as ACTIVE
- 🚨 Configuration corruption detected
- 🚨 Governance protocol violation
- 🚨 Duplicate implementation created

## 🔄 HANDOFF PROCEDURES

### PLANNED HANDOFF (End of Phase):
```markdown
OUTGOING AGENT:
1. Complete all current phase tasks
2. Run comprehensive linting check
3. Update all progress tracking
4. Document any blockers or issues
5. Set status to STANDBY
6. Notify in Command Center

INCOMING AGENT:
1. Read Command Center thoroughly
2. Review previous agent's notes
3. Run baseline linting check
4. Verify no conflicts exist
5. Update status to ACTIVE
6. Begin next phase tasks
```

### EMERGENCY HANDOFF (Issues Encountered):
```markdown
OUTGOING AGENT:
1. STOP all work immediately
2. Document exact issue encountered
3. Revert any problematic changes
4. Run linting check to verify stability
5. Mark status as BLOCKED
6. Request assistance in Command Center

INCOMING AGENT:
1. Assess the documented issue
2. Coordinate resolution strategy
3. Apply fixes if capable
4. Update status appropriately
5. Continue or escalate as needed
```

## 🎯 TASK COORDINATION MATRIX

### PHASE 1: IMMEDIATE STABILIZATION
**AGENT ASSIGNMENT**: Single agent only  
**COORDINATION LEVEL**: None required  
**RISK LEVEL**: LOW

| Task | Agent Type | Coordination Required |
|------|------------|----------------------|
| Install tooling | Any | None |
| Backup configs | Any | None |
| Run migration | Any | None |
| Apply relaxation | Any | None |
| Execute fixes | Any | None |

### PHASE 2: SYSTEMATIC AUTOMATION
**AGENT ASSIGNMENT**: Single agent preferred  
**COORDINATION LEVEL**: Minimal  
**RISK LEVEL**: MEDIUM

| Task | Agent Type | Coordination Required |
|------|------------|----------------------|
| Type safety | TypeScript specialist | Document approach |
| Complexity reduction | Refactoring specialist | Share extracted functions |
| Batch processing | Any | Update progress frequently |
| SonarQube integration | DevOps specialist | Document configuration |

### PHASE 3: GRADUAL RULE PROMOTION
**AGENT ASSIGNMENT**: Single agent required  
**COORDINATION LEVEL**: High  
**RISK LEVEL**: HIGH

| Task | Agent Type | Coordination Required |
|------|------------|----------------------|
| Rule strictening | ESLint specialist | Coordinate with all agents |
| Quality gates | DevOps specialist | Test with all agents |
| CI/CD integration | DevOps specialist | Verify with team |

### PHASE 4: ENTERPRISE PREVENTION
**AGENT ASSIGNMENT**: Lead agent required  
**COORDINATION LEVEL**: Maximum  
**RISK LEVEL**: CRITICAL

| Task | Agent Type | Coordination Required |
|------|------------|----------------------|
| Strict mode | Lead agent | Full team coordination |
| Prevention framework | Lead agent | Training for all agents |
| Documentation | Technical writer | Review by all agents |

## 🚨 CONFLICT RESOLUTION PROTOCOLS

### DETECTION METHODS:
```bash
# Check for multiple active agents
grep -r "ACTIVE" 🚨_LINTING_REMEDIATION_COMMAND_CENTER_🚨.md

# Check for configuration conflicts
diff eslint.config.mjs eslint.config.mjs.backup

# Check for error count increases
npm run lint 2>&1 | grep -o '[0-9]\+ error'
```

### RESOLUTION STEPS:
1. **IMMEDIATE STOP**: All agents cease linting work
2. **ASSESS DAMAGE**: Determine scope of conflicts
3. **COORDINATE RESOLUTION**: Agree on resolution approach
4. **IMPLEMENT FIX**: Single agent implements solution
5. **VERIFY STABILITY**: Confirm system is stable
6. **RESUME WORK**: Continue with proper coordination

## 📋 COMPLIANCE CHECKLIST

### BEFORE EVERY WORK SESSION:
- [ ] Read Command Center status
- [ ] Verify no other agent is ACTIVE
- [ ] Update own status to ACTIVE
- [ ] Run baseline linting check
- [ ] Record starting error count

### DURING EVERY WORK SESSION:
- [ ] Update progress in real-time
- [ ] Commit changes frequently
- [ ] Monitor error count continuously
- [ ] Follow governance protocols
- [ ] Document any issues immediately

### AFTER EVERY WORK SESSION:
- [ ] Run final linting check
- [ ] Update error count in Command Center
- [ ] Set status to STANDBY
- [ ] Update completion timestamps
- [ ] Document lessons learned

## 🔗 INTEGRATION WITH GOVERNANCE

### MANDATORY COMPLIANCE:
1. **CODEBASE_RULES.md**: All rules apply
2. **MULTI_AGENT_COORDINATION.md**: Enhanced for linting
3. **STRUCTURAL_CHANGE_PREVENTION_CHECKLIST.md**: Required for config changes
4. **LINTING_PREVENTION_FRAMEWORK.md**: Prevention strategies

### ESCALATION PROCEDURES:
- **Level 1**: Minor issues → Document in Command Center
- **Level 2**: Blocking issues → Request assistance
- **Level 3**: Critical issues → Emergency handoff
- **Level 4**: System damage → Full team coordination

---

**🛡️ RULE OWNER**: Development Team  
**📅 LAST UPDATED**: 2025-01-10  
**🔄 REVIEW FREQUENCY**: After each phase completion  
**⚖️ ENFORCEMENT**: Mandatory for all agents
