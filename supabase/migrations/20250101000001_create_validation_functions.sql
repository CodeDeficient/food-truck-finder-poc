-- Create validation schema storage table
CREATE TABLE IF NOT EXISTS public.validation_schemas (
  id SERIAL PRIMARY KEY,
  schema_name VARCHAR(255) UNIQUE NOT NULL,
  json_schema JSONB NOT NULL,
  version VARCHAR(50) DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for validation_schemas table
ALTER TABLE public.validation_schemas ENABLE ROW LEVEL SECURITY;

-- Create policy for validation schemas (read-only for authenticated users, admin can modify)
CREATE POLICY "validation_schemas_read" ON public.validation_schemas FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "validation_schemas_admin" ON public.validation_schemas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to validate JSON data against a stored schema
CREATE OR REPLACE FUNCTION public.supabase_validate(
  data JSONB,
  schema_name_param TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  schema_json JSONB;
  validation_result JSONB;
  error_messages TEXT[] := '{}';
  temp_error TEXT;
BEGIN
  -- Get the schema from storage
  SELECT json_schema INTO schema_json
  FROM public.validation_schemas
  WHERE schema_name = schema_name_param
  AND version = 'v1'
  LIMIT 1;

  -- If schema not found, return error
  IF schema_json IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', jsonb_build_array(
        jsonb_build_object(
          'field', 'schema',
          'message', 'Schema not found: ' || schema_name_param,
          'code', 'schema_not_found'
        )
      )
    );
  END IF;

  -- Basic validation checks based on schema type
  -- Note: This is a simplified validation. For full JSON Schema validation,
  -- you would need a more sophisticated implementation or extension
  
  -- Check required fields if defined in schema
  IF schema_json ? 'required' THEN
    DECLARE
      required_field TEXT;
    BEGIN
      FOR required_field IN SELECT jsonb_array_elements_text(schema_json->'required')
      LOOP
        IF NOT (data ? required_field) THEN
          error_messages := array_append(error_messages, 
            json_build_object(
              'field', required_field,
              'message', 'Required field missing: ' || required_field,
              'code', 'required'
            )::TEXT
          );
        END IF;
      END LOOP;
    END;
  END IF;

  -- Check data types for properties if defined
  IF schema_json ? 'properties' THEN
    DECLARE
      prop_key TEXT;
      prop_schema JSONB;
      expected_type TEXT;
      actual_value JSONB;
    BEGIN
      FOR prop_key IN SELECT jsonb_object_keys(schema_json->'properties')
      LOOP
        IF data ? prop_key THEN
          prop_schema := schema_json->'properties'->prop_key;
          expected_type := prop_schema->>'type';
          actual_value := data->prop_key;
          
          -- Type checking
          CASE expected_type
            WHEN 'string' THEN
              IF jsonb_typeof(actual_value) != 'string' THEN
                error_messages := array_append(error_messages,
                  json_build_object(
                    'field', prop_key,
                    'message', 'Expected string, got ' || jsonb_typeof(actual_value),
                    'code', 'type_error'
                  )::TEXT
                );
              END IF;
            WHEN 'number' THEN
              IF jsonb_typeof(actual_value) NOT IN ('number') THEN
                error_messages := array_append(error_messages,
                  json_build_object(
                    'field', prop_key,
                    'message', 'Expected number, got ' || jsonb_typeof(actual_value),
                    'code', 'type_error'
                  )::TEXT
                );
              END IF;
            WHEN 'boolean' THEN
              IF jsonb_typeof(actual_value) != 'boolean' THEN
                error_messages := array_append(error_messages,
                  json_build_object(
                    'field', prop_key,
                    'message', 'Expected boolean, got ' || jsonb_typeof(actual_value),
                    'code', 'type_error'
                  )::TEXT
                );
              END IF;
            WHEN 'array' THEN
              IF jsonb_typeof(actual_value) != 'array' THEN
                error_messages := array_append(error_messages,
                  json_build_object(
                    'field', prop_key,
                    'message', 'Expected array, got ' || jsonb_typeof(actual_value),
                    'code', 'type_error'
                  )::TEXT
                );
              END IF;
            WHEN 'object' THEN
              IF jsonb_typeof(actual_value) != 'object' THEN
                error_messages := array_append(error_messages,
                  json_build_object(
                    'field', prop_key,
                    'message', 'Expected object, got ' || jsonb_typeof(actual_value),
                    'code', 'type_error'
                  )::TEXT
                );
              END IF;
          END CASE;
        END IF;
      END LOOP;
    END;
  END IF;

  -- Build result
  IF array_length(error_messages, 1) > 0 THEN
    -- Convert string array to JSONB array
    SELECT jsonb_agg(error_msg::JSONB) INTO validation_result
    FROM unnest(error_messages) AS error_msg;
    
    RETURN jsonb_build_object(
      'valid', false,
      'errors', validation_result
    );
  ELSE
    RETURN jsonb_build_object(
      'valid', true,
      'errors', '[]'::JSONB
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'valid', false,
      'errors', jsonb_build_array(
        jsonb_build_object(
          'field', 'validation',
          'message', 'Validation error: ' || SQLERRM,
          'code', 'validation_error'
        )
      )
    );
END;
$$;

-- Function to add or update validation schemas
CREATE OR REPLACE FUNCTION public.upsert_validation_schema(
  schema_name_param TEXT,
  json_schema_param JSONB,
  version_param TEXT DEFAULT 'v1'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Admin role required'
    );
  END IF;

  -- Insert or update schema
  INSERT INTO public.validation_schemas (schema_name, json_schema, version, updated_at)
  VALUES (schema_name_param, json_schema_param, version_param, NOW())
  ON CONFLICT (schema_name) 
  DO UPDATE SET 
    json_schema = EXCLUDED.json_schema,
    version = EXCLUDED.version,
    updated_at = NOW();

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Schema ' || schema_name_param || ' updated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Failed to update schema: ' || SQLERRM
    );
END;
$$;

-- Trigger function for food truck validation
CREATE OR REPLACE FUNCTION public.validate_food_truck_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  validation_result JSONB;
  row_data JSONB;
BEGIN
  -- Convert the row to JSONB for validation
  CASE TG_OP
    WHEN 'INSERT' THEN
      row_data := to_jsonb(NEW);
    WHEN 'UPDATE' THEN
      row_data := to_jsonb(NEW);
  END CASE;

  -- Remove system fields that shouldn't be validated
  row_data := row_data - 'id' - 'created_at' - 'updated_at' - 'last_updated_at';

  -- Validate against CreateFoodTruck schema
  validation_result := supabase_validate(row_data, 'CreateFoodTruck');

  -- If validation fails, raise an exception
  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RAISE EXCEPTION 'Validation failed: %', validation_result->'errors'
      USING ERRCODE = 'check_violation';
  END IF;

  -- Return the row for processing
  CASE TG_OP
    WHEN 'INSERT' THEN
      RETURN NEW;
    WHEN 'UPDATE' THEN
      RETURN NEW;
  END CASE;

  RETURN NULL;
END;
$$;

-- Comment on functions for documentation
COMMENT ON FUNCTION public.supabase_validate(JSONB, TEXT) IS 
'Validates JSON data against a stored validation schema. Returns validation result with errors if any.';

COMMENT ON FUNCTION public.upsert_validation_schema(TEXT, JSONB, TEXT) IS 
'Adds or updates a validation schema. Requires admin role.';

COMMENT ON FUNCTION public.validate_food_truck_trigger() IS 
'Trigger function to validate food truck data before insert/update operations.';

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.supabase_validate(JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_validation_schema(TEXT, JSONB, TEXT) TO authenticated;
GRANT SELECT ON public.validation_schemas TO authenticated;
