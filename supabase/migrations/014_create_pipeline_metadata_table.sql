-- Create the pipeline_metadata table
CREATE TABLE public.pipeline_metadata (
    event_name TEXT PRIMARY KEY,
    last_run_at TIMESTAMPTZ,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.pipeline_metadata IS 'Stores metadata about pipeline runs, like last run times for specific events.';
COMMENT ON COLUMN public.pipeline_metadata.event_name IS 'The unique name of the pipeline event (e.g., lastDirectoryProspectingRun).';
COMMENT ON COLUMN public.pipeline_metadata.last_run_at IS 'The timestamp of when this event last successfully completed.';

-- Standard updated_at trigger (use existing if available, otherwise create)
-- Assuming public.update_updated_at_column() might exist from previous migrations (e.g., 013_create_discovered_directories_table.sql)
-- If it does not, uncomment the function creation.
-- If it does exist, this CREATE OR REPLACE FUNCTION will safely update it or leave it.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER pipeline_metadata_updated_at_trigger
BEFORE UPDATE ON public.pipeline_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS (service_role all, authenticated read-only or deny all if not needed by client)
ALTER TABLE public.pipeline_metadata ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated; -- Ensure authenticated role can access the schema if not already granted

GRANT ALL ON TABLE public.pipeline_metadata TO service_role;
GRANT SELECT ON TABLE public.pipeline_metadata TO authenticated; -- Or deny if not needed by clients

-- Define RLS policies
CREATE POLICY "Allow service_role full access to pipeline_metadata"
ON public.pipeline_metadata FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated read access to pipeline_metadata"
ON public.pipeline_metadata FOR SELECT TO authenticated USING (true);

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
