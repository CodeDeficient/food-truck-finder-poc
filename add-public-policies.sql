-- Add RLS policies to allow public read access to food_trucks table
-- This will allow anonymous users to view food trucks in your app

-- Policy for anonymous users to read food_trucks
CREATE POLICY "Public users can view food_trucks" 
ON public.food_trucks 
FOR SELECT 
TO anon 
USING (
    verification_status IN ('verified', 'pending')
);

-- Policy for authenticated (non-admin) users to read food_trucks
CREATE POLICY "Authenticated users can view food_trucks" 
ON public.food_trucks 
FOR SELECT 
TO authenticated 
USING (
    verification_status IN ('verified', 'pending')
);
