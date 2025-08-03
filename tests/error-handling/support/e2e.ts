// Cypress support file for error handling tests
import './commands';

// Global error handling setup
Cypress.on('uncaught:exception', (err, runnable) => {
  // Log the error for debugging
  console.log('Uncaught exception:', err.message);
  
  // For error scenario tests, we might want to allow certain errors
  // Return false to prevent the test from failing on expected errors
  if (err.message.includes('Network request failed') || 
      err.message.includes('500') ||
      err.message.includes('Internal Server Error')) {
    return false;
  }
  
  // Let other errors fail the test
  return true;
});

// Handle fetch errors specifically
Cypress.on('window:before:load', (win) => {
  // Store original fetch
  const originalFetch = win.fetch;
  
  // Mock fetch for error scenarios
  win.fetch = function(...args) {
    const url = args[0];
    
    // Check if we should simulate network errors
    if (Cypress.env('FORCE_ERROR_SCENARIOS') && typeof url === 'string') {
      if (url.includes('/api/trucks') && url.includes('force-500')) {
        return Promise.reject(new Error('Network request failed'));
      }
      
      if (url.includes('/api/') && url.includes('simulate-timeout')) {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 1000);
        });
      }
    }
    
    return originalFetch.apply(this, args);
  };
});

// Setup for intercepting and modifying network requests
beforeEach(() => {
  // Common setup for error scenario tests
  cy.window().then((win) => {
    // Add global error handlers
    win.addEventListener('error', (event) => {
      console.log('Window error:', event.error);
    });
    
    win.addEventListener('unhandledrejection', (event) => {
      console.log('Unhandled promise rejection:', event.reason);
    });
  });
});
