-- Placeholder for update_api_usage function
-- Replace with your actual function logic if it doesn't exist.
CREATE OR REPLACE FUNCTION public.update_api_usage(
    p_service_name TEXT,
    p_requests_increment INTEGER DEFAULT 1,
    p_tokens_increment INTEGER DEFAULT 0
)
RETURNS void AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_usage_id UUID;
BEGIN
    -- Try to find an existing record for today and the given service
    -- This assumes a table 'public.api_usage' exists with columns:
    -- id (UUID), service_name (TEXT), usage_date (DATE),
    -- requests_count (INTEGER), tokens_used (INTEGER), updated_at (TIMESTAMP)
    -- If the table structure is different, this placeholder will need adjustment.
    BEGIN
        SELECT id INTO v_usage_id
        FROM public.api_usage
        WHERE service_name = p_service_name AND usage_date = v_today;

        IF v_usage_id IS NOT NULL THEN
            -- Update existing record
            UPDATE public.api_usage
            SET
                requests_count = requests_count + p_requests_increment,
                tokens_used = tokens_used + p_tokens_increment,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = v_usage_id;
        ELSE
            -- Insert new record
            INSERT INTO public.api_usage (service_name, usage_date, requests_count, tokens_used)
            VALUES (p_service_name, v_today, p_requests_increment, p_tokens_increment);
        END IF;
    EXCEPTION
        WHEN undefined_table THEN
            -- Handle cases where 'api_usage' table might not exist during initial migration runs.
            -- This is a basic way to prevent the function creation from failing if the table is created later.
            -- For a production system, ensure 'api_usage' table is created before this function.
            RAISE NOTICE 'Table public.api_usage not found. Placeholder function update_api_usage created without table-dependent logic.';
            RETURN;
    END;
END;
$$ LANGUAGE plpgsql;

-- Set search_path for update_api_usage function
-- This ensures the function uses a predictable schema search order.
ALTER FUNCTION public.update_api_usage SET search_path = public, pg_catalog, pg_temp;

-- It's common to include 'public' for your user-defined objects,
-- 'pg_catalog' for system catalog access (e.g., data types),
-- and 'pg_temp' for temporary tables if your function uses them.
-- Adjust if your function relies on other schemas.
