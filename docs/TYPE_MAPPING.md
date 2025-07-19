# Food Truck Metadata Type Mapping Documentation

## Overview
This document provides a comprehensive mapping between your application's data models, Supabase database schema, and cached data structures to ensure type consistency across the system.

## Type Definitions

### `FoodTruck` Model
**Location**: `lib/types.ts`

```typescript
export interface FoodTruck {
  readonly id: string;
  readonly name: string;
  readonly cuisine_type: string;
  readonly price_range: string;
  readonly image_url?: string;
  readonly description?: string;
  readonly menu_items?: MenuItem[];
  readonly operating_hours?: OperatingHours[];
  readonly location?: Location;
}

export interface MenuItem {
  readonly id: string;
  readonly name: string;
  readonly price_cents: number;
  readonly image_url?: string;
  readonly description?: string;
}

export interface OperatingHours {
  readonly day: DayOfWeek;
  readonly open: string; // 24-hour format
  readonly close: string; // 24-hour format
}

export interface Location {
  readonly latitude: number;
  readonly longitude: number;
  readonly address?: string;
  readonly city?: string;
  readonly state?: string;
  readonly zip_code?: string;
}

export enum DayOfWeek {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
}

export interface OperatingHoursWithType {
  day: DayOfWeek;
  open: string;
  close: string;
  type: 'closed' | 'open';
}

// Example full type with optional properties
type FullFoodTruck = {
  readonly id: string;
  readonly name: string;
  readonly cuisine_type: string;
  readonly price_range: string;
  readonly image_url: string | null; // Type conversion for SQL NULL
  readonly description: string | null; // Type conversion for SQL NULL
  readonly menu_items: MenuItem[] | null; // Complex nested type
  readonly operating_hours: OperatingHours[] | null; // Complex nested type
  readonly location: Location | null; // Complex nested type
};
```

### `CachedData` Interface
**Location**: `lib/fallback/supabaseFallback.new.tsx`

```typescript
interface CachedData {
  readonly trucks: FoodTruck[];
  readonly timestamp: number;
  readonly lastSuccessfulUpdate: string;
}

const isCachedData = (obj: unknown): obj is CachedData => {
  if (isObject(obj) && 'trucks' in obj && Array.isArray(obj.trucks)) {
    return obj.trucks.every(isFoodTruckData) &&
           typeof obj.timestamp === 'number' &&
           typeof obj.lastSuccessfulUpdate === 'string';
  }
  return false;
};
```

## Supabase Database Schema Verification

### Supabase `food_trucks` Table
**Schema** (auto-generated via introspection)
- `id`: PRIMARY KEY UUID
- `name`: Varchar(255) NOT NULL
- `cuisine_type`: Varchar(100)
- `price_range`: Varchar(50)
- `image_url`: Text (nullable)
- `description`: Text (nullable)
- `metadata`: JSONB (contains all remaining fields in normalized format)

### JSONB Structure
- **`menu_items`**: Array[{id, name, price_cents, image_url, description}]
- **`operating_hours`**: Array[{day, open, close}]
- **`location`**: {latitude, longitude, address}

### Table Constraints
- All fields must align with `FoodTruck` interface
- `image_url` supports NULL
- `description` supports NULL
- `menu_items`/`operating_hours`/`location` stored in single JSONB column

## Type Mapping

### Model -> Supabase Sync
- `FoodTruck.id` → UUID
- `FoodTruck.name` ≡ Varchar(255) NOT NULL
- `FoodTruck.cuisine_type` ≡ Varchar(100)
- `FoodTruck.price_range` ≡ Varchar(50)
- `FoodTruck.image_url` ≡ Text (nullable)
- `FoodTruck.description` ≡ Text (nullable)
- `FoodTruck.menu_items`: Normalized in JSONB
   - Each item: `{"id": ID,..., "price_cents": Number}`
- `FoodTruck.operating_hours`: Normalized in JSONB
   - Each entry: {"day": "monday",...}
    - DayOfWeek enum → String
- `FoodTruck.location`: Normalized GeoJSON
   - {"type": "Point", "coordinates": [lon,lat]}

### Database → Model Parsing
- Use `isFoodTruckData()` validation before deserialization
- Explicitly cast JSONB fields:
```typescript
const truck: FoodTruck = {
  ...dataRow,
  id: dataRow.id,
  name: dataRow.name,
  cuisine_type: dataRow.cuisine_type ?? 'Unknown',
  price_range: dataRow.price_range ?? 'Affordable',
  menu_items: JSON.parse(dataRow.metadata)?.menu_items || [],
  operating_hours: JSON.parse(dataRow.metadata)?.operating_hours || []
};
```
- Handle optional fields:
   - `location` = Optional GeoJSON parsed separately

### Error Propagation Checks
- Type Guard for full model validation:
```typescript
const valid = isFoodTruckData(truck)
```
- Implement data sanitization wrappers:
   - `sanitizeTruckForFrontEnd(data)`
   - `convertToPostgresJSONBReady(truck)`

### Cached Data Validation
- On localStorage retrieval:
```typescript
if (cached.trucks.some((truck: unknown) => !isFoodTruckData(truck))) {
  throw new Error("One or more cached trucks are invalid. Clearing cache and refreshing...");
  localStorage.removeItem('food-trucks-cache');
  return await fetchFromSupabase();
}
```
- On local storage write:
```typescript
const fullDataCheck = localStorageData.every(t => isFoodTruckData(t));
if (!fullDataCheck) throw new Error("Invalid cached truck structure");
```

# Error Handling Protocols

1. **Immediate Rejection Handling**: Throw error on 422:
```typescript
if (error?.status === 422) {
  throw new Error('Unprocessable Entity: Invalid payload structure for FoodTruck creation');
}
```

2. **Partial Updates Tracking**:
```typescript
const partialUpdate = await supabase
  .from('food_trucks')
  .upsert(partialTruck, { onConflict: 'id' });
if (partialUpdate.error?.code?.includes("23505")) {
  throw new Error("Duplicate FoodTruck entry detected. Use explicit ID or disable upsert.");
}
```

3. **Fallback Consistency Checks**:
   - Confirm:
```javascript
if (typeof cachedData.lastSuccessfulUpdate !== 'string') reject("Invalid cache timestamp");
```

4. **Reliable Fallbacks**:
```typescript
// Cache miss strategy
return {
  trucks: [], // Explicit empty array instead of null
  isFromCache: false,
  lastUpdate: 'Failed to load',
  status: 'unavailable'
};
```

5. **Asynchronous Retry Protocols**:
```typescript
async function withRetries(func: Function, retries=3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await func();
    } catch (error: unknown) {
      if (i === retries - 1) throw error;
      console.log(`Failed to execute. Retry attempt ${i+1}`);
      await new Promise(res => setTimeout(res, 500));
    }
  }
}
```

6. **Type Guard Testing**:
```typescript
const validateTruckAfterDBChange = (truck: any) => {
   // Test nested objects and all props
  expect(truck).toEqual({
    id: expect.any(String),
    name: expect.any(String),
    description: expect.stringMatching(/^[A-Z][a-z\d\s.-]+$/)
  });
};
```

## Additional Documentation

- API_SCHEMA_v2.pdf [Attached]
- SUPABASE_SCHEMA_v1.0.4.sql [Attached]
- TEST_CASES.md [Attached]
- MODEL_SYNC_LOG_2022-08.pdf [Attached]

### Next Steps
- Update Schema Check Tests
- Verify all PostgrestTransformBuilder uses strict mode
- Validate all interface changes from db-types.ts
- Confirm Supabase schema.d.ts is up-to-date
