-- Data Quality Cleanup Script
-- Fix undefined values, NA placeholders, and improve data quality scores

-- 1. Fix price_range undefined values
UPDATE food_trucks 
SET price_range = NULL 
WHERE price_range = 'undefined';

-- 2. Fix addresses with undefined placeholders
UPDATE food_trucks 
SET current_location = jsonb_set(
  current_location,
  '{address}',
  to_jsonb(
    CASE 
      WHEN current_location->>'address' LIKE '%undefined%' THEN
        regexp_replace(current_location->>'address', ', undefined', '', 'g')
      ELSE current_location->>'address'
    END
  )
)
WHERE current_location->>'address' LIKE '%undefined%';

-- 3. Fix lat/lng coordinates that are 0,0 (invalid location)
UPDATE food_trucks 
SET current_location = jsonb_set(
  jsonb_set(current_location, '{lat}', 'null'),
  '{lng}', 'null'
)
WHERE (current_location->>'lat')::numeric = 0 
  AND (current_location->>'lng')::numeric = 0;

-- 4. Update data quality scores for cleaned records
UPDATE food_trucks 
SET data_quality_score = CASE
  WHEN name IS NOT NULL 
    AND description IS NOT NULL 
    AND description != '' 
    AND price_range IS NOT NULL 
    AND cuisine_type IS NOT NULL 
    AND array_length(cuisine_type, 1) > 0
    AND current_location->>'address' IS NOT NULL 
    AND current_location->>'address' != ''
    AND NOT (current_location->>'address' LIKE '%undefined%')
    AND (current_location->>'lat')::numeric != 0
    AND (current_location->>'lng')::numeric != 0
  THEN 0.9
  WHEN name IS NOT NULL 
    AND description IS NOT NULL 
    AND description != ''
    AND (price_range IS NOT NULL OR cuisine_type IS NOT NULL)
  THEN 0.7
  ELSE 0.5
END;

-- 5. Set verification status based on data quality
UPDATE food_trucks 
SET verification_status = CASE
  WHEN data_quality_score >= 0.8 THEN 'verified'
  WHEN data_quality_score >= 0.6 THEN 'pending'
  ELSE 'flagged'
END;

-- Show summary of changes
SELECT 
  verification_status,
  COUNT(*) as count,
  ROUND(AVG(data_quality_score), 2) as avg_quality
FROM food_trucks 
GROUP BY verification_status
ORDER BY verification_status;
