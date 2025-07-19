# Type Validation Protocol Documentation

## Overview

This document outlines the protocols and techniques used in the Food Truck Finder project to ensure type safety and consistency between UI components, API responses, and database schemas.

## Purpose

The primary objective of this documentation is to:
1. **Maintain Type Safety**: Ensure all components and data flows have clearly defined types and interfaces.
2. **Prevent Data Corruption**: Validate all data inputs and outputs at various layers.
3. **Facilitate Debugging**: Clearly document how types flow through the application for easier resolution of issues.

## Type Validation Strategies

### 1. Interface Segregation
- **Components**: All components must explicitly define props interfaces and avoid using `any` or broad types where possible.
- **APIs**: API response types must be generated from Supabase DB Introspection using tools like [Supabase's TypeScript generator](https://github.com/supabase-community/typescript-generator).

### 2. Type Guard Functions
- **UI Layers**: Validate component input using helper type guards (e.g., `isFoodTruck(obj)`)
  ```typescript
  export function isFoodTruck(obj: unknown): obj is FoodTruck {
    return typeof obj === "object" && obj !== null && "id" in obj && "name" in obj;
  }
  ```

### 3. Union Type Normalization
- **Error Types**: Replace `any` in error unions with explicit error types
  ```typescript
  export interface FoodTruckError extends Error {
    code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'NETWORK_FAILURE';
    details?: Record<string, unknown>;
  }

  export const handleError = (error: FoodTruckError | Error) => {
    if("code" in error && error.code === "NOT_FOUND" ){
      // Domain-specific handling
    }
    // Generic error handling
  }
  ```

### 4. Interface Alignment
- **UI Components**: Ensure prop interfaces align with corresponding database types
  - Example: `TruckCardProps` should reference `TruckDataModel` directly from DB schemas

### 5. Linting Configurations
- **@typescript-eslint/strict-null-checks**: Enabled with custom rules
  - All interfaces should explicitly handle optional fields (i.e., use `ReadonlyArray<FoodTruck> | null` instead of `FoodTruck[]`)

### 6. Automated Type Generation
- **Postgres Schema Parsing**: Regular scripts to regenerate TypeScript API interfaces based on database schema modifications

  ```bash
  npm run generate:db:types
  ```

## Handling Data Propagation

### 1. Upstream Type Assertions
- **Supabase responses**: Enforce typing with type-safe queries

  ```typescript
  export interface SupabaseResult<T> {
    data: T[] | null;
    error: PostgrestError | undefined;
  }

  const {data, error} = await supabase
    .from('trucks')
    .select<TruckDataModel>('id, name, cuisines')
    .throwOnError();
  ```

### 2. Middleware Guards
- **Authentication Tokens**: Validate JWT claims from `food-truck-api` match Supabase token signatures
  - Example: `AuthTokenGuard` verifies `exp`, `iat`, and `user_id` properties before passing to API Layer

### 3. Type Guards in Components
- **Conditional Rendering**: Apply type checking during data propagation

  ```typescript
  {data && isFoodTruck(data) ? (
    <TruckCard {...data}/>
  ) : (
    <EmptyStateMessage/>
  )}
  ```

## Best Practices

- **Separate Interface Definitions**: Store all DB/API interfaces in `@/lib/database.types.ts`
- **Avoid Inline Types**: Always reference external interfaces to maintain clarity and consistency
- **Test Helper Functions**: Include type validators in testing utilities to ensure cross-module type compatibility

## Future Considerations

- **GraphQL Integration**: For future GraphQL endpoints, consider `GraphQLCodeGenerator` to auto-generate types based on schema definitions
- **Centralized Type Repository**: As the project scales, consider moving interface definitions to a centralized NPM package shared with front/backend

## Resources

- **[ESLint Plugin: Supabase](https://github.com/supabase/eslint-plugin)**: Integrates with TypeScript to catch common DB-related type issues
- **[Zod](https://zod.dev/)**: A third-party library used for schema validation that complements both backend and frontend type safety

This documentation will be updated regularly to reflect changes and optimizations made to the project's type validation strategies.
