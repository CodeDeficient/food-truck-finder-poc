-- ========================================
-- Fix Supabase Advisor Alerts Script
-- Addresses all security and performance issues flagged by Supabase
-- ========================================

-- 1. Fix Security Definer View Issue
-- ===================================
-- Drop and recreate the favorite_trucks view without SECURITY DEFINER
DROP VIEW IF EXISTS favorite_trucks;

CREATE VIEW favorite_trucks WITH (security_invoker = true) AS
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
COMMENT ON VIEW favorite_trucks IS 'View that combines user favorites with food truck details for easier querying (security_invoker)';


-- 2. Fix Function Search Path Issues
-- ==================================
-- Fix get_columns function
CREATE OR REPLACE FUNCTION get_columns(p_table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE sql
SET search_path TO 'public'
SECURITY INVOKER
AS $$
    SELECT column_name::text, data_type::text
    FROM information_schema.columns
    WHERE table_name = p_table_name;
$$;

-- Fix update_food_trucks_updated_at function
CREATE OR REPLACE FUNCTION update_food_trucks_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_user_favorites_updated_at function
CREATE OR REPLACE FUNCTION update_user_favorites_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- 3. Fix RLS Performance Issues (Replace auth.uid() with SELECT auth.uid())
-- ========================================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON user_favorites;
DROP POLICY IF EXISTS "Food truck owners can update their own trucks" ON food_trucks;
DROP POLICY IF EXISTS "Food truck owners can create trucks" ON food_trucks;
DROP POLICY IF EXISTS "Food truck owners can delete their own trucks" ON food_trucks;
DROP POLICY IF EXISTS "Admins can manage all trucks" ON food_trucks;

-- Recreate user_favorites policies with optimized auth calls
CREATE POLICY "Users can view their own favorites" 
  ON user_favorites FOR SELECT 
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own favorites" 
  ON user_favorites FOR INSERT 
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own favorites" 
  ON user_favorites FOR DELETE 
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Recreate food_trucks policies with optimized auth calls
CREATE POLICY "Food truck owners can update their own trucks" 
  ON food_trucks FOR UPDATE 
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id)
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Food truck owners can create trucks" 
  ON food_trucks FOR INSERT 
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = owner_id);

CREATE POLICY "Food truck owners can delete their own trucks" 
  ON food_trucks FOR DELETE 
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

-- Optimized admin policy with subquery for better performance
CREATE POLICY "Admins can manage all trucks" 
  ON food_trucks FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.role = 'admin'
    )
  );


-- 4. Clean up duplicate/conflicting policies on food_trucks
-- =========================================================
-- Remove old policies that might be causing conflicts
DROP POLICY IF EXISTS "Enhanced admin access to food_trucks" ON food_trucks;
DROP POLICY IF EXISTS "Authenticated users can view food_trucks" ON food_trucks;
DROP POLICY IF EXISTS "Food trucks are publicly readable" ON food_trucks;

-- Create a single, comprehensive public read policy
CREATE POLICY "Public read access to food trucks" 
  ON food_trucks FOR SELECT 
  TO public
  USING (true);


-- 5. Add profile update policy with optimized auth call
-- ====================================================
DO $$
BEGIN
  -- Drop existing profile policies if they exist
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  
  -- Recreate with optimized auth calls
  CREATE POLICY "Users can view their own profile" 
    ON profiles FOR SELECT 
    TO authenticated
    USING ((SELECT auth.uid()) = id);
    
  CREATE POLICY "Users can update their own profile" 
    ON profiles FOR UPDATE 
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);
END $$;


-- ========================================
-- Performance Improvements
-- ========================================

-- Add indexes for better performance on auth-related queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_truck ON user_favorites(user_id, truck_id);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_food_trucks_owner_active ON food_trucks(owner_id, is_active) WHERE owner_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_food_trucks_verification_active ON food_trucks(verification_status, is_active);


-- ========================================
-- Security Enhancements
-- ========================================

-- Ensure RLS is enabled on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Add comments for documentation
COMMENT ON POLICY "Public read access to food trucks" ON food_trucks IS 'Allows public read access to all food trucks for discovery';
COMMENT ON POLICY "Admins can manage all trucks" ON food_trucks IS 'Allows admin users full CRUD access to all food trucks';
COMMENT ON POLICY "Food truck owners can update their own trucks" ON food_trucks IS 'Allows food truck owners to update only their own trucks';
COMMENT ON POLICY "Food truck owners can create trucks" ON food_trucks IS 'Allows food truck owners to create new trucks';
COMMENT ON POLICY "Food truck owners can delete their own trucks" ON food_trucks IS 'Allows food truck owners to delete only their own trucks';


-- ========================================
-- End of Fix Script
-- ========================================
-- 
-- This script addresses:
-- ✅ Security Definer View issue
-- ✅ Function search path vulnerabilities  
-- ✅ RLS performance optimizations
-- ✅ Multiple permissive policies cleanup
-- ✅ Added performance indexes
-- ✅ Enhanced security posture
-- 
-- Run this script and then verify with:
-- node scripts/test-database-schema.cjs
-- ========================================
