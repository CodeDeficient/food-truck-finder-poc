-- Dashboard Dependencies Migration
-- Run this in Supabase SQL Editor to fix empty dashboard screens

-- ============================================================================
-- 1. Add owner_id column to food_trucks table (for Owner Dashboard)
-- ============================================================================

-- Check if owner_id column exists, add if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'food_trucks' 
        AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE food_trucks 
        ADD COLUMN owner_id UUID REFERENCES auth.users(id);
        
        RAISE NOTICE 'Added owner_id column to food_trucks table';
    ELSE
        RAISE NOTICE 'owner_id column already exists in food_trucks table';
    END IF;
END $$;

-- ============================================================================
-- 2. Create user_favorites table (for User Dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    truck_id UUID REFERENCES food_trucks(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, truck_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_truck_id ON user_favorites(truck_id);

-- ============================================================================
-- 3. Create favorite_trucks view (for User Dashboard queries)
-- ============================================================================

CREATE OR REPLACE VIEW favorite_trucks AS
SELECT 
    f.id,
    f.user_id,
    f.created_at as favorited_at,
    ft.id as truck_id,
    ft.name,
    ft.cuisine_type,
    ft.current_location,
    ft.average_rating,
    ft.review_count,
    ft.verification_status
FROM user_favorites f
JOIN food_trucks ft ON f.truck_id = ft.id;

-- Grant access to the view
GRANT SELECT ON favorite_trucks TO authenticated;

-- ============================================================================
-- 4. Create sample test data for development
-- ============================================================================

-- Create a test food truck owner profile
INSERT INTO profiles (id, role, full_name, email, created_at, updated_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440000', 
    'food_truck_owner', 
    'Test Owner', 
    'owner@test.com',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Create a test customer profile  
INSERT INTO profiles (id, role, full_name, email, created_at, updated_at) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001', 
    'customer', 
    'Test Customer', 
    'customer@test.com',
    NOW(), 
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Assign some existing trucks to the test owner
UPDATE food_trucks 
SET owner_id = '550e8400-e29b-41d4-a716-446655440000'
WHERE id IN (
    SELECT id 
    FROM food_trucks 
    WHERE owner_id IS NULL
    LIMIT 3
);

-- Add some favorite trucks for the test customer
INSERT INTO user_favorites (user_id, truck_id)
SELECT 
    '550e8400-e29b-41d4-a716-446655440001',
    id
FROM food_trucks 
LIMIT 2
ON CONFLICT (user_id, truck_id) DO NOTHING;

-- ============================================================================
-- 5. Add RLS (Row Level Security) policies
-- ============================================================================

-- Enable RLS on user_favorites table
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own favorites
CREATE POLICY "Users can view own favorites" ON user_favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can add their own favorites
CREATE POLICY "Users can insert own favorites" ON user_favorites  
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own favorites
CREATE POLICY "Users can delete own favorites" ON user_favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Policy: Food truck owners can only see their own trucks
CREATE POLICY "Owners can view own trucks" ON food_trucks
    FOR SELECT USING (
        owner_id IS NULL OR 
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'customer')
        )
    );

-- ============================================================================
-- 6. Create helper functions for dashboard queries
-- ============================================================================

-- Function to get owner's truck statistics
CREATE OR REPLACE FUNCTION get_owner_truck_stats(owner_user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_trucks', COUNT(*),
        'verified_trucks', COUNT(*) FILTER (WHERE verification_status = 'verified'),
        'avg_rating', ROUND(AVG(average_rating), 2),
        'total_reviews', SUM(review_count)
    )
    INTO result
    FROM food_trucks 
    WHERE owner_id = owner_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_owner_truck_stats(UUID) TO authenticated;

-- ============================================================================
-- 7. Verify the migration
-- ============================================================================

-- Check that tables and views exist
DO $$
DECLARE
    tables_count INTEGER;
    views_count INTEGER;
BEGIN
    -- Check tables
    SELECT COUNT(*) INTO tables_count
    FROM information_schema.tables 
    WHERE table_name IN ('user_favorites');
    
    -- Check views  
    SELECT COUNT(*) INTO views_count
    FROM information_schema.views
    WHERE table_name = 'favorite_trucks';
    
    RAISE NOTICE 'Migration verification:';
    RAISE NOTICE '- Tables created: %', tables_count;
    RAISE NOTICE '- Views created: %', views_count;
    
    -- Check if owner_id column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_trucks' AND column_name = 'owner_id'
    ) THEN
        RAISE NOTICE '- owner_id column: EXISTS';
    ELSE  
        RAISE NOTICE '- owner_id column: MISSING!';
    END IF;
    
    -- Check sample data
    RAISE NOTICE '- Sample trucks assigned to owner: %', (
        SELECT COUNT(*) FROM food_trucks WHERE owner_id IS NOT NULL
    );
    
    RAISE NOTICE '- Sample user favorites: %', (
        SELECT COUNT(*) FROM user_favorites
    );
    
    RAISE NOTICE 'Dashboard dependencies migration completed successfully!';
END $$;
