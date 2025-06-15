-- Migration: Enhance missing data fields for food trucks
-- Task 4.1.1-4.1.4: Add phone, website, hours, ratings support

-- Ensure contact_info JSONB column exists and has proper structure
DO $$
BEGIN
    -- Add contact_info column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'contact_info'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN contact_info JSONB DEFAULT '{}';
    END IF;
END $$;

-- Ensure operating_hours JSONB column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'operating_hours'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN operating_hours JSONB DEFAULT '{}';
    END IF;
END $$;

-- Ensure social_media JSONB column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'social_media'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN social_media JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add ratings and review fields
DO $$
BEGIN
    -- Add average_rating column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'average_rating'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN average_rating DECIMAL(3,2) CHECK (average_rating >= 0 AND average_rating <= 5);
    END IF;
    
    -- Add review_count column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'review_count'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN review_count INTEGER DEFAULT 0 CHECK (review_count >= 0);
    END IF;
    
    -- Add last_updated_at column for tracking data freshness
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'food_trucks'
        AND column_name = 'last_updated_at'
    ) THEN
        ALTER TABLE public.food_trucks ADD COLUMN last_updated_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_food_trucks_contact_info_phone ON public.food_trucks USING GIN ((contact_info->>'phone'));
CREATE INDEX IF NOT EXISTS idx_food_trucks_contact_info_website ON public.food_trucks USING GIN ((contact_info->>'website'));
CREATE INDEX IF NOT EXISTS idx_food_trucks_average_rating ON public.food_trucks (average_rating);
CREATE INDEX IF NOT EXISTS idx_food_trucks_review_count ON public.food_trucks (review_count);
CREATE INDEX IF NOT EXISTS idx_food_trucks_last_updated_at ON public.food_trucks (last_updated_at);

-- Update the data quality stats function to include new fields
CREATE OR REPLACE FUNCTION public.get_enhanced_data_quality_stats()
RETURNS TABLE (
    total_trucks bigint,
    avg_quality_score numeric,
    high_quality_count bigint,
    medium_quality_count bigint,
    low_quality_count bigint,
    verified_count bigint,
    pending_count bigint,
    flagged_count bigint,
    -- New enhanced metrics
    trucks_with_phone bigint,
    trucks_with_website bigint,
    trucks_with_hours bigint,
    trucks_with_ratings bigint,
    avg_rating numeric,
    total_reviews bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(ft.id) AS total_trucks,
        COALESCE(AVG(ft.data_quality_score), 0)::numeric AS avg_quality_score,
        COUNT(CASE WHEN ft.data_quality_score >= 0.8 THEN 1 ELSE NULL END) AS high_quality_count,
        COUNT(CASE WHEN ft.data_quality_score >= 0.6 AND ft.data_quality_score < 0.8 THEN 1 ELSE NULL END) AS medium_quality_count,
        COUNT(CASE WHEN ft.data_quality_score < 0.6 THEN 1 ELSE NULL END) AS low_quality_count,
        COUNT(CASE WHEN ft.verification_status = 'verified' THEN 1 ELSE NULL END) AS verified_count,
        COUNT(CASE WHEN ft.verification_status = 'pending' THEN 1 ELSE NULL END) AS pending_count,
        COUNT(CASE WHEN ft.verification_status = 'flagged' THEN 1 ELSE NULL END) AS flagged_count,
        -- Enhanced metrics
        COUNT(CASE WHEN ft.contact_info->>'phone' IS NOT NULL AND ft.contact_info->>'phone' != '' THEN 1 ELSE NULL END) AS trucks_with_phone,
        COUNT(CASE WHEN ft.contact_info->>'website' IS NOT NULL AND ft.contact_info->>'website' != '' THEN 1 ELSE NULL END) AS trucks_with_website,
        COUNT(CASE WHEN ft.operating_hours IS NOT NULL AND jsonb_typeof(ft.operating_hours) = 'object' AND ft.operating_hours != '{}' THEN 1 ELSE NULL END) AS trucks_with_hours,
        COUNT(CASE WHEN ft.average_rating IS NOT NULL AND ft.review_count > 0 THEN 1 ELSE NULL END) AS trucks_with_ratings,
        COALESCE(AVG(ft.average_rating), 0)::numeric AS avg_rating,
        COALESCE(SUM(ft.review_count), 0)::bigint AS total_reviews
    FROM
        public.food_trucks ft;
END;
$$;

-- Create a function to validate and normalize phone numbers
CREATE OR REPLACE FUNCTION public.normalize_phone_number(phone_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
    cleaned_phone text;
BEGIN
    -- Remove all non-digit characters
    cleaned_phone := regexp_replace(phone_input, '[^0-9]', '', 'g');
    
    -- Handle US phone numbers
    IF length(cleaned_phone) = 10 THEN
        -- Format as (XXX) XXX-XXXX
        RETURN '(' || substring(cleaned_phone, 1, 3) || ') ' || 
               substring(cleaned_phone, 4, 3) || '-' || 
               substring(cleaned_phone, 7, 4);
    ELSIF length(cleaned_phone) = 11 AND substring(cleaned_phone, 1, 1) = '1' THEN
        -- Remove leading 1 and format
        cleaned_phone := substring(cleaned_phone, 2);
        RETURN '(' || substring(cleaned_phone, 1, 3) || ') ' || 
               substring(cleaned_phone, 4, 3) || '-' || 
               substring(cleaned_phone, 7, 4);
    ELSE
        -- Return original if not standard US format
        RETURN phone_input;
    END IF;
END;
$$;

-- Create a function to validate website URLs
CREATE OR REPLACE FUNCTION public.validate_website_url(url_input text)
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
    -- Basic URL validation and normalization
    IF url_input IS NULL OR url_input = '' THEN
        RETURN NULL;
    END IF;
    
    -- Add https:// if no protocol specified
    IF url_input !~ '^https?://' THEN
        url_input := 'https://' || url_input;
    END IF;
    
    -- Basic URL format validation
    IF url_input ~ '^https?://[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' THEN
        RETURN url_input;
    ELSE
        RETURN NULL;
    END IF;
END;
$$;

-- Create trigger to automatically update last_updated_at
CREATE OR REPLACE FUNCTION public.update_food_truck_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.last_updated_at = now();
    
    -- Normalize phone number if provided
    IF NEW.contact_info->>'phone' IS NOT NULL AND NEW.contact_info->>'phone' != '' THEN
        NEW.contact_info = jsonb_set(
            NEW.contact_info,
            '{phone}',
            to_jsonb(normalize_phone_number(NEW.contact_info->>'phone'))
        );
    END IF;
    
    -- Validate and normalize website URL
    IF NEW.contact_info->>'website' IS NOT NULL AND NEW.contact_info->>'website' != '' THEN
        NEW.contact_info = jsonb_set(
            NEW.contact_info,
            '{website}',
            to_jsonb(validate_website_url(NEW.contact_info->>'website'))
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_food_truck_timestamp ON public.food_trucks;
CREATE TRIGGER trigger_update_food_truck_timestamp
    BEFORE UPDATE ON public.food_trucks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_food_truck_timestamp();

-- Add comments for documentation
COMMENT ON COLUMN public.food_trucks.contact_info IS 'JSONB field containing phone, email, website contact information';
COMMENT ON COLUMN public.food_trucks.operating_hours IS 'JSONB field containing daily operating hours with open/close times';
COMMENT ON COLUMN public.food_trucks.social_media IS 'JSONB field containing social media handles and URLs';
COMMENT ON COLUMN public.food_trucks.average_rating IS 'Average customer rating (0-5 scale)';
COMMENT ON COLUMN public.food_trucks.review_count IS 'Total number of customer reviews';
COMMENT ON COLUMN public.food_trucks.last_updated_at IS 'Timestamp of last data update for freshness tracking';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_enhanced_data_quality_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.normalize_phone_number(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_website_url(text) TO authenticated;
