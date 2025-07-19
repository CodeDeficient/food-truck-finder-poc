-- ============================================================================
-- MANUAL MIGRATION SCRIPT
-- Execute this script in the Supabase SQL Editor to resolve migration issues.
-- ============================================================================

-- From: 010_enable_pg_trgm.sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- From: 011_enhance_missing_data_fields.sql (with corrections)
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
CREATE INDEX IF NOT EXISTS idx_food_trucks_contact_info_phone ON public.food_trucks USING GIN ((contact_info->>'phone') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_food_trucks_contact_info_website ON public.food_trucks USING GIN ((contact_info->>'website') gin_trgm_ops);
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


-- From: 20250609161000_add_security_events_table.sql
CREATE TABLE IF NOT EXISTS public.security_events (
    id bigint NOT NULL GENERATED BY DEFAULT AS IDENTITY,
    event_type text,
    user_id uuid,
    user_email text,
    ip_address text,
    user_agent text,
    details jsonb,
    severity text DEFAULT 'info'::text,
    "timestamp" timestamp with time zone DEFAULT now(),
    CONSTRAINT security_events_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE public.security_events IS 'Logs security-related events for auditing and monitoring.';


-- From: 012_comprehensive_security_hardening.sql
-- Create private schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

-- SECURITY DEFINER HELPER FUNCTIONS
CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE id = (SELECT auth.uid()) 
        AND role = 'admin'
    );
END;
$$;

CREATE OR REPLACE FUNCTION private.get_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM public.profiles 
        WHERE id = (SELECT auth.uid())
    );
END;
$$;

CREATE OR REPLACE FUNCTION private.has_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role text;
BEGIN
    -- Cache the user role lookup for performance
    SELECT (SELECT private.get_user_role()) INTO user_role;
    RETURN user_role = 'admin';
END;
$$;

-- ENHANCED RLS POLICIES
DROP POLICY IF EXISTS "Enhanced admin access to food_trucks" ON public.food_trucks;
CREATE POLICY "Enhanced admin access to food_trucks" 
ON public.food_trucks 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

DROP POLICY IF EXISTS "Enhanced users can view own profile" ON public.profiles;
CREATE POLICY "Enhanced users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING ((SELECT auth.uid()) = id OR (SELECT private.is_admin()) = true);

DROP POLICY IF EXISTS "Enhanced users can update own profile" ON public.profiles;
CREATE POLICY "Enhanced users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Enhanced admin access to scraping_jobs" ON public.scraping_jobs;
CREATE POLICY "Enhanced admin access to scraping_jobs" 
ON public.scraping_jobs 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

DROP POLICY IF EXISTS "Enhanced admin access to data_processing_queue" ON public.data_processing_queue;
CREATE POLICY "Enhanced admin access to data_processing_queue" 
ON public.data_processing_queue 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

DROP POLICY IF EXISTS "Enhanced admin access to api_usage" ON public.api_usage;
CREATE POLICY "Enhanced admin access to api_usage" 
ON public.api_usage 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

DROP POLICY IF EXISTS "Enhanced admin access to security_events" ON public.security_events;
CREATE POLICY "Enhanced admin access to security_events" 
ON public.security_events 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- FUNCTION SECURITY HARDENING
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.get_data_quality_stats() SET search_path = '';
ALTER FUNCTION public.get_enhanced_data_quality_stats() SET search_path = '';
ALTER FUNCTION public.update_discovered_urls_updated_at() SET search_path = '';
ALTER FUNCTION public.update_food_truck_timestamp() SET search_path = '';
ALTER FUNCTION public.normalize_phone_number(text) SET search_path = '';
ALTER FUNCTION public.validate_website_url(text) SET search_path = '';

-- ENHANCED SECURITY MONITORING FUNCTIONS
CREATE OR REPLACE FUNCTION private.log_security_event(
    event_type text,
    user_id uuid DEFAULT NULL,
    user_email text DEFAULT NULL,
    ip_address text DEFAULT NULL,
    user_agent text DEFAULT NULL,
    details jsonb DEFAULT NULL,
    severity text DEFAULT 'info'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.security_events (
        event_type,
        user_id,
        user_email,
        ip_address,
        user_agent,
        details,
        severity,
        timestamp
    ) VALUES (
        event_type,
        COALESCE(user_id, (SELECT auth.uid())),
        user_email,
        ip_address,
        user_agent,
        details,
        severity,
        now()
    );
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to log security event: %', SQLERRM;
END;
$$;

CREATE OR REPLACE FUNCTION private.detect_suspicious_activity(
    check_user_id uuid DEFAULT NULL,
    time_window_minutes integer DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    failed_attempts integer;
    user_to_check uuid;
BEGIN
    user_to_check := COALESCE(check_user_id, (SELECT auth.uid()));
    
    SELECT COUNT(*)
    INTO failed_attempts
    FROM public.security_events
    WHERE user_id = user_to_check
    AND event_type IN ('login_failed', 'permission_denied')
    AND timestamp > (now() - (time_window_minutes || ' minutes')::interval);
    
    RETURN failed_attempts >= 5;
END;
$$;

-- PERFORMANCE INDEXES FOR SECURITY
CREATE INDEX IF NOT EXISTS idx_security_events_user_id_timestamp 
ON public.security_events(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type_timestamp 
ON public.security_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_severity_timestamp 
ON public.security_events(severity, timestamp DESC) 
WHERE severity IN ('error', 'critical');

CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role) 
WHERE role = 'admin';

CREATE INDEX IF NOT EXISTS idx_profiles_id_role 
ON public.profiles(id, role);

-- AUDIT TRIGGER FUNCTIONS
CREATE OR REPLACE FUNCTION private.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    PERFORM private.log_security_event(
        'table_modification',
        (SELECT auth.uid()),
        NULL,
        NULL,
        NULL,
        jsonb_build_object(
            'table_name', TG_TABLE_NAME,
            'operation', TG_OP,
            'old_data', CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
            'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
        ),
        'info'
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION private.audit_table_changes();

DROP TRIGGER IF EXISTS audit_food_trucks_changes ON public.food_trucks;
CREATE TRIGGER audit_food_trucks_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.food_trucks
    FOR EACH ROW EXECUTE FUNCTION private.audit_table_changes();

-- GRANT PERMISSIONS
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION private.detect_suspicious_activity(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION private.log_security_event(text, uuid, text, text, text, jsonb, text) TO service_role;

-- From: 20250719114300_add_foreign_key_indexes.sql
CREATE INDEX IF NOT EXISTS idx_data_processing_queue_truck_id ON public.data_processing_queue(truck_id);
CREATE INDEX IF NOT EXISTS idx_events_food_truck_id ON public.events(food_truck_id);
CREATE INDEX IF NOT EXISTS idx_food_truck_schedules_food_truck_id ON public.food_truck_schedules(food_truck_id);
