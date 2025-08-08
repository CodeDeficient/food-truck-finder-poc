# Validation Guide

## Setup Instructions

1. **Unit Testing**: Ensure `jest` and `@testing-library/react` are installed for testing components and schemas.
   ```bash
   npm install jest @testing-library/react --save-dev
   ```

2. **Integration Testing**: Use `supertest` for API endpoint validation.
   ```bash
   npm install supertest @types/supertest --save-dev
   ```

3. **OpenAPI Documentation**: The OpenAPI spec is generated using `zod-to-openapi`. Access it via Swagger UI at `/api/docs`.

4. **Run all Tests**:
   ```bash
   npm test
   ```

## Extension Instructions

- **Adding New Endpoints**: Update the schema and validation logic in `schemas/` and reflect changes in `openapi.json`.
- **Documentation Updates**: Update the OpenAPI JSON and ensure Swagger UI renders correctly at `/api/docs`.
- **Test Coverage**: Write unit and integration tests for new functionalities.

## Zero-Trust Verification Checklist

- [ ] **Review Contracts**: Verify all endpoint inputs/outputs align with the specifications.
- [ ] **Type Consistency**: Confirm all types are consistent within the application.
- [ ] **Automated Checks**: Run the following to ensure code quality:
  - `npx tsc --noEmit` for TypeScript sanity tests.
  - `npx eslint .` to catch linting errors.
  - `npx jscpd .` to detect code duplications.
- [ ] **Integration Tests**: Validate end-to-end functionality through `supertest` integration tests.
- [ ] **Error Handling**: Ensure graceful error handling across all API endpoints.
- [ ] **Data Source Validation**: Confirm the source data is properly validated and sanitized before processing.

Ensure to follow these steps thoroughly to maintain robust validation practices and to adopt a zero-trust principle in all API transactions.
