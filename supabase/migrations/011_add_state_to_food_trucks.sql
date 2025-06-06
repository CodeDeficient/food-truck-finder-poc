-- Add state column to food_trucks table
ALTER TABLE public.food_trucks
ADD COLUMN state TEXT;

-- Add an index on the new state column
CREATE INDEX idx_food_trucks_state ON public.food_trucks(state);

-- Add a comment to the new column
COMMENT ON COLUMN public.food_trucks.state IS 'Two-letter state abbreviation, e.g., SC, NC. Extracted from location data during processing.';

-- Optional: Backfill existing records if possible and a default is desired.
-- For example, if all existing trucks are known to be in 'SC':
-- UPDATE public.food_trucks SET state = 'SC' WHERE state IS NULL;
-- This is commented out as it depends on specific data conditions.

-- Notify Supabase of schema changes
NOTIFY pgrst, 'reload schema';
