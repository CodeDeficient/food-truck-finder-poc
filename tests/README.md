# Pipeline E2E Testing Documentation

## Overview

This document describes the comprehensive end-to-end testing suite for the food truck finder data pipeline, designed to address upscaling issues and ensure robust performance under load.

## Test Structure

### 1. Basic Pipeline Tests (`tests/pipeline.e2e.test.ts`)

- **Purpose**: Original autonomous discovery and ingestion testing
- **Scope**: Single URL processing with basic validation
- **Focus**: Core functionality verification

### 2. Upscaling Tests (`tests/pipeline.upscaling.e2e.test.ts`)

- **Purpose**: Comprehensive pipeline testing for production scenarios
- **Scope**: Multiple URL processing, data quality validation, error handling
- **Key Test Cases**:
  - Pipeline Health Check - Basic functionality verification
  - Single URL Processing - Complete pipeline validation
  - Autonomous Discovery - Multiple URLs testing
  - Data Quality Validation - Menu normalization verification
  - Pipeline Error Handling - Invalid URL scenarios
  - Pipeline Performance - Processing time measurement
  - Data Consistency - Duplicate prevention
  - Stale Data Detection - Refresh mechanism testing

### 3. Load Testing (`tests/pipeline.load.e2e.test.ts`)

- **Purpose**: Stress testing and resource monitoring
- **Scope**: High-load scenarios, concurrent processing, resource utilization
- **Key Test Cases**:
  - Concurrent Pipeline Requests - Multiple simultaneous operations
  - Memory and Resource Usage - Sequential processing analysis
  - API Rate Limiting - Rapid request handling
  - Database Connection Pool - Concurrent DB operations
  - Pipeline Recovery - Failure recovery testing

### 4. Test Utilities (`tests/utils/testUtils.ts`)

- **Purpose**: Shared utilities for database operations and testing
- **Features**:
  - Database cleanup and setup
  - Data quality validation
  - Performance metrics tracking
  - Resource monitoring
  - Concurrent processing utilities

## Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
- Test Directory: ./tests
- Parallel Execution: Disabled for E2E tests (shared state)
- Retries: 2 on CI, 0 locally
- Workers: 1 on CI, unlimited locally
- Timeout: 5 minutes (for pipeline operations)
- Base URL: http://localhost:3000
- Web Server: Automatically starts Next.js dev server
```

### Test Environment Variables

```bash
BASE_URL=http://localhost:3000  # Test server URL
CI=true                         # Enable CI-specific settings
```

## Running Tests

### Individual Test Suites

```bash
# All E2E tests
npm run test:e2e:playwright

# Upscaling tests only
npm run test:e2e:upscaling

# Load tests only
npm run test:e2e:load

# Original pipeline tests
npm run test:e2e:pipeline

# All pipeline tests
npm run test:pipeline:all

# Health check only
npm run test:pipeline:health
```

### Test Reports

- **HTML Report**: Generated automatically in `playwright-report/`
- **JSON Results**: Available in `test-results/results.json`
- **JUnit XML**: Available in `test-results/results.xml`

## Test Data Management

### Cleanup Strategy

- **Before Tests**: Clean up existing test data to ensure clean state
- **After Tests**: Optional cleanup (configurable)
- **URL-based Cleanup**: Remove trucks associated with specific test URLs
- **Time-based Cleanup**: Remove trucks older than specified days

### Data Validation

- **Menu Structure**: Validates normalized menu format (`category` field)
- **Required Fields**: Ensures name, source_urls, and other critical fields
- **URL Format**: Validates source URL format
- **Data Quality**: Comprehensive validation across all trucks

## Performance Metrics

### Tracked Metrics

- **Processing Time**: End-to-end pipeline duration
- **Throughput**: Trucks processed per second
- **Error Rate**: Percentage of failed operations
- **Resource Usage**: Database connection utilization
- **Data Quality**: Percentage of valid truck records

### Performance Thresholds

- **Single Truck Processing**: < 5 minutes
- **Concurrent Request Success**: > 80%
- **Database Operation Success**: > 90%
- **Processing Time Variance**: < 200% of average

## Error Handling Testing

### Failure Scenarios

1. **Invalid URLs**: Non-existent or malformed URLs
2. **Network Issues**: Timeout and connection failures
3. **Rate Limiting**: API throttling responses
4. **Database Errors**: Connection pool exhaustion
5. **Data Format Issues**: Malformed scraped content

### Recovery Testing

- **Graceful Degradation**: System continues operating after failures
- **Retry Mechanisms**: Automatic retry logic validation
- **Error Logging**: Comprehensive error tracking
- **State Consistency**: Database remains consistent after failures

## Data Quality Assurance

### Menu Normalization

- **Format Consistency**: All menus use `category` field (not `name`)
- **Structure Validation**: Proper category/items hierarchy
- **Item Validation**: All menu items have valid names
- **Migration Support**: Handles both old and new formats during transition

### Validation Rules

```typescript
// Required fields
- name: Non-empty string
- source_urls: Non-empty array of valid URLs
- menu: Array of categories (if present)

// Menu structure
- category.category: Non-empty string
- category.items: Array of menu items
- item.name: Non-empty string
```

## Monitoring and Alerting

### Real-time Monitoring

- **Database Statistics**: Truck counts, menu coverage, staleness
- **Performance Metrics**: Processing times, success rates
- **Resource Utilization**: Connection pools, memory usage
- **Error Tracking**: Failure rates and error patterns

### Alert Conditions

- **High Failure Rate**: > 20% pipeline failures
- **Slow Processing**: > 10 minutes per truck
- **Data Quality Issues**: > 30% trucks without menus
- **Stale Data**: > 50% trucks not updated in 3+ days

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout values in `playwright.config.ts`
2. **Database Connection Errors**: Check Supabase connection configuration
3. **API Rate Limits**: Reduce concurrent request counts
4. **Memory Issues**: Monitor resource usage during load tests

### Debug Tools

- **Playwright Trace Viewer**: Visual test execution debugging
- **Test Screenshots**: Automatic failure screenshots
- **Console Logs**: Detailed operation logging
- **Database Queries**: SQL execution monitoring

## Continuous Integration

### CI/CD Integration

```yaml
# Example GitHub Actions integration
- name: Run E2E Tests
  run: |
    npm install
    npm run build
    npm run test:pipeline:all
  env:
    BASE_URL: ${{ env.STAGING_URL }}
    SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

### Test Environments

- **Local Development**: Full test suite with manual triggers
- **Staging**: Automated testing on pull requests
- **Production**: Health checks and smoke tests only

## Best Practices

### Test Design

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up test data
3. **Timeouts**: Set appropriate timeouts for pipeline operations
4. **Retry Logic**: Implement retry for flaky operations
5. **Monitoring**: Track performance trends over time

### Data Management

1. **Use Test URLs**: Avoid testing on live production sites
2. **Limit Scope**: Keep test data sets manageable
3. **Validate Quality**: Always check data integrity
4. **Monitor Resources**: Track database and API usage

### Performance

1. **Baseline Metrics**: Establish performance baselines
2. **Trend Analysis**: Monitor performance over time
3. **Load Testing**: Regular stress testing
4. **Capacity Planning**: Plan for growth based on test results

## Future Enhancements

### Planned Improvements

1. **Visual Regression Testing**: UI component testing
2. **API Contract Testing**: Schema validation
3. **Performance Benchmarking**: Automated performance regression detection
4. **Chaos Engineering**: Fault injection testing
5. **Multi-environment Testing**: Cross-environment validation

### Metrics Dashboard

- Real-time test results visualization
- Performance trend analysis
- Error rate monitoring
- Resource utilization tracking
