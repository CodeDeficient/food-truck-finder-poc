-- Create the discovered_directories table
CREATE TABLE public.discovered_directories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    name TEXT NULL,
    directory_description TEXT NULL,
    is_sc_focused BOOLEAN NULL DEFAULT FALSE,
    relevance_score NUMERIC NULL, -- Consider a specific precision, e.g., NUMERIC(3, 2) for a 0.00-1.00 score
    status TEXT NOT NULL DEFAULT 'needs_review', -- e.g., 'needs_review', 'active', 'inactive', 'error_processing'
    last_validated_at TIMESTAMPTZ NULL,
    last_crawled_for_trucks_at TIMESTAMPTZ NULL,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(), -- Standard created_at
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()  -- Standard updated_at
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.discovered_directories IS 'Stores URLs that are identified as potential directories listing food trucks, along with their classification status and metadata.';
COMMENT ON COLUMN public.discovered_directories.url IS 'The unique URL of the discovered directory.';
COMMENT ON COLUMN public.discovered_directories.name IS 'The name of the directory website, as extracted by AI.';
COMMENT ON COLUMN public.discovered_directories.directory_description IS 'A brief description of the directory, potentially from AI.';
COMMENT ON COLUMN public.discovered_directories.is_sc_focused IS 'Flag indicating if AI confirmed a focus on South Carolina.';
COMMENT ON COLUMN public.discovered_directories.relevance_score IS 'Score indicating relevance as a food truck directory, determined by AI.';
COMMENT ON COLUMN public.discovered_directories.status IS 'The current processing status of this directory (e.g., needs_review, active, inactive).';
COMMENT ON COLUMN public.discovered_directories.last_validated_at IS 'Timestamp of when the directory was last successfully classified/validated.';
COMMENT ON COLUMN public.discovered_directories.last_crawled_for_trucks_at IS 'Timestamp of when this directory was last crawled to find individual food truck URLs.';
COMMENT ON COLUMN public.discovered_directories.added_at IS 'Timestamp of when this directory URL was first added to this table (likely after prospecting).';

-- Create indexes for frequently queried columns
CREATE INDEX idx_discovered_directories_url ON public.discovered_directories(url);
CREATE INDEX idx_discovered_directories_status ON public.discovered_directories(status);
CREATE INDEX idx_discovered_directories_is_sc_focused ON public.discovered_directories(is_sc_focused);
CREATE INDEX idx_discovered_directories_relevance_score ON public.discovered_directories(relevance_score DESC); -- DESC for finding highest scores
CREATE INDEX idx_discovered_directories_last_crawled ON public.discovered_directories(last_crawled_for_trucks_at ASC NULLS FIRST); -- ASC NULLS FIRST for finding those not crawled

-- Standard trigger for updated_at timestamp (if not already handled globally by your Supabase setup)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER discovered_directories_updated_at_trigger
BEFORE UPDATE ON public.discovered_directories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.discovered_directories ENABLE ROW LEVEL SECURITY;

-- Grant permissions to roles (adjust as needed)
-- anon and authenticated typically get read-only access if this data is to be displayed or used by clients.
-- For now, primarily service_role will interact heavily.
GRANT USAGE ON SCHEMA public TO anon, authenticated; -- If not already granted

GRANT SELECT ON TABLE public.discovered_directories TO anon, authenticated;

-- service_role should have full access for backend processing
GRANT ALL ON TABLE public.discovered_directories TO service_role;


-- Define RLS policies
CREATE POLICY "Allow public read access to discovered directories"
ON public.discovered_directories
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow service_role full access to discovered directories"
ON public.discovered_directories
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Notify PostgREST to reload schema (important for API layer to pick up changes)
NOTIFY pgrst, 'reload schema';
