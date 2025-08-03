-- Migration: Add owner_id column to food_trucks table
-- Description: Add owner_id column to link food trucks to their owners (food_truck_owner role users)

-- Add owner_id column to food_trucks table
ALTER TABLE food_trucks 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance when querying trucks by owner
CREATE INDEX IF NOT EXISTS idx_food_trucks_owner_id ON food_trucks(owner_id);

-- Add RLS policy to allow food truck owners to manage their own trucks
-- First, ensure RLS is enabled on food_trucks table
ALTER TABLE food_trucks ENABLE ROW LEVEL SECURITY;

-- Allow food truck owners to view their own trucks
CREATE POLICY "Food truck owners can view their own trucks" 
  ON food_trucks FOR SELECT 
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    -- Allow public access for general browsing
    true
  );

-- Allow food truck owners to update their own trucks
CREATE POLICY "Food truck owners can update their own trucks" 
  ON food_trucks FOR UPDATE 
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Allow food truck owners to insert new trucks (with themselves as owner)
CREATE POLICY "Food truck owners can create trucks" 
  ON food_trucks FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow food truck owners to delete their own trucks
CREATE POLICY "Food truck owners can delete their own trucks" 
  ON food_trucks FOR DELETE 
  TO authenticated
  USING (auth.uid() = owner_id);

-- Allow admins to manage all trucks (assuming admin role exists in profiles)
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

-- Add comment to document the new column
COMMENT ON COLUMN food_trucks.owner_id IS 'Reference to the user who owns this food truck (food_truck_owner role)';
