-- Fix discovered_urls table by adding missing columns
-- Run this in your Supabase SQL Editor

-- Add discovery_method column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'discovery_method') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN discovery_method text DEFAULT 'manual' 
        CHECK (discovery_method IN ('manual', 'autonomous_search', 'tavily_search', 'firecrawl_crawl', 'directory_crawl'));
        
        RAISE NOTICE 'Added discovery_method column';
    ELSE
        RAISE NOTICE 'discovery_method column already exists';
    END IF;
END $$;

-- Add discovered_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'discovered_at') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN discovered_at timestamptz DEFAULT now();
        
        RAISE NOTICE 'Added discovered_at column';
    ELSE
        RAISE NOTICE 'discovered_at column already exists';
    END IF;
END $$;

-- Add last_processed_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'last_processed_at') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN last_processed_at timestamptz;
        
        RAISE NOTICE 'Added last_processed_at column';
    ELSE
        RAISE NOTICE 'last_processed_at column already exists';
    END IF;
END $$;

-- Add processing_attempts column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'processing_attempts') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN processing_attempts integer DEFAULT 0;
        
        RAISE NOTICE 'Added processing_attempts column';
    ELSE
        RAISE NOTICE 'processing_attempts column already exists';
    END IF;
END $$;

-- Add metadata column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'metadata') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN metadata jsonb;
        
        RAISE NOTICE 'Added metadata column';
    ELSE
        RAISE NOTICE 'metadata column already exists';
    END IF;
END $$;

-- Add source_directory_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'source_directory_url') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN source_directory_url text;
        
        RAISE NOTICE 'Added source_directory_url column';
    ELSE
        RAISE NOTICE 'source_directory_url column already exists';
    END IF;
END $$;

-- Add region column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'discovered_urls' 
                   AND column_name = 'region') THEN
        ALTER TABLE public.discovered_urls 
        ADD COLUMN region text DEFAULT 'SC';
        
        RAISE NOTICE 'Added region column';
    ELSE
        RAISE NOTICE 'region column already exists';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_discovered_urls_discovery_method ON public.discovered_urls(discovery_method);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_discovered_at ON public.discovered_urls(discovered_at);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_region ON public.discovered_urls(region);

-- Show current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'discovered_urls' 
ORDER BY ordinal_position;
