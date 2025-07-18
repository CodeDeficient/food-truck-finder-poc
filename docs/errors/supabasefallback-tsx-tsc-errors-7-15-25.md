lib/fallback/supabaseFallback.tsx:136:7 - error TS2322: Type 'undefined' is not assignable to type 'FoodTruck | null'.    

136       return undefined;
          ~~~~~~

lib/fallback/supabaseFallback.tsx:139:7 - error TS2322: Type 'undefined' is not assignable to type 'FoodTruck | null'.    

139       return undefined;
          ~~~~~~

lib/fallback/supabaseFallback.tsx:237:11 - error TS2322: Type 'FoodTruck | undefined' is not assignable to type 'FoodTruck | null'.
  Type 'undefined' is not assignable to type 'FoodTruck | null'.

237           return safeJsonParse(cached, isFoodTruckData) ?? undefined;
              ~~~~~~

lib/fallback/supabaseFallback.tsx:240:7 - error TS2322: Type 'undefined' is not assignable to type 'FoodTruck | null'.    

240       return undefined;
          ~~~~~~

lib/fallback/supabaseFallback.tsx:243:7 - error TS2322: Type 'undefined' is not assignable to type 'FoodTruck | null'.    

243       return undefined;
          ~~~~~~

lib/fallback/supabaseFallback.tsx:257:11 - error TS2322: Type 'CachedData | undefined' is not assignable to type 'CachedData | null'.
  Type 'undefined' is not assignable to type 'CachedData | null'.

257           return safeJsonParse(cached, isCachedData) ?? undefined;
              ~~~~~~

lib/fallback/supabaseFallback.tsx:260:7 - error TS2322: Type 'undefined' is not assignable to type 'CachedData | null'.   

260       return undefined;
          ~~~~~~

lib/fallback/supabaseFallback.tsx:263:7 - error TS2322: Type 'undefined' is not assignable to type 'CachedData | null'.   

263       return undefined;
          ~~~~~~
