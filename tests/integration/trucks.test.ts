import { describe, it, expect, jest } from '@jest/globals';
import { z } from 'zod';

/**
 * API Integration Tests
 * Tests the integration of API validation, error handling, and response formatting
 */

describe('API Integration Tests', () => {
  describe('Request Validation Integration', () => {
    const FoodTruckSchema = z.object({
      name: z.string().min(1, 'Name is required'),
      description: z.string().optional(),
      current_location: z.object({
        lat: z.number(),
        lng: z.number(),
        address: z.string(),
      }).optional(),
    });

    // Mock API handler function
    const mockApiHandler = async (body: unknown) => {
      try {
        const validatedData = FoodTruckSchema.parse(body);
        return {
          status: 201,
          json: () => ({
            success: true,
            data: validatedData,
            message: 'Food truck created successfully'
          })
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            status: 400,
            json: () => ({ 
              success: false,
              error: 'Validation failed',
              details: error.errors 
            })
          };
        }
        return {
          status: 500,
          json: () => ({ 
            success: false,
            error: 'Internal server error' 
          })
        };
      }
    };

    it('should successfully validate and process valid truck data', async () => {
      const validTruckData = {
        name: 'Amazing Tacos',
        description: 'Best tacos in town',
        current_location: {
          lat: 40.7128,
          lng: -74.0060,
          address: '123 Main St, New York, NY'
        }
      };

      const response = await mockApiHandler(validTruckData);
      const responseData = response.json();

      expect(response.status).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.data.name).toBe('Amazing Tacos');
    });

    it('should reject invalid truck data with validation errors', async () => {
      const invalidTruckData = {
        // Missing required 'name' field
        description: 'A truck without a name',
      };

      const response = await mockApiHandler(invalidTruckData);
      const responseData = response.json();

      expect(response.status).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Validation failed');
      expect(responseData.details).toBeDefined();
    });

    it('should validate location data when provided', async () => {
      const truckWithInvalidLocation = {
        name: 'Test Truck',
        current_location: {
          lat: 'invalid-lat', // Should be number
          lng: -74.0060,
          address: '123 Main St'
        }
      };

      const response = await mockApiHandler(truckWithInvalidLocation);
      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling Integration', () => {
    const mockErrorHandler = (error: unknown) => {
      if (error instanceof z.ZodError) {
        return {
          status: 400,
          body: {
            error: 'Validation failed',
            issues: error.errors.map(err => ({
              path: err.path.join('.'),
              message: err.message
            }))
          }
        };
      }

      if (error instanceof Error) {
        return {
          status: 500,
          body: {
            error: 'Internal server error',
            message: error.message
          }
        };
      }

      return {
        status: 500,
        body: {
          error: 'Unknown error occurred'
        }
      };
    };

    it('should handle Zod validation errors correctly', () => {
      const zodError = new z.ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          received: 'number',
          path: ['name'],
          message: 'Expected string, received number'
        }
      ]);

      const response = mockErrorHandler(zodError);
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.issues).toHaveLength(1);
      expect(response.body.issues[0].path).toBe('name');
    });

    it('should handle generic errors', () => {
      const genericError = new Error('Database connection failed');
      const response = mockErrorHandler(genericError);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
      expect(response.body.message).toBe('Database connection failed');
    });

    it('should handle unknown errors', () => {
      const unknownError = 'string error';
      const response = mockErrorHandler(unknownError);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Unknown error occurred');
    });
  });
});
