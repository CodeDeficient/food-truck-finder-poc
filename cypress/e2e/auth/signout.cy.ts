describe('Sign-out Functionality', () => {
  beforeEach(() => {
    // Setup: Mock being logged in
    cy.visit('/')
    
    // Set up authentication state
    cy.window().then((win) => {
      // Mock localStorage with user session
      win.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_at: Date.now() + 3600000, // 1 hour from now
        user: {
          id: 'mock-user-id',
          email: 'test@example.com'
        }
      }))
    })
    
    // Intercept auth state calls
    cy.intercept('GET', '**/auth/v1/user', {
      statusCode: 200,
      body: {
        user: {
          id: 'mock-user-id',
          email: 'test@example.com',
          role: 'authenticated'
        }
      }
    }).as('getUser')
    
    cy.reload()
  })

  it('should display user menu when authenticated', () => {
    // User menu should be visible
    cy.getByTestId('user-menu').should('be.visible')
    
    // Auth button should not be visible
    cy.getByTestId('auth-button').should('not.exist')
  })

  it('should display logout option in user menu', () => {
    // Click user menu
    cy.getByTestId('user-menu').click()
    
    // Should show dropdown with logout option
    cy.getByTestId('logout-button').should('be.visible')
    cy.getByTestId('logout-button').should('contain', 'Sign out')
  })

  it('should successfully log out user', () => {
    // Intercept logout request
    cy.intercept('POST', '**/auth/v1/logout', {
      statusCode: 204
    }).as('logoutRequest')
    
    // Click user menu and logout
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Should make logout request
    cy.wait('@logoutRequest')
    
    // Should show auth button again
    cy.getByTestId('auth-button').should('be.visible')
    
    // User menu should not exist
    cy.getByTestId('user-menu').should('not.exist')
  })

  it('should clear user session data on logout', () => {
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Check that localStorage is cleared
    cy.window().then((win) => {
      const authData = win.localStorage.getItem('supabase.auth.token')
      expect(authData).to.be.null
    })
  })

  it('should redirect to home page after logout', () => {
    // Start on a protected page (if user was on one)
    cy.visit('/profile')
    
    // Logout
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Should redirect to home
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should show loading state during logout', () => {
    // Intercept logout request with delay
    cy.intercept('POST', '**/auth/v1/logout', {
      statusCode: 204,
      delay: 1000
    }).as('logoutRequest')
    
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Should show loading state
    cy.getByTestId('logout-loading').should('be.visible')
    cy.getByTestId('logout-button').should('be.disabled')
  })

  it('should handle logout errors gracefully', () => {
    // Intercept logout request with error
    cy.intercept('POST', '**/auth/v1/logout', {
      statusCode: 500,
      body: { message: 'Server error' }
    }).as('logoutError')
    
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    cy.wait('@logoutError')
    
    // Should show error message
    cy.getByTestId('logout-error').should('be.visible')
    cy.getByTestId('logout-error').should('contain', 'error')
    
    // User should still be logged in
    cy.getByTestId('user-menu').should('be.visible')
  })

  it('should close user menu when clicking outside', () => {
    // Open user menu
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').should('be.visible')
    
    // Click outside
    cy.get('body').click(0, 0)
    
    // Menu should close
    cy.getByTestId('logout-button').should('not.be.visible')
  })

  it('should allow re-login after logout', () => {
    // Logout first
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Should show auth button
    cy.getByTestId('auth-button').should('be.visible')
    
    // Click to open login modal
    cy.getByTestId('auth-button').click()
    
    // Should show login form
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should maintain logout state across page refreshes', () => {
    // Logout
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // Refresh page
    cy.reload()
    
    // Should still be logged out
    cy.getByTestId('auth-button').should('be.visible')
    cy.getByTestId('user-menu').should('not.exist')
  })

  it('should show confirmation dialog for logout (if implemented)', () => {
    cy.getByTestId('user-menu').click()
    cy.getByTestId('logout-button').click()
    
    // If confirmation dialog is implemented
    cy.get('[data-testid="logout-confirm"]').then(($el) => {
      if ($el.length > 0) {
        cy.getByTestId('logout-confirm').should('be.visible')
        cy.getByTestId('confirm-logout').click()
      }
    })
  })
})
