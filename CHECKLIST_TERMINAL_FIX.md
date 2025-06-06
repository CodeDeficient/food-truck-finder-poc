# Terminal Fix Checklist (Context7 & Tavily MCP)

## 1. Identify Remaining Problems

- [ ] Open the terminal and run linting, type-checking, and tests:
  - [ ] `pnpm lint`
  - [ ] `pnpm tsc --noEmit`
  - [ ] `pnpm test`
- [ ] Review `eslint-output.json` and any error logs for details.

## 1a. Current Errors (as of June 4, 2025)

### 1. Linting/ESLint Errors

- [ ] 1.1. app/page.tsx
  - [ ] 1.1.1. Line 170: Unused eslint-disable directive (no problems were reported from 'sonarjs/no-intrusive-permissions')
  - [ ] 1.1.2. Line 172: Make sure the use of the geolocation is necessary (sonarjs/no-intrusive-permissions)
- [ ] 1.2. components/ui/ToggleGGroup.tsx
  - [ ] 1.2.1. Line 50: Use `.size > 0` when checking size is not zero (unicorn/explicit-length-check)
- [ ] 1.3. lib/firecrawl.ts
  - [ ] 1.3.1. Line 283: Make sure the regex used here, which is vulnerable to super-linear runtime due to backtracking, cannot lead to denial of service (sonarjs/slow-regex)
  - [ ] 1.3.2. Line 283: Remove duplicates in this character class (sonarjs/duplicates-in-character-class) [multiple]
- [ ] 1.4. lib/gemini.test.ts
  - [ ] 1.4.1. Line 18: Unsafe assignment of an `any` value (@typescript-eslint/no-unsafe-assignment)
  - [ ] 1.4.2. Line 19: Unsafe return of a value of type `any` (@typescript-eslint/no-unsafe-return)

### 2. TypeScript Errors

- [ ] 2.1. .next/types/app/api/auto-scrape-initiate/route.ts:12
  - [ ] 2.1.1. TS2344: Type 'OmitWithTag<...>' does not satisfy the constraint '{ [x: string]: never; }'. Property 'get' is incompatible with index signature.
- [ ] 2.2. .next/types/app/api/pipeline/route.ts:12
  - [ ] 2.2.1. TS2344: Type 'OmitWithTag<...>' does not satisfy the constraint '{ [x: string]: never; }'. Property 'supabase' is incompatible with index signature.
- [ ] 2.3. .next/types/app/api/trucks/[id]/route.ts:49, :205
  - [ ] 2.3.1. TS2344: Type '{ **tag**: ... }' does not satisfy the constraint 'ParamCheck<RouteContext>'. The types of '**param_type**.params' are incompatible between these types.
- [ ] 2.4. app/admin/analytics/page.tsx:11
  - [ ] 2.4.1. TS1261: Already included file name 'components/ui/table.tsx' differs from file name 'components/ui/Table.tsx' only in casing.
- [ ] 2.5. components/ui/calendar.tsx:58
  - [ ] 2.5.1. TS2353: Object literal may only specify known properties, and 'IconLeft' does not exist in type 'Partial<CustomComponents>'.
- [ ] 2.6. lib/database.types.ts:566, :580
  - [ ] 2.6.1. TS2536: Type 'EnumName' cannot be used to index type 'Database[...]'.
  - [ ] 2.6.2. TS2536: Type 'CompositeTypeName' cannot be used to index type 'Database[...]'.
- [ ] 2.7. lib/scheduler.ts:393
  - [ ] 2.7.1. TS2741: Property 'enabled' is missing in type '{ id: string; ... }' but required in type 'ScheduledTask'.

### 3. Test Errors

- [ ] 3.1. Jest: Failed to parse the TypeScript config file `jest.config.ts`. 'ts-node' is required for the TypeScript configuration files. Make sure it is installed.

---

## 2. Research Solutions

- [ ] For each error or warning:
  - [ ] Use Context7 to look up relevant documentation or code examples for the affected library or framework.
  - [ ] Use Tavily MCP tools to search for solutions, best practices, or similar issues online.

## 3. Apply Fixes

- [ ] Edit the affected files as per the solutions found.
- [ ] After each fix, re-run:
  - [ ] `pnpm lint`
  - [ ] `pnpm tsc --noEmit`
  - [ ] `pnpm test`

## 4. Validate Fixes

- [ ] Ensure all errors and warnings are resolved in the terminal.
- [ ] Confirm all tests pass and the application runs as expected.

## 5. Document Changes

- [ ] Update `README.md` or other documentation with any important changes or new steps.

## 6. Final Review

- [ ] Do a final run of all quality checks in the terminal.
- [ ] Commit and push your changes.

---

**Tip:** Use this checklist as you work through each problem. Check off each item as you complete it for clear progress tracking.
