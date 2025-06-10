# Structural Change Prevention Checklist

_Mandatory checklist to prevent cascading linting errors during large-scale refactoring_

## 🚨 **CRITICAL: Use This Checklist for ANY Structural Changes**

**Structural changes include:**

- File removal or consolidation
- Import path changes affecting multiple files
- Service standardization or centralization
- API route deprecation or consolidation
- Database client consolidation

## ✅ **PRE-CHANGE CHECKLIST**

### **1. Assessment & Planning**

- [ ] **Run baseline linting**: `npm run lint > lint-before.json`
- [ ] **Document current state**: Capture current error count and types
- [ ] **Identify affected files**: Use codebase-retrieval to find all files importing from targets
- [ ] **Map import changes**: Document old imports → new imports transformation
- [ ] **Create step-by-step plan**: Break down changes into incremental steps
- [ ] **Estimate scope**: Count files that need updating
- [ ] **Single agent assignment**: Ensure only one agent handles structural changes

### **2. Coordination**

- [ ] **Update development plan**: Mark as "🔄 STRUCTURAL CHANGE IN PROGRESS"
- [ ] **Announce to other agents**: Document in development plan or coordination file
- [ ] **Block conflicting work**: Ensure no other agents work on affected files
- [ ] **Set timeline**: Estimate completion time for coordination

## ✅ **DURING-CHANGE CHECKLIST**

### **3. Incremental Execution**

- [ ] **One file at a time**: Update imports before removing source files
- [ ] **Fix imports immediately**: Don't let broken imports accumulate
- [ ] **Verify each step**: Ensure imports resolve correctly after each change
- [ ] **Run linting frequently**: Check `npm run lint` after each major change
- [ ] **Commit working states**: Never accumulate multiple breaking changes

### **4. Import Path Updates**

- [ ] **Update imports first**: Change import paths before removing files
- [ ] **Verify resolution**: Ensure all imports resolve to correct files
- [ ] **Check type compatibility**: Ensure imported types match expectations
- [ ] **Test functionality**: Verify behavior remains unchanged

### **5. File Removal Protocol**

- [ ] **Confirm no remaining imports**: Search codebase for any remaining references
- [ ] **Remove files last**: Only remove files after all imports are updated
- [ ] **Verify no broken references**: Ensure no dead imports remain
- [ ] **Update documentation**: Remove references from docs

## ✅ **POST-CHANGE CHECKLIST**

### **6. Mandatory Verification**

- [ ] **MANDATORY: Linting verification**: `npm run lint` MUST pass (zero errors)
- [ ] **MANDATORY: Type checking**: `npm run type-check` (if available) MUST pass
- [ ] **Compare with baseline**: Check improvement from lint-before.json
- [ ] **Test execution**: Run relevant tests to ensure functionality
- [ ] **Manual verification**: Test affected features manually

### **7. Documentation & Cleanup**

- [ ] **Update development plan**: Mark structural change as complete
- [ ] **Document changes**: Update relevant documentation
- [ ] **Remove temporary files**: Clean up any temporary or backup files
- [ ] **Update governance docs**: If new patterns established, document them

### **8. Coordination Completion**

- [ ] **Announce completion**: Inform other agents work is complete
- [ ] **Unblock other work**: Remove "in progress" markers
- [ ] **Share learnings**: Document any issues encountered for future reference

## 🚨 **EMERGENCY PROTOCOLS**

### **If Linting Errors Spike During Changes**

1. **STOP immediately**: Don't make the situation worse
2. **Assess damage**: Run `npm run lint` to see current error count
3. **Revert if necessary**: Consider reverting to last working state
4. **Fix incrementally**: Address errors one by one
5. **Get help**: Coordinate with other agents if needed

### **If Import Errors Accumulate**

1. **STOP adding changes**: Focus on fixing existing broken imports
2. **Map broken imports**: List all files with import errors
3. **Fix systematically**: Go file by file to resolve imports
4. **Verify each fix**: Ensure each import resolution works
5. **Test before continuing**: Verify functionality before proceeding

## 📋 **COMMON PITFALLS TO AVOID**

### **❌ DON'T:**

- Remove files before updating all imports
- Make multiple structural changes simultaneously
- Accumulate broken states across multiple commits
- Skip linting verification steps
- Work on structural changes with multiple agents

### **✅ DO:**

- Update imports before removing source files
- Make one change at a time
- Commit working states frequently
- Run linting after each major step
- Coordinate with other agents before starting

## 📊 **SUCCESS METRICS**

### **Successful Structural Change:**

- ✅ Zero linting errors after completion
- ✅ All imports resolve correctly
- ✅ All tests pass
- ✅ Functionality unchanged
- ✅ Documentation updated

### **Warning Signs:**

- ⚠️ Linting errors increasing during changes
- ⚠️ Import resolution failures
- ⚠️ Test failures
- ⚠️ Broken functionality
- ⚠️ Multiple agents working on same files

---

## 🎯 **REMEMBER: Prevention is Better Than Cleanup**

The pipeline consolidation work that triggered 600+ linting errors could have been prevented by following this checklist. Use this checklist religiously for any future structural changes to maintain code quality and prevent cascading errors.

**Key Lesson**: Large-scale refactoring without proper safeguards creates more work than it saves. Always plan, execute incrementally, and verify continuously.

---

_Last Updated: December 2024_
_Version: 1.0 - Post-Pipeline Consolidation Lessons Learned_
