-- Initial schema migration for Food Truck Finder
-- This creates all the core tables needed for the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create profiles table for user roles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'food_truck_owner', 'customer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create food_trucks table
CREATE TABLE IF NOT EXISTS food_trucks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT[] DEFAULT '{}',
  current_location JSONB DEFAULT '{}',
  contact_info JSONB DEFAULT '{}',
  operating_hours JSONB DEFAULT '{}',
  menu_items JSONB DEFAULT '{}',
  social_media JSONB DEFAULT '{}',
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending')),
  data_quality_score DECIMAL DEFAULT 0.0 CHECK (data_quality_score >= 0 AND data_quality_score <= 1),
  average_rating DECIMAL DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5),
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  source_url TEXT,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for food_trucks
CREATE INDEX IF NOT EXISTS idx_food_trucks_name ON food_trucks(name);
CREATE INDEX IF NOT EXISTS idx_food_trucks_cuisine ON food_trucks USING GIN(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_food_trucks_verification ON food_trucks(verification_status);
CREATE INDEX IF NOT EXISTS idx_food_trucks_active ON food_trucks(is_active);
CREATE INDEX IF NOT EXISTS idx_food_trucks_created_at ON food_trucks(created_at DESC);

-- Enable RLS on food_trucks (will be configured later for multi-tenancy)
ALTER TABLE food_trucks ENABLE ROW LEVEL SECURITY;

-- Allow public read access to food trucks
CREATE POLICY "Food trucks are publicly readable" ON food_trucks
  FOR SELECT USING (true);

-- Create scraping_jobs table
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  job_type TEXT DEFAULT 'website' CHECK (job_type IN ('website', 'instagram', 'facebook', 'generic')),
  metadata JSONB DEFAULT '{}',
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for scraping_jobs
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_scheduled ON scraping_jobs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_priority ON scraping_jobs(priority DESC);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_url ON scraping_jobs(url);

-- Create discovered_urls table
CREATE TABLE IF NOT EXISTS discovered_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL UNIQUE,
  source TEXT,
  confidence_score DECIMAL DEFAULT 0.0,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'discovered' CHECK (status IN ('discovered', 'queued', 'processed', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for discovered_urls
CREATE INDEX IF NOT EXISTS idx_discovered_urls_url ON discovered_urls(url);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_status ON discovered_urls(status);
CREATE INDEX IF NOT EXISTS idx_discovered_urls_created_at ON discovered_urls(created_at DESC);

-- Create data_quality_logs table
CREATE TABLE IF NOT EXISTS data_quality_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID,
  issue_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  field_name TEXT,
  old_value TEXT,
  suggested_value TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for data_quality_logs
CREATE INDEX IF NOT EXISTS idx_data_quality_logs_table ON data_quality_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_data_quality_logs_record ON data_quality_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_logs_severity ON data_quality_logs(severity);
CREATE INDEX IF NOT EXISTS idx_data_quality_logs_resolved ON data_quality_logs(is_resolved);

-- Create api_usage_logs table
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_status INTEGER,
  response_time_ms INTEGER,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for api_usage_logs
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_endpoint ON api_usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user ON api_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at DESC);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_trucks_updated_at 
  BEFORE UPDATE ON food_trucks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_jobs_updated_at 
  BEFORE UPDATE ON scraping_jobs 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovered_urls_updated_at 
  BEFORE UPDATE ON discovered_urls 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE profiles IS 'User profiles with role-based access control';
COMMENT ON TABLE food_trucks IS 'Core food truck data and metadata';
COMMENT ON TABLE scraping_jobs IS 'Queue for web scraping tasks';
COMMENT ON TABLE discovered_urls IS 'URLs discovered for potential food truck sources';
COMMENT ON TABLE data_quality_logs IS 'Log of data quality issues and resolutions';
COMMENT ON TABLE api_usage_logs IS 'API usage tracking and monitoring';
