# Enterprise Integration Guide

## Overview
Food Truck Finder provides multiple integration options for enterprise customers to incorporate food truck data and services into their platforms.

## Integration Methods

### 1. REST API
Full RESTful API for all platform capabilities.

```typescript
// Example: Fetch nearby food trucks
GET /api/trucks/nearby?lat=32.7157&lng=-117.1611&radius=5

Response:
{
  "trucks": [...],
  "total": 42,
  "radius": 5
}
```

**Key Endpoints:**
- `/api/trucks` - Food truck data
- `/api/search` - Advanced search capabilities  
- `/api/events` - Food truck events and schedules
- `/api/analytics` - Usage and trend analytics

### 2. Webhook Events
Real-time notifications for data changes.

**Available Events:**
- `truck.created` - New food truck added
- `truck.updated` - Food truck information changed
- `truck.location.changed` - Location update
- `event.created` - New food truck event

### 3. Bulk Data Export
For enterprise data warehousing needs.

**Formats Supported:**
- JSON
- CSV
- Parquet (coming soon)

**Delivery Methods:**
- Direct download
- S3 bucket delivery
- SFTP

### 4. Embedded Widgets
White-labeled components for your application.

```html
<!-- Food Truck Map Widget -->
<div id="ftf-map-widget" 
     data-api-key="your-api-key"
     data-location="32.7157,-117.1611"
     data-theme="light">
</div>
<script src="https://widgets.foodtruckfinder.app/v1/map.js"></script>
```

## Authentication

### API Key Management
```bash
curl -X POST https://api.foodtruckfinder.app/v1/trucks/nearby \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### OAuth 2.0 Flow
For user-context operations, we support standard OAuth 2.0 flow.

## Rate Limits

| Tier | Requests/Hour | Burst Limit | Concurrent |
|------|---------------|-------------|------------|
| Starter | 1,000 | 50/min | 10 |
| Professional | 10,000 | 500/min | 50 |
| Enterprise | Unlimited* | Custom | Custom |

*Fair use policy applies

## SDKs & Libraries

### Official SDKs
- **Node.js/TypeScript**: `npm install @foodtruckfinder/sdk`
- **Python**: `pip install foodtruckfinder`
- **React Components**: `npm install @foodtruckfinder/react`

### Community SDKs
- Ruby, Go, PHP (community maintained)

## Data Schema

### Food Truck Object
```typescript
interface FoodTruck {
  id: string;
  name: string;
  description: string;
  cuisine_type: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
    last_updated: Date;
  };
  schedule: Schedule[];
  contact: ContactInfo;
  ratings: Ratings;
  menu_items: MenuItem[];
}
```

## Integration Support

### Documentation
- Full API reference: https://api.foodtruckfinder.app/docs
- Postman collection available
- OpenAPI/Swagger specification

### Developer Support
- Dedicated Slack channel for enterprise customers
- Direct engineering support
- Custom integration assistance

### Testing Environment
- Sandbox API: https://sandbox.api.foodtruckfinder.app
- Test data provided
- No rate limits in sandbox

## Compliance & Standards

- **API Standards**: RESTful, OpenAPI 3.0 compliant
- **Security**: TLS 1.3, OAuth 2.0, API key rotation
- **Data Formats**: JSON (default), XML, CSV
- **Versioning**: Semantic versioning with deprecation notices

## Getting Started

1. **Sign up** for an enterprise account
2. **Generate** your API credentials
3. **Test** in our sandbox environment
4. **Deploy** to production

For enterprise onboarding assistance, contact:
enterprise@foodtruckfinder.app

---
*Last Updated: 2025-08-08*
