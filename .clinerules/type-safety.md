## Brief overview

This rule set outlines guidelines for maintaining type safety in TypeScript files, particularly during refactoring and when dealing with external data.

## Development workflow

- **Rule 1.1: Explicit Type Annotations**: Always provide explicit type annotations for variables, function parameters, and return types, especially when dealing with data from external sources (APIs, databases) or when refactoring existing code. This helps prevent `no-unsafe-assignment`, `no-explicit-any`, and `no-unsafe-member-access` errors.

  - _Trigger Case_: When consuming data from `fetch` responses, database queries, or when `any` types are inferred.
  - _Example_: Instead of `const data = await response.json();`, use `const data: MyType = await response.json();`. For dynamic data from `request.json()` in Next.js API routes, type as `unknown` and use type guards: `const body: unknown = await request.json(); if (typeof body === 'object' && body !== null && 'action' in body) { const action = (body as { action: string }).action; /* ... */ }`.

- **Rule 1.2: Handle Nullish Values Explicitly**: Avoid implicit boolean coercion of nullable values. Always use explicit comparisons (`=== null`, `!== undefined`, `??`) or type conversions (`Boolean(value)`) to handle `null` or `undefined`. This addresses `strict-boolean-expressions` and `unicorn/no-null` errors.

  - _Trigger Case_: In `if` statements, ternary operations, or logical expressions involving potentially nullish values.
  - _Example_: Instead of `if (value)`, use `if (value !== undefined)` or `if (value ?? false)`.

- **Rule 1.3: Address Unbound Methods**: When referencing class methods, ensure they are bound to the class instance to avoid `unbound-method` errors. Use arrow functions for class methods or explicitly bind them in the constructor.
  - _Trigger Case_: When passing class methods as callbacks (e.g., event handlers, `useEffect` dependencies).
  - _Example_: Change `myMethod() { ... }` to `myMethod = () => { ... }` or `this.myMethod = this.myMethod.bind(this);` in the constructor.

- **Rule 1.4: Prioritizing TypeScript Errors**: Any TypeScript errors (`ts Error`) introduced during refactoring or development must be addressed immediately and are considered critical linting issues, even if they do not appear in the ESLint `error-analysis.json` report.

  - _Trigger Case_: New TypeScript errors appear in the IDE or during `tsc --noEmit` checks.
  - _Example_: If removing `?? ''` causes a `TS2345` error, re-add the nullish coalescing or provide an explicit type guard to resolve the TypeScript error first.

- **Rule 1.5: Resolve Type Mismatches Caused by Lint Fixes**: When a linting fix (e.g., replacing `null` with `undefined` for `unicorn/no-null`) introduces a TypeScript error in a consuming component (e.g., a prop type mismatch), the TypeScript error must be resolved immediately. This may involve updating the type definitions in the consuming component or related files to align with the new value type.

  - _Trigger Case_: A TypeScript error appears immediately after a linting rule is fixed.
  - _Example_: After changing a prop value from `user ?? null` to `user ?? undefined` in a parent component, a `ts Error` appears. The child component's prop type must be updated from `User | null` to `User | undefined` to resolve the mismatch.

- **Rule 1.6: Handle Supabase Type Mismatches in Complex Structures**: When Supabase query results (`.select('*').overrideTypes<T>()`) lead to type errors (e.g., `TS2345`) due to nested type mismatches (e.g., `any[]` being returned for an expected `string[]` in array fields like `MenuItem.dietary_tags` or `FoodTruckSchema.cuisine_type`), temporarily relax the interface type to `any[]` for the problematic field in `lib/types.ts`. This allows immediate progress, but requires a subsequent, robust data transformation (e.g., explicit type guarding and mapping) in the consuming code (e.g., `lib/supabase.ts:groupMenuItems` or `lib/utils/QualityScorer.ts`) to ensure type safety before final use.

  - _Trigger Case_: `TS2345` errors when assigning Supabase query results to interfaces containing nested array types that Supabase returns as generic `any[]` or `Record<string, any>[]`.
  - _Example_: Change `dietary_tags: string[]` to `dietary_tags: any[]` in `MenuItem` interface, or `cuisine_type: string[]` to `cuisine_type: any[]` in `FoodTruckSchema`, followed by explicit array transformation in data processing functions.

- **Rule 1.7: Validate `await` Usage Against Function Return Types**: Before using `await` on a function call, verify that the function is `async` and returns a `Promise`. Redundant `await` keywords on non-Promise-returning functions can lead to linting errors and unnecessary complexity.

  - _Trigger Case_: Encountering `@typescript-eslint/await-thenable` or `sonarjs/no-invalid-await` errors.
  - _Example_: If `myFunction()` returns `void` or a non-Promise value, avoid `await myFunction();`. If `myAsyncFunction()` returns `Promise<T>`, then `await myAsyncFunction();` is appropriate.