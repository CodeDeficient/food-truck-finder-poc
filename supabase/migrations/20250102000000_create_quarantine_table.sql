-- Create quarantine_errors table for storing invalid records
CREATE TABLE IF NOT EXISTS quarantine_errors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL, -- Source table where the record would have been inserted
  record_id TEXT, -- Original record identifier (if available)
  raw_payload JSONB NOT NULL, -- Original raw data that failed validation
  error_details JSONB NOT NULL, -- Detailed validation errors
  schema_name TEXT, -- Schema used for validation
  job_id TEXT, -- Associated job ID for traceability
  source_url TEXT, -- Source URL where data originated
  error_count INTEGER DEFAULT 1, -- Number of validation errors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  is_resolved BOOLEAN DEFAULT false,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3
);

-- Create indexes for quarantine_errors
CREATE INDEX IF NOT EXISTS idx_quarantine_errors_table_name ON quarantine_errors(table_name);
CREATE INDEX IF NOT EXISTS idx_quarantine_errors_job_id ON quarantine_errors(job_id);
CREATE INDEX IF NOT EXISTS idx_quarantine_errors_resolved ON quarantine_errors(is_resolved);
CREATE INDEX IF NOT EXISTS idx_quarantine_errors_created_at ON quarantine_errors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quarantine_errors_source_url ON quarantine_errors(source_url);

-- Enable RLS on quarantine_errors
ALTER TABLE quarantine_errors ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage quarantine errors
CREATE POLICY "Admins can manage quarantine errors" ON quarantine_errors
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger for quarantine_errors
CREATE TRIGGER update_quarantine_errors_updated_at 
  BEFORE UPDATE ON quarantine_errors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create pipeline_metrics table for tracking processing metrics
CREATE TABLE IF NOT EXISTS pipeline_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT,
  metric_type TEXT NOT NULL CHECK (metric_type IN ('processed', 'valid', 'quarantined', 'failed')),
  metric_value INTEGER DEFAULT 1,
  table_name TEXT,
  pipeline_stage TEXT, -- e.g., 'scraping', 'extraction', 'validation', 'storage'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for pipeline_metrics
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_job_id ON pipeline_metrics(job_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_type ON pipeline_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_created_at ON pipeline_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pipeline_metrics_stage ON pipeline_metrics(pipeline_stage);

-- Enable RLS on pipeline_metrics
ALTER TABLE pipeline_metrics ENABLE ROW LEVEL SECURITY;

-- Allow admins to view pipeline metrics
CREATE POLICY "Admins can view pipeline metrics" ON pipeline_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Comments
COMMENT ON TABLE quarantine_errors IS 'Invalid records quarantined for review and potential reprocessing';
COMMENT ON TABLE pipeline_metrics IS 'Pipeline processing metrics for monitoring and analysis';
