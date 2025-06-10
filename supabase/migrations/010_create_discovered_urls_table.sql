-- Migration: Create discovered_urls table for URL discovery and management

CREATE TABLE IF NOT EXISTS public.discovered_urls (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    url text UNIQUE NOT NULL,
    source_directory_url text,
    region text DEFAULT 'SC',
    status text DEFAULT 'new' CHECK (status IN ('new', 'processing', 'processed', 'irrelevant', 'failed')),
    discovery_method text DEFAULT 'manual' CHECK (discovery_method IN ('manual', 'autonomous_search', 'tavily_search', 'firecrawl_crawl', 'directory_crawl')),
    discovered_at timestamptz DEFAULT now(),
    last_processed_at timestamptz,
    processing_attempts integer DEFAULT 0,
    notes text,
    metadata jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discovered_urls_status ON public.discovered_urls(status);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_region ON public.discovered_urls(region);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_discovery_method ON public.discovered_urls(discovery_method);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_discovered_at ON public.discovered_urls(discovered_at);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_url ON public.discovered_urls(url);

-- Enable RLS
ALTER TABLE public.discovered_urls ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow authenticated read access to discovered_urls"
ON public.discovered_urls
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow full access for service_role to discovered_urls"
ON public.discovered_urls
FOR ALL
TO service_role
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_discovered_urls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_discovered_urls_updated_at
    BEFORE UPDATE ON public.discovered_urls
    FOR EACH ROW
    EXECUTE FUNCTION public.update_discovered_urls_updated_at();

-- Add helpful comments
COMMENT ON TABLE public.discovered_urls IS 'Stores URLs discovered through various methods for food truck data collection';
COMMENT ON COLUMN public.discovered_urls.status IS 'Processing status: new, processing, processed, irrelevant, failed';
COMMENT ON COLUMN public.discovered_urls.discovery_method IS 'How the URL was discovered: manual, autonomous_search, tavily_search, etc.';
COMMENT ON COLUMN public.discovered_urls.metadata IS 'Additional metadata about the discovered URL (search context, confidence score, etc.)';
