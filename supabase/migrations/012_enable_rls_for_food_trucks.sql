-- Enable Row Level Security (RLS) on the food_trucks table
ALTER TABLE public.food_trucks ENABLE ROW LEVEL SECURITY;

-- Grant usage on the schema to anon and authenticated roles if not already granted.
-- This is often handled at a higher level, but included for completeness.
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant SELECT permission to anon and authenticated roles for the food_trucks table.
-- RLS policies will further define what rows they can access.
GRANT SELECT ON TABLE public.food_trucks TO anon;
GRANT SELECT ON TABLE public.food_trucks TO authenticated;

-- Grant all permissions to service_role for the food_trucks table.
-- RLS policies will apply, but service_role often bypasses RLS or has specific policies.
GRANT ALL ON TABLE public.food_trucks TO service_role;


-- Policies for RLS

-- 1. Allow public read access to food trucks
-- This policy allows anyone (anonymous and authenticated users) to read all data from the food_trucks table.
CREATE POLICY "Allow public read access to food trucks"
ON public.food_trucks
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. Allow service_role full access to food trucks
-- This policy ensures that the service_role (typically used by backend processes)
-- has unrestricted access to insert, select, update, and delete data.
-- While service_role often bypasses RLS by default, explicit policies are clearer and safer.
CREATE POLICY "Allow service_role full access to food trucks"
ON public.food_trucks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Note: No explicit policies are defined for client-side write operations by 'anon' or 'authenticated' users.
-- This means, by default, they will not be able to insert, update, or delete data on the 'food_trucks' table
-- unless they assume a role with such privileges (like 'service_role' on the backend).
-- This aligns with the current architecture where data ingestion is handled by backend processes.

-- Add comments to policies for clarity
COMMENT ON POLICY "Allow public read access to food trucks" ON public.food_trucks IS 'Allows anonymous and authenticated users to read all food truck entries.';
COMMENT ON POLICY "Allow service_role full access to food trucks" ON public.food_trucks IS 'Allows the service_role to perform any operation on the food_trucks table, bypassing RLS row restrictions if any were applied to it for other roles.';

-- Notify Supabase of schema changes
NOTIFY pgrst, 'reload schema';
