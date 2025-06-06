-- Enable RLS for relevant tables
ALTER TABLE public.scraper_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_truck_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Create default RLS policies (allow read for anon/authenticated, restrict write to service_role or specific roles)
-- scraper_configs: Assuming only service_role should write, all can read
DROP POLICY IF EXISTS "Allow public read access to scraper_configs" ON public.scraper_configs;
CREATE POLICY "Allow public read access to scraper_configs" ON public.scraper_configs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow service_role to manage scraper_configs" ON public.scraper_configs;
CREATE POLICY "Allow service_role to manage scraper_configs" ON public.scraper_configs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- events: Assuming authenticated users can create, all can read, owners/admins can modify/delete
DROP POLICY IF EXISTS "Allow public read access to events" ON public.events;
CREATE POLICY "Allow public read access to events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to create events" ON public.events;
CREATE POLICY "Allow authenticated users to create events" ON public.events FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owners to manage their events" ON public.events;
CREATE POLICY "Allow owners to manage their events" ON public.events FOR ALL USING (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)); -- Requires a user_id column in food_trucks linked to auth.users
DROP POLICY IF EXISTS "Allow admins to manage all events" ON public.events;
CREATE POLICY "Allow admins to manage all events" ON public.events FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- food_truck_schedules: Similar to events
DROP POLICY IF EXISTS "Allow public read access to food_truck_schedules" ON public.food_truck_schedules;
CREATE POLICY "Allow public read access to food_truck_schedules" ON public.food_truck_schedules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to create schedules" ON public.food_truck_schedules;
CREATE POLICY "Allow authenticated users to create schedules" ON public.food_truck_schedules FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owners to manage their schedules" ON public.food_truck_schedules;
CREATE POLICY "Allow owners to manage their schedules" ON public.food_truck_schedules FOR ALL USING (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)); -- Requires a user_id column in food_trucks
DROP POLICY IF EXISTS "Allow admins to manage all schedules" ON public.food_truck_schedules;
CREATE POLICY "Allow admins to manage all schedules" ON public.food_truck_schedules FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- menu_items: Similar to events/schedules
DROP POLICY IF EXISTS "Allow public read access to menu_items" ON public.menu_items;
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow authenticated users to create menu_items" ON public.menu_items;
CREATE POLICY "Allow authenticated users to create menu_items" ON public.menu_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow owners to manage their menu_items" ON public.menu_items;
CREATE POLICY "Allow owners to manage their menu_items" ON public.menu_items FOR ALL USING (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)) WITH CHECK (auth.uid() = (SELECT user_id FROM food_trucks WHERE id = food_truck_id)); -- Requires a user_id column in food_trucks
DROP POLICY IF EXISTS "Allow admins to manage all menu_items" ON public.menu_items;
CREATE POLICY "Allow admins to manage all menu_items" ON public.menu_items FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));


-- Set search_path for functions to mitigate mutable search path warnings
-- Note: This assumes the functions exist. If not, these ALTER statements will fail.
-- It's generally better to define this at function creation.

-- For handle_new_user (assuming it's a trigger function or similar)
-- The specific search path depends on what the function needs access to.
-- A common secure default is 'public'.
-- If this function is auto-created by Supabase Auth, it might be managed differently.
-- Check Supabase docs for `handle_new_user` if it's an internal auth trigger.
-- For now, providing a template, adjust as needed.
-- ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- For get_trucks_near_location
ALTER FUNCTION public.get_trucks_near_location(user_lat double precision, user_lng double precision, radius_km double precision) SET search_path = public;
-- If there's an overloaded version without radius_km:
-- ALTER FUNCTION public.get_trucks_near_location(user_lat double precision, user_lng double precision) SET search_path = public;


-- For update_api_usage
ALTER FUNCTION public.update_api_usage(p_service_name text, p_requests integer, p_tokens integer) SET search_path = public;
-- If there's an overloaded version with different parameter names:
-- ALTER FUNCTION public.update_api_usage(service text, requests integer, tokens integer) SET search_path = public;

-- Add user_id column to food_trucks table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN user_id UUID REFERENCES auth.users(id);
        CREATE INDEX IF NOT EXISTS idx_food_trucks_user_id ON public.food_trucks(user_id);
    END IF;
END $$;

-- IMPORTANT NOTE for user_id in food_trucks for RLS policies:
-- The RLS policies for events, food_truck_schedules, and menu_items assume
-- that the `food_trucks` table has a `user_id` column which is a foreign key
-- to `auth.users.id`. This script attempts to add it if missing.
-- Ensure this user_id is set when food trucks are created/updated.
