# Multi-Agent Coordination Guidelines

_Food Truck Finder Project_

## 🤝 **Agent Coordination Protocol**

### **Current Active Agents**

- **Augment Agent** (Claude Sonnet 4) - Primary development agent
- **Cline** - VS Code extension agent
- **Copilot** - GitHub integration agent
- **Jules** - Additional AI assistant

### **Work Distribution Strategy**

#### **Phase-Based Assignment**

```
Phase 1: Pipeline Consolidation    → Single Agent (Augment)
Phase 2: Admin Dashboard          → Can be parallel
Phase 3: Authentication           → Coordinate required
Phase 4: Data Quality             → Can be parallel
Phase 5: Performance              → Single Agent
Phase 6: Database Security        → Single Agent (Supabase expert)
Phase 7: Code Quality             → Can be parallel
```

#### **File-Based Ownership**

```
CRITICAL FILES (Single Agent Only):
├── lib/supabase.ts              # Database services
├── lib/pipelineManager.ts       # Pipeline orchestration
├── app/api/pipeline/route.ts    # Unified pipeline API
├── app/middleware.ts            # Authentication middleware
└── vercel.json                  # Deployment configuration

PARALLEL-SAFE FILES:
├── components/                  # UI components
├── app/admin/                   # Admin pages (non-API)
├── docs/                        # Documentation
└── tests/                       # Test files
```

### **Communication Protocols**

#### **Before Starting Work**

1. **Check Development Plan** - Review current status
2. **Check Recent Commits** - Understand recent changes
3. **Use codebase-retrieval** - Verify existing implementations
4. **MANDATORY: Run linting check** - `npm run lint` to capture baseline
5. **Update Development Plan** - Mark tasks as "In Progress"

#### **Before Large-Scale Changes** ⚠️ **CRITICAL**

1. **Announce in Development Plan** - Mark as "🔄 STRUCTURAL CHANGE IN PROGRESS"
2. **Single Agent Assignment** - Only one agent for file removal/consolidation
3. **Document affected files** - List all files that will be changed
4. **Plan import path changes** - Map old imports → new imports
5. **Create migration checklist** - Step-by-step change plan

#### **During Development**

1. **Frequent Commits** - Small, atomic changes
2. **Clear Commit Messages** - Include agent identifier
3. **Update Documentation** - Keep docs current
4. **Test Continuously** - Don't break existing functionality
5. **MANDATORY: Frequent linting** - Run `npm run lint` after major changes

#### **During Structural Changes** ⚠️ **CRITICAL**

1. **Incremental changes only** - Update one service/file at a time
2. **Fix imports immediately** - Update import paths as files are moved/removed
3. **Verify after each step** - Ensure imports resolve correctly
4. **Commit working states** - Never accumulate broken states
5. **Run linting frequently** - Catch issues immediately

#### **After Completion**

1. **MANDATORY: Linting verification** - `npm run lint` MUST pass
2. **MANDATORY: Type checking** - Ensure TypeScript compilation succeeds
3. **Update Development Plan** - Mark tasks as "Complete"
4. **Document Changes** - Update relevant docs
5. **Verify Tests Pass** - Ensure no regressions
6. **Coordinate Handoffs** - Inform other agents of changes

## 🚫 **Conflict Prevention Rules**

### **Database Operations**

- **NEVER** create new Supabase clients
- **NEVER** duplicate service definitions
- **ALWAYS** use `lib/supabase.ts` services
- **COORDINATE** schema changes with all agents

### **API Routes**

- **CHECK** existing routes before creating new ones
- **NEVER** create overlapping endpoints
- **ALWAYS** follow RESTful conventions
- **COORDINATE** breaking changes

### **Pipeline Systems**

- **NEVER** create new pipeline implementations
- **ALWAYS** extend existing unified pipeline
- **COORDINATE** major pipeline changes
- **DOCUMENT** pipeline modifications

## 🔄 **Merge Conflict Resolution**

### **Prevention Strategies**

1. **Work on different files** when possible
2. **Frequent pulls** from main branch
3. **Small, focused commits**
4. **Clear communication** about file ownership

### **Resolution Process**

1. **Identify conflict source** - Which agents involved?
2. **Determine canonical version** - Which implementation to keep?
3. **Coordinate resolution** - Agree on approach
4. **Test thoroughly** - Ensure no functionality lost
5. **Document resolution** - Update relevant docs

## 📊 **Progress Tracking**

### **Development Plan Updates**

Each agent MUST update the Development Plan with:

- Tasks started (mark as "🔄 In Progress")
- Tasks completed (mark as "✅ Complete")
- Issues encountered (mark as "⚠️ Blocked")
- Dependencies identified (mark as "🔗 Depends on X")

### **Commit Message Format**

```
[AGENT] [PHASE] Brief description

Examples:
[AUGMENT] [P1] Consolidate pipeline services in lib/supabase.ts
[CLINE] [P2] Add live data to admin dashboard overview
[COPILOT] [P4] Fix data quality score formatting
```

### **Documentation Requirements**

- **API Changes**: Update relevant API documentation
- **Service Changes**: Update service documentation
- **UI Changes**: Update component documentation
- **Database Changes**: Update schema documentation

## 🛡️ **Quality Assurance**

### **Code Review Process**

1. **Self-Review** - Check own code before commit
2. **Automated Testing** - Ensure tests pass
3. **Linting Compliance** - Fix all linting errors
4. **Documentation Check** - Verify docs are current

### **Testing Requirements**

- **Unit Tests** - For new services and functions
- **Integration Tests** - For API endpoints
- **E2E Tests** - For critical user flows
- **Performance Tests** - For pipeline operations

### **Deployment Verification**

- **Local Testing** - Verify changes work locally
- **Staging Deployment** - Test in staging environment
- **Production Verification** - Confirm production deployment
- **Rollback Plan** - Have rollback strategy ready

## 🚨 **Emergency Procedures**

### **Production Issues**

1. **Immediate Assessment** - Identify scope of issue
2. **Agent Coordination** - Determine who can fix fastest
3. **Quick Fix or Rollback** - Restore service quickly
4. **Post-Mortem** - Document what went wrong

### **Merge Conflicts**

1. **Stop Development** - Don't make conflicts worse
2. **Coordinate Resolution** - Work together on solution
3. **Test Thoroughly** - Ensure resolution works
4. **Document Learnings** - Prevent future conflicts

### **Duplicate Work Discovery**

1. **Assess Implementations** - Which is better?
2. **Coordinate Consolidation** - Agree on approach
3. **Update References** - Fix all imports/calls
4. **Remove Duplicates** - Clean up codebase

## 📋 **Agent-Specific Guidelines**

### **Augment Agent (Primary)**

- **Focus**: Core architecture and pipeline consolidation
- **Responsibilities**: Database services, pipeline management, API design
- **Coordination**: Lead coordination with other agents

### **Cline (VS Code)**

- **Focus**: UI/UX improvements and component development
- **Responsibilities**: Admin dashboard, user interface, component library
- **Coordination**: Coordinate UI changes with backend changes

### **Copilot (GitHub)**

- **Focus**: Code quality and testing
- **Responsibilities**: Test coverage, linting fixes, documentation
- **Coordination**: Ensure code quality standards across all agents

### **Jules (Assistant)**

- **Focus**: Data quality and content management
- **Responsibilities**: Data validation, content processing, quality metrics
- **Coordination**: Work with pipeline team on data standards

---

_This document should be reviewed and updated as the project evolves and new coordination challenges arise._
