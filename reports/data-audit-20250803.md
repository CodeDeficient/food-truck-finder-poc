# Data Audit Report - 20250803

## Data Entry Points

### Supabase Tables
- Profiles
- Food Trucks
- Scraping Jobs
- Discovered URLs
- User Favorites

### API Routes
- Trucks API: `/api/trucks`
- Scrape API: `/api/scrape`

### Data Pipeline
- Scraping Jobs initiated via API or automated tasks

### Client Forms
- Truck submission form in client application

## Exploratory Data Analysis

### Profile Table
- Null values found in `full_name` and `email`
- Incorrect role types

### Food Trucks Table
- Null values in `cuisine_type`, `current_location`, `operating_hours`
- Invalid `average_rating` values over 5
- Orphan foreign keys in `owner_id`

### Scraping Jobs Table
- Some jobs stuck in `pending` state
- `result` fields with malformed JSON

## Detected Anomalies
- Nulls and malformed data fields were observed across several tables.
- Orphan foreign keys in the `Food Trucks` table linked back to non-existent users.

## Estimation of Defect Rates
- Null/empty value defect rate: ~5%
- Bad type values: ~2%
- Orphan foreign keys: ~1.5%

## Recommendations
- Implement validation checks in forms to reduce null entries.
- Enhance API input validation.
- Review foreign key constraints and use cascading deletes to handle orphaned records.

---

*This data audit provides insights into current data quality and areas of improvement for the Food Truck Finder project.*
