# Error Handling Tests

This directory contains comprehensive automated tests for error scenarios to ensure the application gracefully handles failures and provides good user experience even when things go wrong.

## Test Structure

### Unit Tests (Jest + React Testing Library)

- **`api-error-handling.test.ts`** - Tests for server-side error handling, API failures, and data transformation errors
- **`ui-component-errors.test.tsx`** - Tests for UI components with undefined/invalid props and error boundary integration

### End-to-End Tests (Cypress)

- **`network-errors.cy.ts`** - Tests for network failures, 500 errors, timeout scenarios, and graceful degradation

## Running the Tests

### All Error Tests
```bash
npm run test:error
```

### Unit Tests Only
```bash
npm run test:error:unit
```

### E2E Tests Only  
```bash
npm run test:error:e2e
```

## Test Scenarios Covered

### 1. Component Error Fallbacks
- Components with `undefined` props
- Invalid prop types
- Missing required props
- Error boundary integration
- DOM structure preservation with invalid props

### 2. API Error Handling
- HTTP 500 server errors
- Network connection failures
- Request timeouts
- Invalid JSON responses
- Database connection errors
- External API failures

### 3. Network Error Scenarios
- API 500 server errors with graceful degradation
- Network connection failures
- Intermittent connectivity issues
- Slow network conditions
- Request timeout handling
- Progressive enhancement (JavaScript disabled)
- Error recovery when network is restored

### 4. Data Validation Errors
- Invalid JSON parsing
- Missing required fields
- Type validation failures
- Array transformation errors
- Geocoding errors

### 5. Error Recovery and Fallbacks
- Retry logic for failed requests
- Fallback data when primary sources fail
- Feature degradation when services are unavailable
- Error monitoring and user-friendly messaging

## Configuration

### Jest Configuration
Error handling tests are configured to:
- Allow `any` types for mocking
- Relax complexity rules for comprehensive testing
- Allow console usage for debugging
- Handle ES modules properly

### Cypress Configuration
- Custom commands for simulating network errors
- Error interception and handling
- Timeout and retry logic testing
- Network condition simulation

## Quality Gates

The `test:error` script is designed to be used as a quality gate before PR merges:

```bash
# This should pass before merging
npm run test:error
```

## Best Practices

1. **Graceful Degradation**: All tests verify that errors don't crash the application
2. **User-Friendly Messaging**: Error messages should be helpful, not technical
3. **Error Boundaries**: Components should be wrapped in error boundaries
4. **Fallback Content**: Always provide fallback content when data is unavailable
5. **Retry Logic**: Implement exponential backoff for failed requests
6. **Error Monitoring**: Log errors for monitoring and debugging

## Adding New Error Tests

When adding new error scenarios:

1. Identify the component/API that could fail
2. Write unit tests for props/data validation
3. Write e2e tests for user-visible error scenarios
4. Ensure error boundaries catch and handle errors gracefully
5. Verify fallback content is meaningful and helpful
6. Test error recovery when the issue is resolved

## Integration with CI/CD

These tests are designed to run in continuous integration to catch regressions in error handling:

- Fast unit tests catch component-level issues
- E2E tests verify user experience during failures
- Network simulation tests various connectivity scenarios
- Quality gates prevent deployment of broken error handling
