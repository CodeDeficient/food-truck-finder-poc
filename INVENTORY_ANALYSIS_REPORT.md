# Step 1: Inventory & Impact Analysis Report

## Components That Destructure `contact_info` or `social_media` Fields

### Primary Components (Direct Destructuring)

#### 1. `TruckDetailsModal.tsx` (Line 167)
**Pattern Found:**
```typescript
contact_info: { phone = '', email = '', website = '' } = {},
```
**Line:** 167
**Pattern:** Destructures the `contact_info` field with default fallbacks

**Social Media Usage (Line 166):**
```typescript
social_media = {},
```
**Line:** 166
**Pattern:** Destructures `social_media` with default fallback

---

#### 2. `TruckCard.tsx` (Lines 43-44, 48, 132)
**Pattern Found:**
```typescript
social_media = {},
contact_info = {},
```
**Lines:** 43-44
**Pattern:** Direct destructuring with default objects

**Additional Usage (Line 48):**
```typescript
const { phone = '', email = '', website = '' } = contact_info ?? {};
```
**Line:** 48
**Pattern:** Secondary destructuring of contact_info with nullish coalescing

---

#### 3. `components/trucks/TruckContactInfo.tsx` (Lines 159, 162, 171, 174, 183, 184, 188)
**Pattern Found:**
```typescript
truck.contact_info?.phone
truck.contact_info?.email  
truck.contact_info?.website
truck.social_media
```
**Lines:** Multiple references throughout component
**Pattern:** Optional chaining access to nested properties

---

#### 4. `app/admin/food-trucks/page.tsx` (Lines 72-83)
**Pattern Found:**
```typescript
{truck.contact_info?.phone !== undefined && (
{truck.contact_info?.email !== undefined && (
{truck.contact_info?.website !== undefined && (
```
**Lines:** 72-83
**Pattern:** Conditional rendering based on contact_info properties

---

#### 5. `app/admin/food-trucks/[id]/page.tsx` (Line 58)
**Pattern Found:**
```typescript
<ContactInfoCard phone={truck.contact_info?.phone} email={truck.contact_info?.email} website={truck.contact_info?.website} />
```
**Line:** 58
**Pattern:** Props passing with optional chaining

---

## Associated Files (To Be Modified)

### Direct Components
1. **`components/TruckDetailsModal.tsx`** - Primary destructuring on lines 167, 166
2. **`components/TruckCard.tsx`** - Primary destructuring on lines 43-44, 48, 132
3. **`components/trucks/TruckContactInfo.tsx`** - Multiple property accesses
4. **`app/admin/food-trucks/page.tsx`** - Conditional rendering logic
5. **`app/admin/food-trucks/[id]/page.tsx`** - Props passing

### Utility Files
6. **`lib/data-quality/placeholderUtils.ts`** - Lines 99, 121, 129-130, 133-134, 139-140, 145-146
7. **Various test files** - References in test utilities and mock data

## Affected Files (Dependencies/Imports)

### Files that Import the Modified Components

#### Imports of `TruckDetailsModal`:
- **`components/TruckCard.tsx`** (Line 13) - Uses TruckDetailsModal
- **`app/trucks/[id]/page.tsx`** (Line 8) - Imports TruckDetailsModal
- **`components/trucks/TruckAccordionItem.tsx`** (Line 4) - Imports TruckDetailsModal

#### Imports of `TruckCard`:
- **`app/page.tsx`** (Line 5) - Main page uses TruckCard
- **`components/admin/dashboard/TrucksPage.tsx`** (Line 2) - Admin dashboard component

#### Imports of `TruckContactInfo`:
- Files that use truck contact information display

#### Admin Page Dependencies:
- Admin layout components
- Related admin utilities and services

## Type Dependencies

### Core Types Used:
- **`FoodTruck`** interface from `@/lib/types` or `@/lib/supabase`
- **`contact_info`** nested object structure
- **`social_media`** nested object structure

### Utility Imports:
- **`useTruckCard`** hook from `@/hooks/useTruckCard`
- **`formatPrice`** from `@/lib/utils/foodTruckHelpers`
- Various UI components from `@/components/ui/*`

## Baseline Error Status

### TypeScript Compilation
✅ **PASS** - No TypeScript compilation errors
```bash
npx tsc --noEmit
# Exit code: 0 (success)
```

### ESLint Status
⚠️ **WARNINGS PRESENT** - 8 files with linting issues:

| File | Fatal Errors | Errors | Warnings |
|------|-------------|--------|----------|
| `analyze-pipeline-quality.js` | 1 | 1 | 0 |
| `analyzePipelineQuality.js` | 0 | 1 | 25 |
| `app/admin/data-quality/page.tsx` | 0 | 1 | 0 |
| `app/admin/events/page.tsx` | 0 | 1 | 0 |
| `app/admin/food-trucks/page.tsx` | 0 | 1 | 0 |
| `app/admin/page.tsx` | 0 | 1 | 0 |
| `app/api/process-jobs/route.ts` | 0 | 2 | 2 |

**Note:** Most errors are related to `unicorn/prefer-export-from` and console logging rules, not related to the fields being modified.

## Impact Assessment

### Risk Level: **MEDIUM**
- **5 primary components** require direct modification
- **Multiple dependent files** need verification
- **Admin interface dependencies** require testing
- **Type definitions** may need updates

### Recommended Approach:
1. **Start with type definitions** - Update base interfaces first
2. **Modify core components** - TruckDetailsModal, TruckCard, TruckContactInfo
3. **Update admin pages** - Ensure admin functionality remains intact
4. **Test dependent components** - Verify imports and usage patterns
5. **Run comprehensive testing** - Both TypeScript and ESLint validation

### Next Steps:
Following WBS protocol, proceed to detailed component analysis and modification planning with explicit change tracking and impact verification.
