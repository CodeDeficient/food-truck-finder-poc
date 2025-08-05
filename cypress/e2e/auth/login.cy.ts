describe('Login Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display login modal when clicking login button', () => {
    // Click the auth/login button
    cy.getByTestId('auth-button').click()
    
    // Verify modal is visible
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('[data-testid="login-tab"]').should('be.visible')
  })

  it('should allow user to switch between login and signup tabs', () => {
    cy.getByTestId('auth-button').click()
    
    // Click signup tab
    cy.get('[data-testid="signup-tab"]').click()
    cy.get('[data-testid="signup-form"]').should('be.visible')
    
    // Click login tab
    cy.get('[data-testid="login-tab"]').click()
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should show validation errors for empty login form', () => {
    cy.getByTestId('auth-button').click()
    cy.get('[data-testid="login-tab"]').click()
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click()
    
    // Should show validation errors
    cy.get('[data-testid="email-error"]').should('be.visible')
    cy.get('[data-testid="password-error"]').should('be.visible')
  })

  it('should show error for invalid email format', () => {
    cy.getByTestId('auth-button').click()
    cy.get('[data-testid="login-tab"]').click()
    
    // Enter invalid email
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Should show email format error
    cy.get('[data-testid="email-error"]').should('contain', 'valid email')
  })

  it('should show error for invalid credentials', () => {
    cy.getByTestId('auth-button').click()
    cy.get('[data-testid="login-tab"]').click()
    
    // Enter invalid credentials
    cy.get('input[type="email"]').type('nonexistent@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    // Should show login error
    cy.get('[data-testid="login-error"]').should('be.visible')
    cy.get('[data-testid="login-error"]').should('contain', 'Invalid')
  })

  it('should close modal when clicking close button', () => {
    cy.getByTestId('auth-button').click()
    
    // Click close button
    cy.get('[data-testid="close-modal"]').click()
    
    // Modal should be hidden
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should close modal when clicking outside', () => {
    cy.getByTestId('auth-button').click()
    
    // Click outside modal (on backdrop)
    cy.get('[data-testid="modal-backdrop"]').click({ force: true })
    
    // Modal should be hidden
    cy.get('[role="dialog"]').should('not.exist')
  })

  // Note: This test would require valid test credentials
  it.skip('should successfully login with valid credentials', () => {
    const testEmail = Cypress.env('TEST_EMAIL') || 'test@example.com'
    const testPassword = Cypress.env('TEST_PASSWORD') || 'testpassword123'
    
    cy.login(testEmail, testPassword)
    
    // Should redirect to dashboard or home page
    cy.url().should('not.include', '/auth')
    
    // Should show user menu instead of login button
    cy.getByTestId('user-menu').should('be.visible')
    cy.getByTestId('auth-button').should('not.exist')
  })

  it('should handle OAuth login options', () => {
    cy.getByTestId('auth-button').click()
    cy.get('[data-testid="login-tab"]').click()
    
    // Check for OAuth buttons
    cy.get('[data-testid="google-oauth"]').should('be.visible')
    cy.get('[data-testid="google-oauth"]').should('contain', 'Google')
    
    // Note: We can't test actual OAuth flow in Cypress easily
    // This just verifies the UI elements are present
  })

  it('should show loading state during login attempt', () => {
    cy.getByTestId('auth-button').click()
    cy.get('[data-testid="login-tab"]').click()
    
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('password123')
    
    // Intercept the login request to make it slower
    cy.intercept('POST', '**/auth/v1/token*', {
      delay: 1000,
    }).as('loginRequest')
    
    cy.get('button[type="submit"]').click()
    
    // Should show loading state
    cy.get('[data-testid="login-loading"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.disabled')
  })
})
