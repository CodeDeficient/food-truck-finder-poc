// Load environment variables from .env file
require('dotenv').config({ path: '.env.local' }); // Common Next.js .env file
// Or, if you use a general .env file:
// require('dotenv').config();

// You can add other global setup here if needed, e.g., jest-specific matchers.
// jest.setTimeout(10000); // Example: increase default timeout for tests
