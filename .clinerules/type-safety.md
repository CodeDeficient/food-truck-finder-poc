## Brief overview
This rule set outlines guidelines for maintaining type safety in TypeScript files, particularly during refactoring and when dealing with external data.

## Development workflow
- **Rule 1.1: Explicit Type Annotations**: Always provide explicit type annotations for variables, function parameters, and return types, especially when dealing with data from external sources (APIs, databases) or when refactoring existing code. This helps prevent `no-unsafe-assignment`, `no-explicit-any`, and `no-unsafe-member-access` errors.
  - *Trigger Case*: When consuming data from `fetch` responses, database queries, or when `any` types are inferred.
  - *Example*: Instead of `const data = await response.json();`, use `const data: MyType = await response.json();`. For dynamic data from `request.json()` in Next.js API routes, type as `unknown` and use type guards: `const body: unknown = await request.json(); if (typeof body === 'object' && body !== null && 'action' in body) { const action = (body as { action: string }).action; /* ... */ }`.

- **Rule 1.2: Handle Nullish Values Explicitly**: Avoid implicit boolean coercion of nullable values. Always use explicit comparisons (`=== null`, `!== undefined`, `??`) or type conversions (`Boolean(value)`) to handle `null` or `undefined`. This addresses `strict-boolean-expressions` and `unicorn/no-null` errors.
  - *Trigger Case*: In `if` statements, ternary operations, or logical expressions involving potentially nullish values.
  - *Example*: Instead of `if (value)`, use `if (value !== undefined)` or `if (value ?? false)`.

- **Rule 1.3: Address Unbound Methods**: When referencing class methods, ensure they are bound to the class instance to avoid `unbound-method` errors. Use arrow functions for class methods or explicitly bind them in the constructor.
  - *Trigger Case*: When passing class methods as callbacks (e.g., event handlers, `useEffect` dependencies).
  - *Example*: Change `myMethod() { ... }` to `myMethod = () => { ... }` or `this.myMethod = this.myMethod.bind(this);` in the constructor.
