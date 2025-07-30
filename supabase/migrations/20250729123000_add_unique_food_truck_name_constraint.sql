-- Migration: Add unique constraint to food truck names
-- Description: Add a unique constraint on the name column in food_trucks table to prevent duplicate entries

-- First, let's clean up any existing duplicates before adding the constraint
-- This will keep the most recently updated truck and remove older duplicates
DELETE FROM food_trucks a
WHERE a.ctid < (
    SELECT max(b.ctid)
    FROM food_trucks b
    WHERE a.name = b.name
);

-- Add unique constraint on name column
ALTER TABLE food_trucks
ADD CONSTRAINT unique_food_truck_name UNIQUE (name);

-- Create an index to support the unique constraint and improve query performance
CREATE INDEX IF NOT EXISTS idx_food_trucks_name ON food_trucks (name);

-- Add comment to document the constraint
COMMENT ON CONSTRAINT unique_food_truck_name ON food_trucks 
IS 'Ensures food truck names are unique to prevent duplicate entries';

-- Update the updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_food_trucks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or update the trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_food_trucks_updated_at'
  ) THEN
    CREATE TRIGGER update_food_trucks_updated_at
      BEFORE UPDATE ON food_trucks
      FOR EACH ROW EXECUTE FUNCTION update_food_trucks_updated_at();
  END IF;
END
$$;
