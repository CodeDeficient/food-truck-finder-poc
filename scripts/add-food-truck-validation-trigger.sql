-- Add validation trigger to food_trucks table to guard against non-API inserts
-- This ensures all data inserted directly into the database (CLI, manual SQL) is validated

-- First, ensure we have the validation schema in place
-- This should be run by the setup-validation-schemas.ts script

-- Create the trigger on the food_trucks table
DROP TRIGGER IF EXISTS validate_food_truck_data ON public.food_trucks;

CREATE TRIGGER validate_food_truck_data
  BEFORE INSERT OR UPDATE ON public.food_trucks
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_food_truck_trigger();

-- Comment on the trigger
COMMENT ON TRIGGER validate_food_truck_data ON public.food_trucks IS 
'Validates food truck data before insert/update operations using the CreateFoodTruck schema.';

-- Test the trigger with sample data
DO $$
DECLARE
  test_data JSONB;
  validation_result JSONB;
BEGIN
  -- Test with valid data
  test_data := '{
    "name": "Test Trigger Truck",
    "description": "Testing validation trigger",
    "cuisine_type": ["American"],
    "price_range": "$",
    "specialties": ["Burgers"]
  }'::JSONB;

  -- Test validation function directly
  validation_result := public.supabase_validate(test_data, 'CreateFoodTruck');
  
  IF (validation_result->>'valid')::BOOLEAN THEN
    RAISE NOTICE 'Trigger validation test: PASSED - Valid data accepted';
  ELSE
    RAISE NOTICE 'Trigger validation test: FAILED - Valid data rejected: %', validation_result->'errors';
  END IF;

  -- Test with invalid data
  test_data := '{
    "description": "Missing name field",
    "cuisine_type": "American",
    "price_range": "invalid"
  }'::JSONB;

  validation_result := public.supabase_validate(test_data, 'CreateFoodTruck');
  
  IF NOT (validation_result->>'valid')::BOOLEAN THEN
    RAISE NOTICE 'Trigger validation test: PASSED - Invalid data rejected';
    RAISE NOTICE 'Validation errors: %', validation_result->'errors';
  ELSE
    RAISE NOTICE 'Trigger validation test: FAILED - Invalid data accepted';
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Trigger validation test failed with error: %', SQLERRM;
END $$;
