import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'tests/error-handling/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/error-handling/support/e2e.ts',
    videosFolder: 'tests/error-handling/videos',
    screenshotsFolder: 'tests/error-handling/screenshots',
    fixturesFolder: 'tests/error-handling/fixtures',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    env: {
      // Environment variables for error testing
      FORCE_ERROR_SCENARIOS: true,
    },
  },

  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'tests/error-handling/**/*.component.cy.{js,jsx,ts,tsx}',
  },
});
