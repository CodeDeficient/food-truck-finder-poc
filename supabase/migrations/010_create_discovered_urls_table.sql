-- Create the discovered_urls table
CREATE TABLE public.discovered_urls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    source_directory_url TEXT,
    region TEXT, -- e.g., "SC", "NC", "GA"
    status TEXT DEFAULT 'new', -- e.g., 'new', 'processing', 'processed', 'irrelevant'
    discovered_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_processed_at TIMESTAMPTZ,
    notes TEXT
);

-- Add comments to the table and columns
COMMENT ON TABLE public.discovered_urls IS 'Stores URLs discovered from various sources that might be potential food truck websites.';
COMMENT ON COLUMN public.discovered_urls.id IS 'Unique identifier for the discovered URL.';
COMMENT ON COLUMN public.discovered_urls.url IS 'The discovered URL. Must be unique.';
COMMENT ON COLUMN public.discovered_urls.source_directory_url IS 'The directory URL from which this URL was found.';
COMMENT ON COLUMN public.discovered_urls.region IS 'The geographical region associated with the discovery (e.g., state abbreviation).';
COMMENT ON COLUMN public.discovered_urls.status IS 'The current processing status of the URL (new, processing, processed, irrelevant).';
COMMENT ON COLUMN public.discovered_urls.discovered_at IS 'Timestamp of when the URL was first discovered.';
COMMENT ON COLUMN public.discovered_urls.last_processed_at IS 'Timestamp of when the URL was last processed (e.g., crawled or analyzed).';
COMMENT ON COLUMN public.discovered_urls.notes IS 'Any relevant notes about the URL or its discovery process.';

-- Enable Row Level Security (RLS)
ALTER TABLE public.discovered_urls ENABLE ROW LEVEL SECURITY;

-- Policies for RLS
-- Allow service_role all access (typical for backend operations)
CREATE POLICY "Allow service_role all access"
ON public.discovered_urls
FOR ALL
USING (true)
WITH CHECK (true);

-- Allow authenticated users read access (adjust as needed for your application)
CREATE POLICY "Allow authenticated users read access"
ON public.discovered_urls
FOR SELECT
TO authenticated
USING (true);

-- Optional: Allow specific admin roles to manage the table
-- This requires you to have a way to identify admin users (e.g., a custom claim or a separate table)
-- Example (assuming you have a function like `is_admin()` or a custom claim `claims.role = 'admin'`):
/*
CREATE POLICY "Allow admin users full access"
ON public.discovered_urls
FOR ALL
USING (auth.role() = 'admin') -- Adjust this condition based on your admin role setup
WITH CHECK (auth.role() = 'admin');
*/

-- Grant usage on the schema to authenticated and service_role if not already granted
-- This is often handled at a higher level, but included for completeness if this is the first table in the schema for these roles.
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- Grant specific permissions to roles for the table
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.discovered_urls TO service_role;
GRANT SELECT ON TABLE public.discovered_urls TO authenticated;

-- (If you created an admin policy above, grant appropriate permissions to that role too)
-- Example: GRANT ALL ON TABLE public.discovered_urls TO admin_user_role;

-- Create an index on the URL column for faster lookups, especially with UNIQUE constraint
CREATE INDEX idx_discovered_urls_url ON public.discovered_urls(url);

-- Create an index on status for filtering by status
CREATE INDEX idx_discovered_urls_status ON public.discovered_urls(status);

-- Create an index on region for filtering by region
CREATE INDEX idx_discovered_urls_region ON public.discovered_urls(region);

-- Create an index on discovered_at for time-based queries
CREATE INDEX idx_discovered_urls_discovered_at ON public.discovered_urls(discovered_at);

-- Create an index on source_directory_url for finding all URLs from a specific source
CREATE INDEX idx_discovered_urls_source_directory_url ON public.discovered_urls(source_directory_url);

-- Notify Supabase of schema changes (if using the Supabase CLI locally, this might not be strictly necessary as `db push` handles it)
-- However, it's good practice for raw SQL migrations.
NOTIFY pgrst, 'reload schema';
