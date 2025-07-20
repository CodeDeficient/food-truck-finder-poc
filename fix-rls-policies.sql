-- Fix RLS policies to allow anonymous read access to food_trucks table
-- This allows the app to display food trucks to unauthenticated users

-- Add policy for anonymous users to read food_trucks
DROP POLICY IF EXISTS "Public users can view food_trucks" ON public.food_trucks;
CREATE POLICY "Public users can view food_trucks" 
ON public.food_trucks 
FOR SELECT 
TO anon 
USING (
    -- Allow reading all food trucks (simplified policy)
    verification_status IN ('verified', 'pending')
);

-- Also add policy for authenticated users to read food_trucks (if not admin)
DROP POLICY IF EXISTS "Authenticated users can view food_trucks" ON public.food_trucks;
CREATE POLICY "Authenticated users can view food_trucks" 
ON public.food_trucks 
FOR SELECT 
TO authenticated 
USING (
    -- Allow reading all food trucks (simplified policy)
    verification_status IN ('verified', 'pending')
);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'food_trucks' 
ORDER BY policyname;

-- Show current RLS status for food_trucks table
SELECT schemaname, tablename, rowsecurity, relforcerowsecurity 
FROM pg_tables t
JOIN pg_class c ON t.tablename = c.relname
WHERE t.tablename = 'food_trucks' AND t.schemaname = 'public';
