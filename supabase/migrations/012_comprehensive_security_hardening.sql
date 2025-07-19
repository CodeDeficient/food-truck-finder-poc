-- ============================================================================
-- COMPREHENSIVE SECURITY HARDENING MIGRATION
-- Implements SOTA security practices for production-ready database security
-- ============================================================================

-- Create private schema for security definer functions
CREATE SCHEMA IF NOT EXISTS private;

-- ============================================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ============================================================================

-- Optimized admin role checking function (security definer to bypass RLS)
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

-- Optimized user role checking function
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

-- Enhanced admin access checking with caching optimization
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

-- ============================================================================
-- ENHANCED RLS POLICIES WITH PERFORMANCE OPTIMIZATIONS
-- ============================================================================

-- Food trucks table - Enhanced RLS with performance optimizations
DROP POLICY IF EXISTS "Enhanced admin access to food_trucks" ON public.food_trucks;
CREATE POLICY "Enhanced admin access to food_trucks" 
ON public.food_trucks 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- Profiles table - Enhanced RLS
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

-- Scraping jobs table - Admin only access with performance optimization
DROP POLICY IF EXISTS "Enhanced admin access to scraping_jobs" ON public.scraping_jobs;
CREATE POLICY "Enhanced admin access to scraping_jobs" 
ON public.scraping_jobs 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- Data processing queue - Admin only access
DROP POLICY IF EXISTS "Enhanced admin access to data_processing_queue" ON public.data_processing_queue;
CREATE POLICY "Enhanced admin access to data_processing_queue" 
ON public.data_processing_queue 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- API usage table - Admin only access
DROP POLICY IF EXISTS "Enhanced admin access to api_usage" ON public.api_usage;
CREATE POLICY "Enhanced admin access to api_usage" 
ON public.api_usage 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- Security events table - Admin only access
DROP POLICY IF EXISTS "Enhanced admin access to security_events" ON public.security_events;
CREATE POLICY "Enhanced admin access to security_events" 
ON public.security_events 
FOR ALL 
TO authenticated 
USING ((SELECT private.is_admin()) = true)
WITH CHECK ((SELECT private.is_admin()) = true);

-- ============================================================================
-- FUNCTION SECURITY HARDENING
-- ============================================================================

-- Fix remaining function search path issues
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.get_data_quality_stats() SET search_path = '';
ALTER FUNCTION public.get_enhanced_data_quality_stats() SET search_path = '';
ALTER FUNCTION public.update_discovered_urls_updated_at() SET search_path = '';
ALTER FUNCTION public.update_food_truck_timestamp() SET search_path = '';
ALTER FUNCTION public.normalize_phone_number(text) SET search_path = '';
ALTER FUNCTION public.validate_website_url(text) SET search_path = '';

-- ============================================================================
-- ENHANCED SECURITY MONITORING FUNCTIONS
-- ============================================================================

-- Function to log security events with enhanced details
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
        -- Don't fail the main operation if logging fails
        RAISE WARNING 'Failed to log security event: %', SQLERRM;
END;
$$;

-- Function to check for suspicious activity patterns
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
    
    -- Count failed login attempts in the time window
    SELECT COUNT(*)
    INTO failed_attempts
    FROM public.security_events
    WHERE user_id = user_to_check
    AND event_type IN ('login_failed', 'permission_denied')
    AND timestamp > (now() - (time_window_minutes || ' minutes')::interval);
    
    -- Return true if suspicious activity detected
    RETURN failed_attempts >= 5;
END;
$$;

-- ============================================================================
-- PERFORMANCE INDEXES FOR SECURITY
-- ============================================================================

-- Indexes for security events table
CREATE INDEX IF NOT EXISTS idx_security_events_user_id_timestamp 
ON public.security_events(user_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type_timestamp 
ON public.security_events(event_type, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_severity_timestamp 
ON public.security_events(severity, timestamp DESC) 
WHERE severity IN ('error', 'critical');

-- Indexes for profiles table (role-based access)
CREATE INDEX IF NOT EXISTS idx_profiles_role 
ON public.profiles(role) 
WHERE role = 'admin';

-- Indexes for auth-related queries
CREATE INDEX IF NOT EXISTS idx_profiles_id_role 
ON public.profiles(id, role);

-- ============================================================================
-- AUDIT TRIGGER FUNCTIONS
-- ============================================================================

-- Enhanced audit trigger for sensitive table changes
CREATE OR REPLACE FUNCTION private.audit_table_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Log all changes to sensitive tables
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

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_profiles_changes ON public.profiles;
CREATE TRIGGER audit_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION private.audit_table_changes();

DROP TRIGGER IF EXISTS audit_food_trucks_changes ON public.food_trucks;
CREATE TRIGGER audit_food_trucks_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.food_trucks
    FOR EACH ROW EXECUTE FUNCTION private.audit_table_changes();

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on security functions to authenticated users
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_admin_access() TO authenticated;
GRANT EXECUTE ON FUNCTION private.detect_suspicious_activity(uuid, integer) TO authenticated;

-- Grant execute permissions on logging functions to service role
GRANT EXECUTE ON FUNCTION private.log_security_event(text, uuid, text, text, text, jsonb, text) TO service_role;

-- ============================================================================
-- SECURITY VALIDATION
-- ============================================================================

-- Function to validate security configuration
CREATE OR REPLACE FUNCTION private.validate_security_config()
RETURNS TABLE (
    check_name text,
    status text,
    details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Check if RLS is enabled on critical tables
    RETURN QUERY
    SELECT 
        'RLS_ENABLED_' || t.table_name::text,
        CASE WHEN t.row_security = 'YES' THEN 'PASS' ELSE 'FAIL' END,
        'Row Level Security status for ' || t.table_name::text
    FROM information_schema.tables t
    WHERE t.table_schema = 'public'
    AND t.table_name IN ('food_trucks', 'profiles', 'scraping_jobs', 'security_events')
    AND t.table_type = 'BASE TABLE';
    
    -- Check if admin user exists
    RETURN QUERY
    SELECT 
        'ADMIN_USER_EXISTS',
        CASE WHEN EXISTS(SELECT 1 FROM public.profiles WHERE role = 'admin') 
             THEN 'PASS' ELSE 'FAIL' END,
        'Admin user configuration status';
    
    -- Check if security functions exist
    RETURN QUERY
    SELECT 
        'SECURITY_FUNCTIONS_EXIST',
        CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'is_admin' AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'private'))
             THEN 'PASS' ELSE 'FAIL' END,
        'Security helper functions status';
END;
$$;

-- Grant execute permission for security validation
GRANT EXECUTE ON FUNCTION private.validate_security_config() TO authenticated;

-- ============================================================================
-- COMPLETION LOG
-- ============================================================================

-- Log the completion of security hardening
DO $$
BEGIN
    RAISE NOTICE 'Comprehensive Security Hardening Migration Completed Successfully';
    RAISE NOTICE 'Features implemented:';
    RAISE NOTICE '- Enhanced RLS policies with performance optimizations';
    RAISE NOTICE '- Security definer helper functions';
    RAISE NOTICE '- Comprehensive audit logging';
    RAISE NOTICE '- Suspicious activity detection';
    RAISE NOTICE '- Performance indexes for security queries';
    RAISE NOTICE '- Function search path hardening';
    RAISE NOTICE '- Security configuration validation';
END $$;
