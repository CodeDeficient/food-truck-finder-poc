# Agent Quick Reference Card

_Food Truck Finder Project - Essential Rules_

## 🚨 **BEFORE YOU START - MANDATORY CHECKS**

### **Step 1: Verify Existing Implementation**

```bash
# Use codebase-retrieval to check for existing functionality
"Show me all existing [service/route/component] implementations for [feature]"
```

### **Step 2: Check for Duplicates**

- ✅ Database services → Use `lib/supabase.ts` ONLY
- ✅ Pipeline operations → Use `/api/pipeline` ONLY
- ✅ API routes → Check existing routes first
- ✅ Components → Check `components/` directory

### **Step 3: Review Current Rules**

- 📖 Read `CODEBASE_RULES.md` sections relevant to your work
- 📖 Check `FILE_STRUCTURE_STANDARDS.md` for patterns
- 📖 Review `MULTI_AGENT_COORDINATION.md` for conflicts

### **Step 4: ⚠️ STRUCTURAL CHANGE PREVENTION**

**If planning file removal, import path changes, or service consolidation:**

- 🚨 **MANDATORY**: Follow `STRUCTURAL_CHANGE_PREVENTION_CHECKLIST.md`
- 🚨 **MANDATORY**: Run `npm run lint > lint-before.json` to capture baseline
- 🚨 **MANDATORY**: Single agent assignment only
- 🚨 **MANDATORY**: Plan import path changes before starting

## 🔧 **ESSENTIAL PATTERNS**

### **Database Operations**

```typescript
// ✅ CORRECT
import { FoodTruckService } from '@/lib/supabase';
const trucks = await FoodTruckService.getAllTrucks();

// ❌ WRONG
const supabase = createClient(url, key);
const { data } = await supabase.from('food_trucks').select('*');
```

### **API Routes**

```typescript
// ✅ CORRECT
import { SomeService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await SomeService.operation(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### **Pipeline Operations**

```typescript
// ✅ CORRECT
import { pipelineManager } from '@/lib/pipelineManager';
await pipelineManager.runPipeline({ action: 'discovery' });

// ❌ WRONG
// Creating new pipeline systems
```

## 📁 **FILE LOCATIONS**

### **Where to Put New Code**

| Type              | Location                     | Example                        |
| ----------------- | ---------------------------- | ------------------------------ |
| Database Services | `lib/supabase.ts`            | `FoodTruckService.newMethod()` |
| Pipeline Logic    | `lib/pipelineManager.ts`     | Pipeline orchestration         |
| API Endpoints     | `app/api/[feature]/route.ts` | RESTful endpoints              |
| UI Components     | `components/[Feature].tsx`   | React components               |
| Types             | `lib/types.ts`               | Shared interfaces              |
| Utils             | `lib/utils.ts`               | Helper functions               |

### **Where NOT to Put Code**

| ❌ Don't Put              | ✅ Put Instead                |
| ------------------------- | ----------------------------- |
| Services in API routes    | Services in `lib/supabase.ts` |
| Database clients anywhere | Use existing clients          |
| Pipeline logic in routes  | Use `lib/pipelineManager.ts`  |
| Inline DB operations      | Use service methods           |

## 🚫 **CRITICAL DON'TS**

### **Database**

- ❌ Create new Supabase clients
- ❌ Duplicate service definitions
- ❌ Inline database operations
- ❌ Skip error handling

### **API Routes**

- ❌ Create overlapping endpoints
- ❌ Skip input validation
- ❌ Expose raw errors to client
- ❌ Mix business logic with routing

### **Pipeline**

- ❌ Create new pipeline systems
- ❌ Duplicate processing logic
- ❌ Skip unified pipeline manager
- ❌ Create competing endpoints

### **General**

- ❌ Use `any` type in TypeScript
- ❌ Skip testing new functionality
- ❌ Commit without running tests
- ❌ Work on same files as other agents

## ✅ **CRITICAL DO'S**

### **Always**

- ✅ Use codebase-retrieval before coding
- ✅ Import from centralized services
- ✅ Follow established patterns
- ✅ Handle errors properly
- ✅ Write tests for new code
- ✅ Update documentation
- ✅ Coordinate with other agents

### **Database**

- ✅ Use services from `lib/supabase.ts`
- ✅ Validate input before operations
- ✅ Use transactions for multi-table ops
- ✅ Return structured error responses

### **API**

- ✅ Validate request bodies
- ✅ Use proper HTTP status codes
- ✅ Delegate to service layer
- ✅ Implement proper authentication

## 🤝 **COORDINATION RULES**

### **Phase Assignments**

- **Phase 1 (Pipeline)**: Augment Agent only
- **Phase 2 (Admin Dashboard)**: Can be parallel
- **Phase 3 (Auth)**: Coordinate required
- **Database changes**: Single agent only

### **File Ownership**

- **Critical files**: Single agent (coordinate first)
- **UI components**: Can be parallel
- **Tests**: Can be parallel
- **Docs**: Can be parallel

### **Communication**

- 📝 Update Development Plan with progress
- 💬 Use clear commit messages with agent ID
- 🔄 Pull latest changes before starting
- 📋 Mark tasks as "In Progress" when starting

## 🧪 **TESTING REQUIREMENTS**

### **Before Committing**

- [ ] All existing tests pass
- [ ] New functionality has tests
- [ ] **MANDATORY: No linting errors** (`npm run lint` must pass)
- [ ] **MANDATORY: TypeScript compiles** without errors
- [ ] **MANDATORY: Structural changes verified** (if applicable)

### **Test Types Needed**

- **Unit tests**: For new services/functions
- **Integration tests**: For API endpoints
- **E2E tests**: For critical user flows
- **Performance tests**: For pipeline operations

## 📊 **PROGRESS TRACKING**

### **Development Plan Updates**

```markdown
- [x] ✅ Task completed
- [ ] 🔄 Task in progress (Agent Name)
- [ ] ⚠️ Task blocked (reason)
- [ ] 🔗 Task depends on other task
```

### **Commit Message Format**

```
[AGENT] [PHASE] Brief description

Examples:
[AUGMENT] [P1] Consolidate pipeline services
[CLINE] [P2] Add live data to admin dashboard
```

## 🚨 **EMERGENCY CONTACTS**

### **When You Need Help**

1. **Duplication discovered**: Stop work, coordinate resolution
2. **Merge conflicts**: Coordinate with other agents
3. **Production issues**: Immediate coordination required
4. **Architecture questions**: Consult Augment Agent

### **Quick Resolution Steps**

1. **Assess** the situation
2. **Coordinate** with affected agents
3. **Resolve** using established patterns
4. **Document** the resolution
5. **Update** rules if needed

---

## 📋 **QUICK CHECKLIST**

Before any development work:

- [ ] Used codebase-retrieval to check existing code
- [ ] Verified no duplicates exist
- [ ] Reviewed relevant rules sections
- [ ] Confirmed work doesn't conflict with other agents
- [ ] Updated Development Plan with "In Progress" status

Before committing:

- [ ] Tests pass
- [ ] **MANDATORY: No linting errors** (`npm run lint` must pass)
- [ ] **MANDATORY: TypeScript compilation** succeeds
- [ ] Documentation updated
- [ ] Development Plan updated with completion status
- [ ] **Structural changes verified** (if applicable)

---

_Keep this reference handy and refer to it frequently to avoid common pitfalls and maintain codebase quality._
