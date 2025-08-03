/**
 * API Error Handling Tests
 * Tests for server-side error handling and data transformation errors
 */

import { createMocks } from 'node-mocks-http';

// Mock Next.js API route handler
const mockApiHandler = async (req: any, res: any, shouldFail = false, errorType = '500') => {
  if (shouldFail) {
    switch (errorType) {
      case '500':
        res.status(500).json({ error: 'Internal Server Error', message: 'Something went wrong' });
        break;
      case '404':
        res.status(404).json({ error: 'Not Found', message: 'Resource not found' });
        break;
      case '400':
        res.status(400).json({ error: 'Bad Request', message: 'Invalid request data' });
        break;
      case 'timeout':
        // Simulate timeout by not responding
        setTimeout(() => {
          res.status(500).json({ error: 'Timeout', message: 'Request timed out' });
        }, 30000);
        break;
      default:
        res.status(500).json({ error: 'Unknown Error' });
    }
    return;
  }
  
  // Success response
  res.status(200).json({ data: 'success' });
};

describe('API Error Handling', () => {
  describe('HTTP Error Responses', () => {
    it('should handle 500 server errors gracefully', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/trucks',
      });

      await mockApiHandler(req, res, true, '500');

      expect(res._getStatusCode()).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Internal Server Error');
      expect(data.message).toBe('Something went wrong');
    });

    it('should handle 404 not found errors', async () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/trucks/nonexistent',
      });

      await mockApiHandler(req, res, true, '404');

      expect(res._getStatusCode()).toBe(404);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Not Found');
    });

    it('should handle 400 bad request errors', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/trucks',
        body: { invalid: 'data' },
      });

      await mockApiHandler(req, res, true, '400');

      expect(res._getStatusCode()).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Bad Request');
    });
  });

  describe('Data Validation Errors', () => {
    it('should handle invalid JSON data', () => {
      const invalidJson = '{ invalid json }';
      
      expect(() => {
        JSON.parse(invalidJson);
      }).toThrow();

      // Test graceful handling
      let result;
      try {
        result = JSON.parse(invalidJson);
      } catch (error) {
        result = { error: 'Invalid JSON data', data: null };
      }

      expect(result.error).toBe('Invalid JSON data');
      expect(result.data).toBeNull();
    });

    it('should handle missing required fields', () => {
      const validateTruckData = (data: any) => {
        const required = ['id', 'name', 'location'];
        const missing = required.filter(field => !data[field]);
        
        if (missing.length > 0) {
          throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        return data;
      };

      const invalidTruck = { name: 'Test Truck' }; // missing id and location

      expect(() => {
        validateTruckData(invalidTruck);
      }).toThrow('Missing required fields: id, location');
    });

    it('should handle type validation errors', () => {
      const validateTruckTypes = (data: any) => {
        if (typeof data.id !== 'string') {
          throw new Error('ID must be a string');
        }
        if (typeof data.name !== 'string') {
          throw new Error('Name must be a string');
        }
        if (typeof data.latitude !== 'number') {
          throw new Error('Latitude must be a number');
        }
        return data;
      };

      const invalidTruck = {
        id: 123, // should be string
        name: 'Test Truck',
        latitude: 'invalid', // should be number
      };

      expect(() => {
        validateTruckTypes(invalidTruck);
      }).toThrow('ID must be a string');
    });
  });

  describe('Database Connection Errors', () => {
    it('should handle database connection failures', async () => {
      const mockDbQuery = (shouldFail = false) => {
        if (shouldFail) {
          return Promise.reject(new Error('Database connection failed'));
        }
        return Promise.resolve({ rows: [] });
      };

      // Test successful connection
      const successResult = await mockDbQuery(false);
      expect(successResult.rows).toEqual([]);

      // Test failed connection
      try {
        await mockDbQuery(true);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Database connection failed');
      }
    });

    it('should handle query timeout errors', async () => {
      const mockTimeoutQuery = () => {
        return new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Query timeout'));
          }, 100);
        });
      };

      try {
        await mockTimeoutQuery();
        fail('Should have thrown a timeout error');
      } catch (error: any) {
        expect(error.message).toBe('Query timeout');
      }
    });
  });

  describe('External API Errors', () => {
    beforeEach(() => {
      // Mock fetch globally
      global.fetch = jest.fn();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should handle external API failures', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      
      // Mock fetch to reject
      mockFetch.mockRejectedValue(new Error('Network error'));

      const fetchExternalData = async () => {
        try {
          const response = await fetch('/external-api/data');
          return await response.json();
        } catch (error) {
          return { error: 'Failed to fetch external data', data: null };
        }
      };

      const result = await fetchExternalData();
      expect(result.error).toBe('Failed to fetch external data');
      expect(result.data).toBeNull();
    });

    it('should handle external API timeout', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      
      // Mock fetch to timeout
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 100);
        })
      );

      const fetchWithTimeout = async () => {
        try {
          const response = await fetch('/external-api/data');
          return await response.json();
        } catch (error: any) {
          if (error.message.includes('timeout')) {
            return { error: 'Request timed out', data: null };
          }
          throw error;
        }
      };

      const result = await fetchWithTimeout();
      expect(result.error).toBe('Request timed out');
    });

    it('should handle malformed external API responses', async () => {
      const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
      
      // Mock fetch to return invalid JSON
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      const fetchAndParseData = async () => {
        try {
          const response = await fetch('/external-api/data');
          return await response.json();
        } catch (error) {
          return { error: 'Invalid response format', data: null };
        }
      };

      const result = await fetchAndParseData();
      expect(result.error).toBe('Invalid response format');
    });
  });

  describe('Data Transformation Errors', () => {
    it('should handle array transformation errors', () => {
      const transformTruckData = (trucks: any[]) => {
        if (!Array.isArray(trucks)) {
          throw new Error('Expected array of trucks');
        }

        return trucks.map((truck, index) => {
          if (!truck || typeof truck !== 'object') {
            throw new Error(`Invalid truck data at index ${index}`);
          }
          
          return {
            id: truck.id || `unknown-${index}`,
            name: truck.name || 'Unknown Truck',
            location: truck.location || 'Unknown Location',
          };
        });
      };

      // Test with invalid data
      expect(() => {
        transformTruckData('not an array' as any);
      }).toThrow('Expected array of trucks');

      // Test with invalid truck object
      expect(() => {
        transformTruckData([{ id: '1', name: 'Test' }, null, { id: '3' }]);
      }).toThrow('Invalid truck data at index 1');

      // Test with valid data
      const validTrucks = [
        { id: '1', name: 'Truck 1', location: 'Location 1' },
        { id: '2', name: 'Truck 2', location: 'Location 2' },
      ];

      const result = transformTruckData(validTrucks);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
    });

    it('should handle geocoding errors', () => {
      const geocodeAddress = (address: string) => {
        if (!address || typeof address !== 'string') {
          throw new Error('Invalid address format');
        }

        if (address.length < 5) {
          throw new Error('Address too short');
        }

        // Mock geocoding logic
        const mockGeocode = (addr: string) => {
          if (addr.includes('invalid')) {
            throw new Error('Geocoding failed');
          }
          return { lat: 40.7128, lng: -74.0060 };
        };

        return mockGeocode(address);
      };

      // Test invalid inputs
      expect(() => geocodeAddress('')).toThrow('Invalid address format');
      expect(() => geocodeAddress('123')).toThrow('Address too short');
      expect(() => geocodeAddress('invalid address')).toThrow('Geocoding failed');

      // Test valid input
      const result = geocodeAddress('123 Main Street, New York, NY');
      expect(result.lat).toBe(40.7128);
      expect(result.lng).toBe(-74.0060);
    });
  });

  describe('Error Recovery and Fallbacks', () => {
    it('should implement retry logic for failed requests', async () => {
      let attemptCount = 0;
      const maxRetries = 3;

      const unreliableOperation = async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return 'Success';
      };

      const withRetry = async (operation: () => Promise<any>, retries = maxRetries) => {
        for (let i = 0; i <= retries; i++) {
          try {
            return await operation();
          } catch (error) {
            if (i === retries) {
              throw error;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
          }
        }
      };

      const result = await withRetry(unreliableOperation);
      expect(result).toBe('Success');
      expect(attemptCount).toBe(3);
    });

    it('should provide fallback data when primary source fails', async () => {
      const fallbackData = {
        trucks: [
          { id: 'fallback-1', name: 'Fallback Truck', location: 'Cached Location' }
        ]
      };

      const fetchWithFallback = async () => {
        try {
          // Simulate primary source failure
          throw new Error('Primary source unavailable');
        } catch (error) {
          console.warn('Using fallback data:', error);
          return {
            data: fallbackData,
            source: 'fallback',
            error: 'Primary source failed, using cached data',
          };
        }
      };

      const result = await fetchWithFallback();
      expect(result.source).toBe('fallback');
      expect(result.data.trucks).toHaveLength(1);
      expect(result.error).toContain('Primary source failed');
    });

    it('should gracefully degrade features when services are unavailable', () => {
      const getFeatureFlags = (serviceAvailable = true) => {
        if (!serviceAvailable) {
          return {
            searchEnabled: false,
            mapsEnabled: false,
            favoritesEnabled: false,
            reviewsEnabled: false,
            basicListingEnabled: true, // Always available
          };
        }

        return {
          searchEnabled: true,
          mapsEnabled: true,
          favoritesEnabled: true,
          reviewsEnabled: true,
          basicListingEnabled: true,
        };
      };

      // Test when services are available
      const fullFeatures = getFeatureFlags(true);
      expect(fullFeatures.searchEnabled).toBe(true);
      expect(fullFeatures.mapsEnabled).toBe(true);

      // Test when services are down
      const degradedFeatures = getFeatureFlags(false);
      expect(degradedFeatures.searchEnabled).toBe(false);
      expect(degradedFeatures.mapsEnabled).toBe(false);
      expect(degradedFeatures.basicListingEnabled).toBe(true); // Core functionality preserved
    });
  });
});
