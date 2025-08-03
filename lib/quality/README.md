# Data Quality Scoring Service

This module provides a comprehensive data quality scoring system for evaluating and enhancing the quality of Food Truck entities within the application.

## Features

### 🎯 Rule-based Validation
- **Critical Rules**: Essential requirements that must be met (1 point each)
- **Warning Rules**: Important but non-blocking validations (0.5 points each)  
- **Info Rules**: Nice-to-have improvements (0.1 points each)

### 📊 Scoring System
- Percentage-based scoring (0-100%)
- Letter grades (A, B, C, D, F)
- Detailed breakdown of points earned vs possible points
- Validation results with specific issue descriptions

### 🔧 Validation Rules

#### Critical Rules (1 point each)
- `truck_name_required`: Food truck name is required
- `truck_id_valid`: Valid truck ID is required  
- `name_format_valid`: Name must be valid format and under 100 characters

#### Warning Rules (0.5 points each)  
- `price_range_provided`: Price range should be specified ($, $$, $$$, $$$$)
- `location_completeness`: If coordinates provided, address should also be provided
- `contact_info_provided`: At least one contact method should be available
- `cuisine_type_provided`: Cuisine type should be specified

#### Info Rules (0.1 points each)
- `description_provided`: Description improves discoverability
- `operating_hours_provided`: Operating hours help customers  
- `social_media_provided`: Social media increases engagement
- `menu_provided`: Menu information helps customer decisions

## Usage

### Basic Usage

```typescript
import { assessQuality, calculateQualityScore, validateEntity } from './qualityScorer';
import type { FoodTruck } from '../types';

// Complete assessment (validation + scoring)
const truck: FoodTruck = { /* your truck data */ };
const { validation, score } = assessQuality(truck);

console.log(`Score: ${score.score}% (Grade: ${score.grade})`);
console.log(`Critical issues: ${validation.critical.length}`);
console.log(`Warnings: ${validation.warnings.length}`);

// Just validation
const validationResult = validateEntity(truck);

// Just scoring (with existing validation)
const scoreResult = calculateQualityScore(truck, validationResult);
```

### Scoring Rubric

The scoring system uses a weighted point system:

- **Total Possible Points**: Sum of all rule points
  - Critical: 3 rules × 1 point = 3 points
  - Warning: 4 rules × 0.5 points = 2 points  
  - Info: 4 rules × 0.1 points = 0.4 points
  - **Total**: 5.4 points

- **Score Calculation**: `(Points Earned / Total Possible) × 100`

- **Grade Assignment**:
  - A: 90-100%
  - B: 80-89%
  - C: 70-79%
  - D: 60-69%
  - F: Below 60%

### Integration with Database

The quality scorer integrates with the database schema:

```sql
-- Store per-record scores
INSERT INTO data_quality_scores (
    entity_type, entity_id, score, grade, 
    validation_details, breakdown
) VALUES (
    'food_truck', truck_id, score, grade,
    validation_json, breakdown_json
);

-- Aggregate daily metrics  
SELECT aggregate_daily_quality_metrics();
```

## Environment Configuration

Configure the service using environment variables:

```bash
# Batch processing
QUALITY_BATCH_SIZE=50
QUALITY_MAX_RETRIES=3

# Scheduling (cron format)
QUALITY_CRON_SCHEDULE="0 2 * * *"  # Daily at 2 AM

# Security
CRON_SECRET=your-secret-here

# Environment
NODE_ENV=production
ENABLE_CRON=true
TZ=UTC
```

## API Integration

### Manual Trigger
```bash
# Trigger score update
curl -X POST /api/cron/quality-scores \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Health check
curl /api/cron/quality-scores
```

### Scheduled Updates

The service automatically schedules nightly updates when:
- `NODE_ENV=production`
- `ENABLE_CRON=true`

## Extending the System

### Adding New Rules

1. Define the rule in `VALIDATION_RULES` array:

```typescript
{
    name: 'my_custom_rule',
    severity: 'warning',
    points: SCORING_CONFIG.WARNING_RULE_POINTS,
    check: (truck) => {
        // Your validation logic
        return truck.customField !== null;
    },
    message: 'Custom field should be provided'
}
```

2. The rule will automatically be included in scoring calculations.

### Custom Scoring Logic

Override the scoring configuration:

```typescript
const CUSTOM_SCORING_CONFIG = {
    CRITICAL_RULE_POINTS: 2.0,  // Double weight for critical
    WARNING_RULE_POINTS: 0.75,
    INFO_RULE_POINTS: 0.25,
};
```

## Monitoring & Metrics

The service provides detailed logging and metrics:

- Processing statistics (processed, updated, errors)
- Execution duration tracking  
- Daily aggregated metrics
- Grade distribution tracking
- Issue categorization and counting

## Database Schema

### Tables Created

- `data_quality_scores`: Per-record quality scores
- `data_quality_metrics_daily`: Aggregated daily metrics  

### Views Created

- `latest_quality_scores`: Latest scores for all entities

### Functions Created

- `calculate_food_truck_quality_score(UUID)`: Calculate score for specific truck
- `aggregate_daily_quality_metrics(DATE)`: Aggregate metrics for date

## Best Practices

1. **Run Regularly**: Schedule updates to keep scores current
2. **Monitor Performance**: Track processing times and error rates
3. **Review Rules**: Regularly assess if validation rules need updates
4. **Handle Errors**: Implement proper error handling and retries
5. **Security**: Always use environment variables for sensitive configuration
6. **Testing**: Test rule changes thoroughly before deployment

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure Supabase credentials are correct
2. **Migration Errors**: Run migrations before using the service
3. **Permission Issues**: Verify service role has necessary permissions
4. **Cron Not Running**: Check `ENABLE_CRON` and `NODE_ENV` settings

### Debugging

Enable detailed logging:

```bash
DEBUG=quality:* node scripts/updateQualityScores.js
```

Check service health:

```bash
curl /api/cron/quality-scores
```
