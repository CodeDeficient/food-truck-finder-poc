// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to get element by test id
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

// Custom command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/')
  
  // Open auth modal
  cy.getByTestId('auth-button').click()
  
  // Switch to login tab if on signup
  cy.get('[data-testid="login-tab"]').click()
  
  // Fill login form
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  
  // Submit form
  cy.get('button[type="submit"]').click()
  
  // Wait for login to complete
  cy.url().should('not.include', '/auth')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  // Click on user menu/avatar
  cy.getByTestId('user-menu').click()
  
  // Click logout button
  cy.getByTestId('logout-button').click()
  
  // Wait for logout to complete
  cy.getByTestId('auth-button').should('be.visible')
})
