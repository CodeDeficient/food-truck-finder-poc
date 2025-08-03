// @ts-expect-error TS(2792): Cannot find module '@playwright/test'. Did you mea... Remove this comment to see the full error message
import { defineConfig, devices } from '@playwright/test';
// @ts-expect-error TS(2792): Cannot find module 'dotenv'. Did you mean to set t... Remove this comment to see the full error message
import dotenv from 'dotenv';
// Load environment variables from .env.local for tests
dotenv.config({ path: '.env.local' });
/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests',
    /* Global setup to ensure environment variables are loaded */
    globalSetup: './tests/utils/testSetup.ts',
    /* Run tests in files in parallel */
    fullyParallel: false, // Disabled for E2E tests that modify shared state
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.BASE_URL || 'http://localhost:3002',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        /* Screenshot on failure */
        screenshot: 'only-on-failure',
        /* Video recording on failure */
        video: 'retain-on-failure',
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Uncomment for cross-browser testing
        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },
        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },
    ],
    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://127.0.0.1:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000, // 2 minutes for server startup
    },
    /* Global test timeout */
    timeout: 5 * 60 * 1000, // 5 minutes for pipeline tests
    /* Expect timeout */
    expect: {
        timeout: 30 * 1000, // 30 seconds
    },
    /* Test output directory */
    outputDir: 'test-results/',
});
