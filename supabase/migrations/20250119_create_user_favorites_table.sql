-- Migration: Create user_favorites table
-- Description: Add a table to store user favorite food trucks with RLS policies

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  truck_id UUID NOT NULL REFERENCES food_trucks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, truck_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_truck_id ON user_favorites(truck_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own favorites
CREATE POLICY "Users can view their own favorites" 
  ON user_favorites FOR SELECT 
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only insert their own favorites
CREATE POLICY "Users can create their own favorites" 
  ON user_favorites FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own favorites
CREATE POLICY "Users can delete their own favorites" 
  ON user_favorites FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_favorites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_favorites_updated_at
  BEFORE UPDATE ON user_favorites
  FOR EACH ROW EXECUTE FUNCTION update_user_favorites_updated_at();

-- Comment on table and columns
COMMENT ON TABLE user_favorites IS 'Stores user favorite food trucks';
COMMENT ON COLUMN user_favorites.user_id IS 'Reference to the user who favorited the truck';
COMMENT ON COLUMN user_favorites.truck_id IS 'Reference to the favorited food truck';
COMMENT ON COLUMN user_favorites.created_at IS 'When the favorite was added';
COMMENT ON COLUMN user_favorites.updated_at IS 'When the favorite was last updated';
