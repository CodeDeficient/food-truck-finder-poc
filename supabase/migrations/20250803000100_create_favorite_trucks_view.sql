-- Migration: Create favorite_trucks view for easier querying
-- Description: Create a view that makes it easier to query user favorites with truck details

-- Create a view that joins user_favorites with food_trucks for easier querying
CREATE OR REPLACE VIEW favorite_trucks AS
SELECT 
  uf.id,
  uf.user_id,
  uf.truck_id,
  uf.created_at,
  uf.updated_at,
  ft.name,
  ft.cuisine_type,
  ft.current_location,
  ft.contact_info,
  ft.verification_status,
  ft.data_quality_score,
  ft.average_rating,
  ft.review_count
FROM user_favorites uf
JOIN food_trucks ft ON uf.truck_id = ft.id;

-- Grant access to authenticated users
GRANT SELECT ON favorite_trucks TO authenticated;

-- Add RLS policy for the view
ALTER VIEW favorite_trucks SET (security_invoker = true);

-- Comment on the view
COMMENT ON VIEW favorite_trucks IS 'View that combines user favorites with food truck details for easier querying';
