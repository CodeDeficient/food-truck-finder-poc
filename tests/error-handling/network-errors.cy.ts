/**
 * Network Error Scenarios - Cypress E2E Tests
 * Tests graceful degradation when network requests fail
 */

describe('Network Error Scenarios', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/');
  });

  describe('API 500 Server Errors', () => {
    it('should handle 500 error on trucks API gracefully', () => {
      // Simulate 500 error for trucks API
      cy.simulate500Error('api/trucks');
      
      // Visit the page
      cy.visit('/');
      
      // Wait for the error to occur
      cy.wait('@serverError');
      
      // Verify the page doesn't crash and shows appropriate fallback
      cy.verifyPageStability();
      
      // Check for fallback content
      cy.get('body').should('contain', 'Unable to load food trucks');
      
      // Verify error message or loading state
      cy.contains(/error|unable to load|try again/i).should('be.visible');
    });

    it('should handle 500 error on location API gracefully', () => {
      cy.simulate500Error('api/location');
      cy.visit('/');
      
      cy.verifyPageStability();
      
      // Should still show the map or location fallback
      cy.get('[data-testid="map-container"], [data-testid="location-fallback"]')
        .should('exist');
    });

    it('should handle 500 error on user API gracefully', () => {
      cy.simulate500Error('api/auth/user');
      cy.visit('/');
      
      cy.verifyPageStability();
      
      // Should show default user state (logged out)
      cy.get('body').should('not.contain', 'Profile');
    });
  });

  describe('Network Connection Errors', () => {
    it('should handle network failures on initial load', () => {
      // Simulate network error for all API calls
      cy.simulateNetworkError('api');
      
      cy.visit('/');
      
      // Verify page stability
      cy.verifyPageStability();
      
      // Should show offline or connection error message
      cy.contains(/offline|connection|network/i, { timeout: 10000 })
        .should('be.visible');
    });

    it('should handle intermittent network failures', () => {
      // Start with working network
      cy.visit('/');
      
      // Then simulate network failure
      cy.simulateNetworkError('api/trucks');
      
      // Try to refresh or reload data
      cy.get('[data-testid="refresh-button"], button')
        .contains(/refresh|reload/i)
        .click({ force: true });
      
      cy.verifyPageStability();
      
      // Should show error state but maintain app structure
      cy.get('header, nav').should('be.visible');
    });

    it('should retry failed requests and recover', () => {
      let requestCount = 0;
      
      // Intercept and fail first request, succeed on retry
      cy.intercept('GET', '**/api/trucks', (req) => {
        requestCount++;
        if (requestCount === 1) {
          req.reply({ statusCode: 500, body: { error: 'Server Error' } });
        } else {
          req.reply({ fixture: 'trucks.json' });
        }
      }).as('trucksRequest');
      
      cy.visit('/');
      
      // Wait for first failed request
      cy.wait('@trucksRequest');
      
      // Should show error state initially
      cy.contains(/error|unable/i).should('be.visible');
      
      // Trigger retry (could be automatic or manual)
      cy.get('[data-testid="retry-button"], button')
        .contains(/retry|try again/i)
        .click({ force: true });
      
      // Wait for successful retry
      cy.wait('@trucksRequest');
      
      // Should recover and show data
      cy.verifyPageStability();
    });
  });

  describe('Slow Network Conditions', () => {
    it('should show loading states during slow requests', () => {
      // Simulate slow network (5 second delay)
      cy.simulateSlowNetwork(5000);
      
      cy.visit('/');
      
      // Should show loading indicator
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('be.visible');
      
      // Wait for slow request to complete
      cy.wait('@slowNetwork');
      
      // Loading should disappear
      cy.get('[data-testid="loading"], .loading, .spinner')
        .should('not.exist');
      
      cy.verifyPageStability();
    });

    it('should handle timeout scenarios', () => {
      // Set up request that times out
      cy.intercept('GET', '**/api/trucks', (req) => {
        // Never resolve the request (simulating timeout)
        req.reply((res) => {
          return new Promise(() => {
            // Promise never resolves
          });
        });
      }).as('timeoutRequest');
      
      cy.visit('/');
      
      // After reasonable time, should show timeout error
      cy.contains(/timeout|taking too long/i, { timeout: 15000 })
        .should('be.visible');
      
      cy.verifyPageStability();
    });
  });

  describe('Progressive Enhancement', () => {
    it('should work with JavaScript disabled', () => {
      // Disable JavaScript
      cy.visit('/', {
        onBeforeLoad: (win) => {
          // Mock window.fetch to throw errors
          win.fetch = () => Promise.reject(new Error('JS Disabled'));
        },
      });
      
      // Basic HTML should still be functional
      cy.get('body').should('exist');
      cy.get('header, nav, main').should('exist');
      
      // Should show no-JS fallback message
      cy.contains(/enable javascript|upgrade your browser/i)
        .should('be.visible');
    });

    it('should show fallback content when dynamic loading fails', () => {
      // Mock all dynamic imports to fail
      cy.window().then((win) => {
        const originalImport = win.eval('import');
        win.eval = (code) => {
          if (code.includes('import(')) {
            throw new Error('Dynamic import failed');
          }
          return originalImport;
        };
      });
      
      cy.visit('/');
      
      // Should still render basic structure
      cy.verifyPageStability();
      
      // May show simplified version or static content
      cy.get('main').should('be.visible');
    });
  });

  describe('Error Recovery', () => {
    it('should recover from errors when network is restored', () => {
      // Start with network error
      cy.simulateNetworkError('api/trucks');
      cy.visit('/');
      
      // Verify error state
      cy.contains(/error|unable/i).should('be.visible');
      
      // Clear network error simulation
      cy.intercept('GET', '**/api/trucks', { fixture: 'trucks.json' }).as('trucksRecovered');
      
      // Trigger retry or wait for automatic retry
      cy.get('[data-testid="retry-button"], button')
        .contains(/retry|refresh/i)
        .click({ force: true });
      
      cy.wait('@trucksRecovered');
      
      // Should recover successfully
      cy.verifyPageStability();
      cy.contains(/error|unable/i).should('not.exist');
    });

    it('should maintain user state during error recovery', () => {
      // Set up initial state (e.g., search query)
      cy.visit('/');
      cy.get('input[type="search"], input[placeholder*="search"]')
        .type('pizza', { force: true });
      
      // Simulate error
      cy.simulate500Error('api/trucks');
      
      // Trigger search that will fail
      cy.get('button[type="submit"], [data-testid="search-button"]')
        .click({ force: true });
      
      cy.wait('@serverError');
      
      // Verify search input is still populated
      cy.get('input[type="search"], input[placeholder*="search"]')
        .should('have.value', 'pizza');
      
      // Error message should be shown
      cy.contains(/error|unable/i).should('be.visible');
      
      cy.verifyPageStability();
    });
  });

  describe('Critical Path Protection', () => {
    it('should protect core functionality from API failures', () => {
      // Simulate failure of non-critical APIs
      cy.simulate500Error('api/reviews');
      cy.simulate500Error('api/favorites');
      
      cy.visit('/');
      
      // Core functionality should still work
      cy.verifyPageStability();
      
      // Main truck listing should be visible (if trucks API works)
      cy.intercept('GET', '**/api/trucks', { fixture: 'trucks.json' });
      cy.visit('/');
      
      // Should show trucks even if reviews/favorites fail
      cy.get('[data-testid="truck-list"], .truck-card').should('exist');
    });

    it('should degrade gracefully when multiple APIs fail', () => {
      // Simulate multiple API failures
      cy.simulate500Error('api/trucks');
      cy.simulate500Error('api/location');
      cy.simulate500Error('api/user');
      
      cy.visit('/');
      
      // Should still show basic page structure
      cy.verifyPageStability();
      
      // Should show appropriate error messaging
      cy.contains(/temporarily unavailable|please try again/i)
        .should('be.visible');
      
      // Basic navigation should still work
      cy.get('header a, nav a').first().click({ force: true });
      cy.verifyPageStability();
    });
  });
});

describe('Error Monitoring and Reporting', () => {
  it('should log errors for monitoring', () => {
    // Set up error tracking
    cy.window().then((win) => {
      win.errorLog = [];
      
      // Override console.error to capture errors
      const originalError = win.console.error;
      win.console.error = (...args) => {
        win.errorLog.push(args);
        originalError.apply(win.console, args);
      };
    });
    
    // Trigger error
    cy.simulate500Error('api/trucks');
    cy.visit('/');
    cy.wait('@serverError');
    
    // Verify error was logged
    cy.window().its('errorLog').should('have.length.greaterThan', 0);
  });

  it('should provide helpful error information to users', () => {
    cy.simulate500Error('api/trucks');
    cy.visit('/');
    cy.wait('@serverError');
    
    // Error message should be helpful, not technical
    cy.contains(/we're having trouble|please try again|check your connection/i)
      .should('be.visible');
    
    // Should not show technical error details to users
    cy.contains(/500|internal server error|stack trace/i)
      .should('not.exist');
  });
});
