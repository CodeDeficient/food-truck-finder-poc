-- Enable RLS for scraper_configs table
ALTER TABLE public.scraper_configs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow read access to authenticated users
-- This policy allows any user who is logged in to read the scraper configurations.
CREATE POLICY "Allow authenticated read access"
ON public.scraper_configs
FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow all operations for service_role
-- The service_role is a privileged role in Supabase, often used for administrative tasks or backend processes.
-- This policy grants full access to this role.
CREATE POLICY "Allow full access for service_role"
ON public.scraper_configs
FOR ALL
TO service_role
USING (true);

-- Policy 3 (Optional): Allow specific users to manage configurations
-- If you have specific users (e.g., administrators) who should be able to insert, update, or delete
-- scraper configurations, you can create policies for them.
-- Replace 'user_id_1', 'user_id_2' with the actual user IDs.
--
-- CREATE POLICY "Allow admin users to manage configurations"
-- ON public.scraper_configs
-- FOR ALL
-- TO authenticated
-- USING (auth.uid() IN ('user_id_1', 'user_id_2'))
-- WITH CHECK (auth.uid() IN ('user_id_1', 'user_id_2'));

-- Example: Grant insert, update, delete to a specific admin user identified by their UID
-- Make sure to replace 'your-admin-user-id' with the actual UID of the admin user.
-- CREATE POLICY "Allow specific admin to manage configurations"
-- ON public.scraper_configs
-- FOR ALL
-- USING (auth.uid() = 'your-admin-user-id')
-- WITH CHECK (auth.uid() = 'your-admin-user-id');

-- IMPORTANT: After applying these policies, test your application thoroughly
-- to ensure that data access works as expected for different user roles.
-- Adjust these policies based on your specific application requirements.
