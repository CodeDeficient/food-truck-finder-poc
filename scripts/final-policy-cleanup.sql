-- ========================================
-- Final Policy Cleanup Script
-- Removes remaining duplicate policies flagged by Supabase advisor
-- ========================================

-- 1. Clean up duplicate food_trucks policies
-- ==========================================

-- Remove old/duplicate policies that are causing conflicts
DROP POLICY IF EXISTS "Public users can view food_trucks" ON food_trucks;
DROP POLICY IF EXISTS "Enhanced admin access to food_trucks" ON food_trucks;
DROP POLICY IF EXISTS "Authenticated users can view food_trucks" ON food_trucks;

-- Ensure we have clean, non-overlapping policies for food_trucks
-- The admin policy should handle all authenticated operations
-- The public policy should handle anonymous read access


-- 2. Clean up duplicate profiles policies
-- =======================================

-- Remove old/duplicate policies
DROP POLICY IF EXISTS "Enhanced users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enhanced users can update own profile" ON profiles;

-- Our current policies should be sufficient:
-- "Users can view their own profile"
-- "Users can update their own profile"


-- 3. Verify our current policy structure is optimal
-- =================================================

-- List current policies for verification (informational only)
-- You can run these separately to see what policies remain:

-- SELECT schemaname, tablename, policyname, roles, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('food_trucks', 'profiles', 'user_favorites')
-- ORDER BY tablename, cmd, policyname;


-- ========================================
-- Summary of Expected Final Policy Structure:
-- ========================================
--
-- food_trucks table should have:
-- - "Public read access to food trucks" (anon + authenticated SELECT)
-- - "Admins can manage all trucks" (authenticated ALL)
-- - "Food truck owners can update their own trucks" (authenticated UPDATE)
-- - "Food truck owners can create trucks" (authenticated INSERT)
-- - "Food truck owners can delete their own trucks" (authenticated DELETE)
--
-- profiles table should have:
-- - "Users can view their own profile" (authenticated SELECT)
-- - "Users can update their own profile" (authenticated UPDATE)
--
-- user_favorites table should have:
-- - "Users can view their own favorites" (authenticated SELECT)
-- - "Users can create their own favorites" (authenticated INSERT)
-- - "Users can delete their own favorites" (authenticated DELETE)
--
-- ========================================
