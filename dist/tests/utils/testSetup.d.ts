export declare const TEST_CONFIG: {
    apiBaseUrl: string;
    testTimeout: number;
    maxRetries: number;
    cleanupTimeout: number;
};
export declare const MOCK_FOOD_TRUCK: {
    name: string;
    description: string;
    current_location: {
        lat: number;
        lng: number;
        address: string;
        timestamp: string;
    };
    contact_info: {
        phone: string;
        email: string;
        website: string;
    };
    social_media: {
        instagram: string;
        facebook: string;
    };
    menu: {
        category: string;
        items: {
            name: string;
            description: string;
            price: number;
            dietary_tags: string[];
        }[];
    }[];
    operating_hours: {
        monday: {
            open: string;
            close: string;
            closed: boolean;
        };
        tuesday: {
            open: string;
            close: string;
            closed: boolean;
        };
        wednesday: {
            open: string;
            close: string;
            closed: boolean;
        };
        thursday: {
            open: string;
            close: string;
            closed: boolean;
        };
        friday: {
            open: string;
            close: string;
            closed: boolean;
        };
        saturday: {
            open: string;
            close: string;
            closed: boolean;
        };
        sunday: {
            open: string;
            close: string;
            closed: boolean;
        };
    };
    source_urls: string[];
    last_scraped_at: string;
    is_active: boolean;
};
/**
 * Clean up test data from database
 */
export declare function cleanupTestData(): Promise<void>;
/**
 * Set up test data in database
 */
export declare function setupTestData(): Promise<void>;
/**
 * Wait for condition with timeout
 */
export declare function waitForCondition(condition: () => Promise<boolean>, timeoutMs?: number): Promise<boolean>;
/**
 * Global setup function for Playwright tests
 * This ensures environment variables are loaded before any tests run
 */
export default function globalSetup(): Promise<void>;
