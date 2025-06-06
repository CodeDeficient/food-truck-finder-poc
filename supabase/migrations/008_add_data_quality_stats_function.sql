CREATE OR REPLACE FUNCTION public.get_data_quality_stats()
RETURNS TABLE(
    total_trucks bigint,
    avg_quality_score numeric,
    high_quality_count bigint,
    medium_quality_count bigint,
    low_quality_count bigint,
    verified_count bigint,
    pending_count bigint,
    flagged_count bigint
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(ft.id) AS total_trucks,
        COALESCE(AVG(ft.data_quality_score), 0)::numeric AS avg_quality_score,
        COUNT(CASE WHEN ft.data_quality_score >= 80 THEN 1 ELSE NULL END) AS high_quality_count,
        COUNT(CASE WHEN ft.data_quality_score >= 50 AND ft.data_quality_score < 80 THEN 1 ELSE NULL END) AS medium_quality_count,
        COUNT(CASE WHEN ft.data_quality_score < 50 THEN 1 ELSE NULL END) AS low_quality_count,
        COUNT(CASE WHEN ft.verification_status = 'verified' THEN 1 ELSE NULL END) AS verified_count,
        COUNT(CASE WHEN ft.verification_status = 'pending' THEN 1 ELSE NULL END) AS pending_count,
        COUNT(CASE WHEN ft.verification_status = 'flagged' THEN 1 ELSE NULL END) AS flagged_count
    FROM
        public.food_trucks ft;
END;
$$;

ALTER FUNCTION public.get_data_quality_stats() OWNER TO postgres;

GRANT EXECUTE ON FUNCTION public.get_data_quality_stats() TO anon, authenticated, service_role;
