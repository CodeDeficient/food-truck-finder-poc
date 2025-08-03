-- ========================================
-- Production Database Migration Script
-- Apply these SQL statements to the production database
-- ========================================

-- Step 1: Add owner_id column to food_trucks table
-- ============================================
ALTER TABLE food_trucks 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance when querying trucks by owner
CREATE INDEX IF NOT EXISTS idx_food_trucks_owner_id ON food_trucks(owner_id);

-- Add comment to document the new column
COMMENT ON COLUMN food_trucks.owner_id IS 'Reference to the user who owns this food truck (food_truck_owner role)';


-- Step 2: Update food truck RLS policies for owners
-- =================================================

-- Allow food truck owners to update their own trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can update their own trucks'
  ) THEN
    CREATE POLICY "Food truck owners can update their own trucks" 
      ON food_trucks FOR UPDATE 
      TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow food truck owners to insert new trucks (with themselves as owner)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can create trucks'
  ) THEN
    CREATE POLICY "Food truck owners can create trucks" 
      ON food_trucks FOR INSERT 
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow food truck owners to delete their own trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can delete their own trucks'
  ) THEN
    CREATE POLICY "Food truck owners can delete their own trucks" 
      ON food_trucks FOR DELETE 
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow admins to manage all trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Admins can manage all trucks'
  ) THEN
    CREATE POLICY "Admins can manage all trucks" 
      ON food_trucks FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;


-- Step 3: Create favorite_trucks view
-- ===================================

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

-- Add comment on the view
COMMENT ON VIEW favorite_trucks IS 'View that combines user favorites with food truck details for easier querying';


-- ========================================
-- End of Migration Script
-- ========================================
-- 
-- After running this script, verify the changes by running:
-- node scripts/test-database-schema.cjs
-- 
-- Expected results:
-- ✅ Column owner_id in food_trucks: OK
-- ✅ View favorite_trucks: OK
-- ========================================
