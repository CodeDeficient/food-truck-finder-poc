// Custom Cypress commands for error handling tests

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Simulate a network error for API requests
       */
      simulateNetworkError(apiEndpoint: string): Chainable<void>;
      
      /**
       * Simulate a 500 server error
       */
      simulate500Error(apiEndpoint: string): Chainable<void>;
      
      /**
       * Wait for error message to appear and verify graceful degradation
       */
      waitForErrorFallback(fallbackText: string): Chainable<void>;
      
      /**
       * Check that page doesn't crash on error
       */
      verifyPageStability(): Chainable<void>;
      
      /**
       * Simulate slow network conditions
       */
      simulateSlowNetwork(delay: number): Chainable<void>;
    }
  }
}

Cypress.Commands.add('simulateNetworkError', (apiEndpoint: string) => {
  cy.intercept('GET', `**/${apiEndpoint}**`, {
    forceNetworkError: true,
  }).as('networkError');
});

Cypress.Commands.add('simulate500Error', (apiEndpoint: string) => {
  cy.intercept('GET', `**/${apiEndpoint}**`, {
    statusCode: 500,
    body: {
      error: 'Internal Server Error',
      message: 'Something went wrong on the server',
    },
  }).as('serverError');
});

Cypress.Commands.add('waitForErrorFallback', (fallbackText: string) => {
  cy.contains(fallbackText, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('verifyPageStability', () => {
  // Check that the page is still responsive and hasn't crashed
  cy.get('body').should('exist');
  cy.get('body').should('be.visible');
  
  // Verify that main navigation or header is still present
  cy.get('header, nav, [data-testid="app-header"]', { timeout: 5000 })
    .should('exist')
    .and('be.visible');
});

Cypress.Commands.add('simulateSlowNetwork', (delay: number) => {
  cy.intercept('GET', '/api/**', (req) => {
    // Add delay to simulate slow network
    req.reply((res) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(res);
        }, delay);
      });
    });
  }).as('slowNetwork');
});

// Additional utility commands
Cypress.Commands.add('mockFailedApiResponse', (endpoint: string, errorType: 'network' | '500' | 'timeout') => {
  switch (errorType) {
    case 'network':
      cy.intercept('GET', endpoint, { forceNetworkError: true }).as('failedRequest');
      break;
    case '500':
      cy.intercept('GET', endpoint, { statusCode: 500, body: { error: 'Server Error' } }).as('failedRequest');
      break;
    case 'timeout':
      cy.intercept('GET', endpoint, (req) => {
        req.reply((res) => {
          return new Promise((resolve) => {
            // Simulate timeout after 30 seconds
            setTimeout(() => resolve(res), 30000);
          });
        });
      }).as('failedRequest');
      break;
  }
});

export {};
