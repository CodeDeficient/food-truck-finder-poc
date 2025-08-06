-- Migration: Add missing columns to profiles table
-- Description: Add phone, location, and avatar_url columns for enhanced user profiles

-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Update RLS policies to ensure users can create their own profiles
-- Allow users to insert their own profile
CREATE POLICY "Users can create their own profile" ON profiles
  FOR INSERT 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow admins to view and manage all profiles  
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles admin_profiles
      WHERE admin_profiles.id = auth.uid() 
      AND admin_profiles.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN profiles.phone IS 'User phone number (optional)';
COMMENT ON COLUMN profiles.location IS 'User location (optional)';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image (optional)';
