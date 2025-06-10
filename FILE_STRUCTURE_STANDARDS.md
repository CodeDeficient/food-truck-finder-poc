# File Structure Standards and Enforcement

_Food Truck Finder Project - Anti-Duplication Guidelines_

## 🏗️ **Canonical File Structure**

### **Core Services Layer** (`lib/`)

```
lib/
├── supabase.ts              # ✅ ONLY database client and ALL services
├── pipelineManager.ts       # ✅ ONLY unified pipeline orchestration
├── types.ts                 # ✅ ONLY shared TypeScript interfaces
├── database.types.ts        # ✅ ONLY Supabase generated types
├── utils.ts                 # ✅ ONLY utility functions
├── config.ts                # ✅ ONLY configuration constants
└── [specific-modules].ts    # ✅ Specific functionality modules
```

### **API Routes Layer** (`app/api/`)

```
app/api/
├── pipeline/route.ts        # ✅ ONLY unified pipeline endpoint
├── dashboard/route.ts       # ✅ ONLY admin dashboard data
├── trucks/route.ts          # ✅ ONLY food truck CRUD
├── search/route.ts          # ✅ ONLY search functionality
├── events/route.ts          # ✅ ONLY events CRUD
└── auth/                    # ✅ ONLY authentication endpoints
```

### **UI Components Layer** (`components/`)

```
components/
├── ui/                      # ✅ ONLY base UI components (shadcn)
├── FoodTruckInfoCard.tsx    # ✅ ONLY food truck display
├── MapDisplay.tsx           # ✅ ONLY map functionality
├── SearchFilters.tsx        # ✅ ONLY search UI
└── [feature-components].tsx # ✅ Feature-specific components
```

## 🚫 **FORBIDDEN PATTERNS**

### **Database Service Duplication**

```typescript
// ❌ NEVER DO THIS - Duplicate service in API route
export const FoodTruckService = {
  async getAllTrucks() {
    /* duplicate implementation */
  },
};

// ❌ NEVER DO THIS - Inline database operations
const { data } = await supabase.from('food_trucks').select('*');

// ✅ ALWAYS DO THIS - Use centralized service
import { FoodTruckService } from '@/lib/supabase';
const trucks = await FoodTruckService.getAllTrucks();
```

### **Client Creation Duplication**

```typescript
// ❌ NEVER DO THIS - Create new clients
const supabase = createClient(url, key);
const supabaseAdmin = createClient(url, serviceKey);

// ✅ ALWAYS DO THIS - Use existing clients
import { supabase, supabaseAdmin } from '@/lib/supabase';
```

### **Pipeline System Duplication**

```typescript
// ❌ NEVER DO THIS - Create new pipeline systems
export class NewPipelineSystem {
  /* duplicate logic */
}

// ✅ ALWAYS DO THIS - Extend unified pipeline
import { pipelineManager } from '@/lib/pipelineManager';
await pipelineManager.runPipeline(config);
```

## ✅ **REQUIRED PATTERNS**

### **Service Import Pattern**

```typescript
// ✅ CORRECT - Named imports from centralized services
import {
  FoodTruckService,
  ScrapingJobService,
  DataProcessingService,
  APIUsageService,
} from '@/lib/supabase';
```

### **API Route Pattern**

```typescript
// ✅ CORRECT - API route structure
import { type NextRequest, NextResponse } from 'next/server';
import { SomeService } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.required_field) {
      return NextResponse.json({ error: 'Missing required field' }, { status: 400 });
    }

    // Delegate to service
    const result = await SomeService.operation(body);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### **Component Pattern**

```typescript
// ✅ CORRECT - Component structure
import { useState, useEffect } from 'react';
import { SomeService } from '@/lib/supabase';

export function SomeComponent() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await SomeService.getData();
        setData(result);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }

    loadData();
  }, []);

  return <div>{/* component JSX */}</div>;
}
```

## 🔍 **VERIFICATION CHECKLIST**

### **Before Creating New Files**

- [ ] Check if functionality already exists using codebase-retrieval
- [ ] Verify no duplicate services in target area
- [ ] Confirm following established patterns
- [ ] Review file structure standards

### **Before Adding Database Operations**

- [ ] Confirm using services from `lib/supabase.ts`
- [ ] Verify not creating duplicate service methods
- [ ] Check proper error handling is implemented
- [ ] Ensure proper TypeScript typing

### **Before Creating API Routes**

- [ ] Check for existing overlapping routes
- [ ] Verify following RESTful conventions
- [ ] Confirm proper request/response handling
- [ ] Ensure authentication/authorization if needed

### **Before Adding Components**

- [ ] Check for existing similar components
- [ ] Verify following component patterns
- [ ] Confirm proper prop typing
- [ ] Ensure accessibility standards

## 📁 **FILE OWNERSHIP MATRIX**

### **Single-Agent Files** (Require Coordination)

| File                        | Owner           | Reason                 |
| --------------------------- | --------------- | ---------------------- |
| `lib/supabase.ts`           | Augment Agent   | Core database services |
| `lib/pipelineManager.ts`    | Augment Agent   | Pipeline orchestration |
| `app/api/pipeline/route.ts` | Augment Agent   | Unified pipeline API   |
| `app/middleware.ts`         | Auth Specialist | Authentication logic   |
| `vercel.json`               | DevOps Agent    | Deployment config      |

### **Multi-Agent Files** (Coordination Recommended)

| File Pattern       | Coordination Level | Notes                             |
| ------------------ | ------------------ | --------------------------------- |
| `components/*.tsx` | Low                | UI components can be parallel     |
| `app/admin/*.tsx`  | Medium             | Admin pages need data consistency |
| `tests/*.test.ts`  | Low                | Tests can be parallel             |
| `docs/*.md`        | Low                | Documentation can be parallel     |

### **Restricted Files** (No Direct Editing)

| File                    | Restriction           | Alternative               |
| ----------------------- | --------------------- | ------------------------- |
| `lib/database.types.ts` | Generated by Supabase | Use Supabase CLI          |
| `package.json`          | Use package managers  | `npm install`, `pnpm add` |
| `pnpm-lock.yaml`        | Generated by pnpm     | Use `pnpm install`        |

## 🛠️ **ENFORCEMENT TOOLS**

### **Pre-Commit Hooks**

- ESLint for code quality
- TypeScript compiler for type checking
- Prettier for code formatting
- Custom scripts for duplication detection

### **Automated Checks**

- CI/CD pipeline verification
- Duplicate service detection
- Import pattern validation
- File structure compliance

### **Manual Reviews**

- Code review checklist
- Architecture review process
- Documentation review
- Cross-agent coordination review

## 🚨 **VIOLATION RESPONSE**

### **When Duplication is Detected**

1. **Immediate Stop** - Halt development on affected area
2. **Assessment** - Determine which implementation is canonical
3. **Coordination** - Work with other agents to resolve
4. **Consolidation** - Merge to single implementation
5. **Cleanup** - Remove duplicates and update references
6. **Documentation** - Update this document if needed

### **Prevention Measures**

- Regular codebase audits
- Agent coordination meetings
- Documentation updates
- Pattern enforcement tools

---

_This document serves as the definitive guide for file structure and duplication prevention. All agents must follow these standards to maintain codebase integrity._
