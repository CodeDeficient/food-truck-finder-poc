// lib/dataValidator.test.ts
import { DataQualityAssessor } from '@/lib/ScraperEngine';

describe('DataQualityAssessor', () => {
  let assessor: DataQualityAssessor;

  beforeEach(() => {
    assessor = new DataQualityAssessor();
  });

  describe('assessTruckData', () => {
    it('should give high score for complete truck data', () => {
      const truckData = {
        name: 'Awesome Food Truck',
        location: {
          current: {
            lat: 37.7749,
            lng: -122.4194,
            address: '123 Main St, San Francisco, CA',
          },
        },
        contact: {
          phone: '+1-555-123-4567',
          email: 'contact@awesomefoodtruck.com',
        },
        operating_hours: {
          monday: { open: '11:00', close: '15:00', closed: false },
          tuesday: { open: '11:00', close: '15:00', closed: false },
          wednesday: { open: '11:00', close: '15:00', closed: false },
          thursday: { open: '11:00', close: '15:00', closed: false },
          friday: { open: '11:00', close: '20:00', closed: false },
          saturday: { open: '12:00', close: '20:00', closed: false },
          sunday: { open: '12:00', close: '16:00', closed: true },
        },
        menu: [
          {
            category: 'Burgers',
            items: [
              {
                name: 'Classic Burger',
                description: 'Beef patty with lettuce, tomato, and cheese',
                price: 12.99,
                dietary_tags: ['gluten-free-bun-available'],
              },
            ],
          },
        ],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.score).toBeGreaterThan(0.8);
      expect(result.issues).toHaveLength(0);
    });

    it('should give low score for incomplete truck data', () => {
      const truckData = {
        name: 'Incomplete Truck',
        location: {},
        menu: [],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.score).toBeLessThan(0.5);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues).toContain('Missing current location data'); // Corrected string
      expect(result.issues).toContain('Missing menu information'); // Corrected string (was 'No menu data available')
    });

    it('should identify invalid phone numbers', () => {
      const truckData = {
        name: 'Test Truck',
        location: {},
        contact: {
          phone: 'invalid-phone',
          email: 'valid@email.com',
        },
        menu: [],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.issues).toContain('Invalid phone number format');
    });

    it('should identify invalid email addresses', () => {
      const truckData = {
        name: 'Test Truck',
        location: {},
        contact: {
          phone: '+1-555-123-4567',
          email: 'invalid-email',
        },
        menu: [],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.issues).toContain('Invalid email format');
    });

    it('should handle menu validation correctly', () => {
      const truckData = {
        name: 'Test Truck',
        location: {},
        menu: [
          {
            category: 'Invalid Menu',
            items: [
              {
                name: 'Item with negative price',
                price: -5,
                dietary_tags: [],
              },
              {
                name: '', // Empty name
                price: 10,
                dietary_tags: [],
              },
            ],
          },
        ],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.issues).toContain('Menu item "Item with negative price" has invalid price'); // Corrected string
      expect(result.issues).toContain('Menu item 2 in "Invalid Menu" missing name'); // Corrected string
    });

    it('should handle missing name gracefully', () => {
      const truckData = {
        name: '',
        location: {},
        menu: [],
        last_updated: new Date().toISOString(),
      };

      const result = assessor.assessTruckData(truckData);

      expect(result.issues).toContain('Missing or empty truck name'); // Corrected string
    });
  });
});
