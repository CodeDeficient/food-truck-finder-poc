-- Migration to create the data_quality_scores table and related functions
-- Version: 1.0
-- Author: Data Quality Scoring Service

-- Create data_quality_scores table for per-record quality tracking
CREATE TABLE IF NOT EXISTS data_quality_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL DEFAULT 'food_truck',
    entity_id UUID NOT NULL,
    score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100) NOT NULL,
    grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')) NOT NULL,
    validation_details JSONB DEFAULT '{}',
    breakdown JSONB DEFAULT '{}', -- Stores breakdown of scores by rule type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_quality_scores_entity ON data_quality_scores(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_data_quality_scores_score ON data_quality_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_data_quality_scores_grade ON data_quality_scores(grade);
CREATE INDEX IF NOT EXISTS idx_data_quality_scores_created_at ON data_quality_scores(created_at DESC);

-- Create foreign key constraint for food_trucks
ALTER TABLE data_quality_scores 
ADD CONSTRAINT fk_data_quality_scores_food_truck 
FOREIGN KEY (entity_id) REFERENCES food_trucks(id) ON DELETE CASCADE
WHERE entity_type = 'food_truck';

-- Create updated_at trigger
CREATE TRIGGER update_data_quality_scores_updated_at 
    BEFORE UPDATE ON data_quality_scores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create aggregated quality metrics table for performance
CREATE TABLE IF NOT EXISTS data_quality_metrics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    entity_type TEXT NOT NULL DEFAULT 'food_truck',
    total_entities INTEGER NOT NULL DEFAULT 0,
    avg_score NUMERIC(5,2) DEFAULT 0,
    grade_a_count INTEGER DEFAULT 0,
    grade_b_count INTEGER DEFAULT 0,
    grade_c_count INTEGER DEFAULT 0,
    grade_d_count INTEGER DEFAULT 0,
    grade_f_count INTEGER DEFAULT 0,
    critical_issues_count INTEGER DEFAULT 0,
    warning_issues_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(date, entity_type)
);

-- Create index for daily metrics
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_daily_date ON data_quality_metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_data_quality_metrics_daily_entity ON data_quality_metrics_daily(entity_type);

-- Function to calculate and store quality scores for a food truck
CREATE OR REPLACE FUNCTION calculate_food_truck_quality_score(truck_id UUID)
RETURNS data_quality_scores AS $$
DECLARE
    truck_record food_trucks%ROWTYPE;
    score_record data_quality_scores%ROWTYPE;
    calculated_score NUMERIC;
    calculated_grade TEXT;
    validation_result JSONB;
BEGIN
    -- Get the food truck record
    SELECT * INTO truck_record FROM food_trucks WHERE id = truck_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Food truck with ID % not found', truck_id;
    END IF;
    
    -- Basic scoring logic (this would be enhanced with actual validation rules)
    calculated_score := 0;
    validation_result := '{"critical": [], "warnings": [], "info": []}'::JSONB;
    
    -- Check critical rules
    IF truck_record.name IS NOT NULL AND LENGTH(TRIM(truck_record.name)) > 0 THEN
        calculated_score := calculated_score + 25;
    ELSE
        validation_result := jsonb_set(validation_result, '{critical}', 
            (validation_result->'critical') || '["Food truck name is required"]'::JSONB);
    END IF;
    
    -- Check warning rules  
    IF truck_record.cuisine_type IS NOT NULL AND array_length(truck_record.cuisine_type, 1) > 0 THEN
        calculated_score := calculated_score + 15;
    ELSE
        validation_result := jsonb_set(validation_result, '{warnings}', 
            (validation_result->'warnings') || '["Cuisine type should be specified"]'::JSONB);
    END IF;
    
    -- Additional scoring logic would go here...
    -- For demo purposes, we'll simulate a score
    calculated_score := calculated_score + RANDOM() * 40; -- Add some random component
    
    -- Determine grade
    CASE 
        WHEN calculated_score >= 90 THEN calculated_grade := 'A';
        WHEN calculated_score >= 80 THEN calculated_grade := 'B';
        WHEN calculated_score >= 70 THEN calculated_grade := 'C';
        WHEN calculated_score >= 60 THEN calculated_grade := 'D';
        ELSE calculated_grade := 'F';
    END CASE;
    
    -- Insert or update quality score record
    INSERT INTO data_quality_scores (
        entity_type, entity_id, score, grade, validation_details, 
        breakdown, created_at, updated_at
    ) VALUES (
        'food_truck', truck_id, calculated_score, calculated_grade, validation_result,
        jsonb_build_object('total_points', calculated_score, 'max_points', 100),
        now(), now()
    )
    ON CONFLICT (entity_type, entity_id) 
    DO UPDATE SET 
        score = EXCLUDED.score,
        grade = EXCLUDED.grade,
        validation_details = EXCLUDED.validation_details,
        breakdown = EXCLUDED.breakdown,
        updated_at = now()
    RETURNING * INTO score_record;
    
    RETURN score_record;
END;
$$ LANGUAGE plpgsql;

-- Function to aggregate daily quality metrics
CREATE OR REPLACE FUNCTION aggregate_daily_quality_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    metrics_record RECORD;
BEGIN
    -- Calculate metrics for the target date
    SELECT 
        COUNT(*) as total_entities,
        ROUND(AVG(score), 2) as avg_score,
        COUNT(*) FILTER (WHERE grade = 'A') as grade_a_count,
        COUNT(*) FILTER (WHERE grade = 'B') as grade_b_count,
        COUNT(*) FILTER (WHERE grade = 'C') as grade_c_count,
        COUNT(*) FILTER (WHERE grade = 'D') as grade_d_count,
        COUNT(*) FILTER (WHERE grade = 'F') as grade_f_count,
        SUM(jsonb_array_length(validation_details->'critical')) as critical_issues_count,
        SUM(jsonb_array_length(validation_details->'warnings')) as warning_issues_count
    INTO metrics_record
    FROM data_quality_scores 
    WHERE entity_type = 'food_truck' 
    AND DATE(created_at) = target_date;
    
    -- Insert or update daily metrics
    INSERT INTO data_quality_metrics_daily (
        date, entity_type, total_entities, avg_score,
        grade_a_count, grade_b_count, grade_c_count, grade_d_count, grade_f_count,
        critical_issues_count, warning_issues_count
    ) VALUES (
        target_date, 'food_truck', metrics_record.total_entities, metrics_record.avg_score,
        metrics_record.grade_a_count, metrics_record.grade_b_count, metrics_record.grade_c_count,
        metrics_record.grade_d_count, metrics_record.grade_f_count,
        metrics_record.critical_issues_count, metrics_record.warning_issues_count
    )
    ON CONFLICT (date, entity_type)
    DO UPDATE SET
        total_entities = EXCLUDED.total_entities,
        avg_score = EXCLUDED.avg_score,
        grade_a_count = EXCLUDED.grade_a_count,
        grade_b_count = EXCLUDED.grade_b_count,
        grade_c_count = EXCLUDED.grade_c_count,
        grade_d_count = EXCLUDED.grade_d_count,
        grade_f_count = EXCLUDED.grade_f_count,
        critical_issues_count = EXCLUDED.critical_issues_count,
        warning_issues_count = EXCLUDED.warning_issues_count;
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy access to latest quality scores
CREATE OR REPLACE VIEW latest_quality_scores AS
SELECT DISTINCT ON (entity_type, entity_id)
    dqs.*,
    ft.name as truck_name
FROM data_quality_scores dqs
LEFT JOIN food_trucks ft ON ft.id = dqs.entity_id AND dqs.entity_type = 'food_truck'
ORDER BY entity_type, entity_id, created_at DESC;

-- Add RLS policies
ALTER TABLE data_quality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Allow public read access to quality scores (similar to food_trucks policy)
CREATE POLICY "Quality scores are publicly readable" ON data_quality_scores
    FOR SELECT USING (true);

CREATE POLICY "Quality metrics are publicly readable" ON data_quality_metrics_daily
    FOR SELECT USING (true);

-- Add comments for documentation
COMMENT ON TABLE data_quality_scores IS 'Per-record quality scores and validation results';
COMMENT ON TABLE data_quality_metrics_daily IS 'Daily aggregated quality metrics for performance';
COMMENT ON FUNCTION calculate_food_truck_quality_score(UUID) IS 'Calculates and stores quality score for a food truck';
COMMENT ON FUNCTION aggregate_daily_quality_metrics(DATE) IS 'Aggregates daily quality metrics for reporting';
COMMENT ON VIEW latest_quality_scores IS 'Latest quality scores for all entities';

-- Example usage:
-- SELECT calculate_food_truck_quality_score('your-truck-id-here');
-- SELECT aggregate_daily_quality_metrics();
-- SELECT * FROM latest_quality_scores WHERE entity_type = 'food_truck';
