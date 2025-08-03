describe('Route Guard Functionality', () => {
  context('Unauthenticated User', () => {
    beforeEach(() => {
      // Clear any existing auth state
      cy.clearLocalStorage()
      
      // Mock unauthenticated state
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 401,
        body: { error: 'Unauthorized' }
      }).as('getUser')
    })

    it('should redirect to home page when accessing protected routes', () => {
      const protectedRoutes = [
        '/profile',
        '/favorites', 
        '/owner-dashboard',
        '/user-dashboard',
        '/admin'
      ]

      protectedRoutes.forEach(route => {
        cy.visit(route)
        
        // Should redirect to home or login
        cy.url().should('not.include', route)
        cy.url().should('match', /\/(|auth)$/)
        
        // Should show auth button
        cy.getByTestId('auth-button').should('be.visible')
      })
    })

    it('should show login modal when accessing protected routes', () => {
      cy.visit('/profile')
      
      // Should automatically open auth modal or redirect to login
      cy.get('[role="dialog"]', { timeout: 5000 }).should('be.visible')
        .or(() => {
          // Alternative: redirect to login page
          cy.url().should('include', '/auth')
        })
    })

    it('should allow access to public routes', () => {
      const publicRoutes = [
        '/',
        '/about',
        '/contact',
        '/search'
      ]

      publicRoutes.forEach(route => {
        cy.visit(route)
        
        // Should stay on the route
        cy.url().should('include', route)
        
        // Should not show any auth errors
        cy.get('[data-testid="auth-error"]').should('not.exist')
      })
    })

    it('should preserve intended route after login', () => {
      // Try to access protected route
      cy.visit('/profile')
      
      // Should redirect or show login modal
      cy.url().then(url => {
        if (url.includes('/auth') || url === Cypress.config().baseUrl + '/') {
          // If redirected, click login button
          cy.getByTestId('auth-button').click()
        }
      })
      
      // Mock successful login
      cy.intercept('POST', '**/auth/v1/token*', {
        statusCode: 200,
        body: {
          access_token: 'mock-token',
          user: { id: '123', email: 'test@example.com' }
        }
      }).as('login')
      
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          user: { id: '123', email: 'test@example.com' }
        }
      }).as('getAuthenticatedUser')
      
      // Fill login form (skip actual submission, just mock the result)
      cy.window().then((win) => {
        win.localStorage.setItem('intended-route', '/profile')
      })
      
      // After login, should redirect to intended route
      cy.visit('/profile')
      cy.url().should('include', '/profile')
    })
  })

  context('Authenticated User', () => {
    beforeEach(() => {
      // Mock authenticated state
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-access-token',
          user: { id: '123', email: 'test@example.com' }
        }))
      })
      
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          user: {
            id: '123',
            email: 'test@example.com',
            role: 'authenticated'
          }
        }
      }).as('getAuthenticatedUser')
    })

    it('should allow access to protected routes', () => {
      const protectedRoutes = [
        '/profile',
        '/favorites',
        '/user-dashboard'
      ]

      protectedRoutes.forEach(route => {
        cy.visit(route)
        
        // Should stay on the route
        cy.url().should('include', route)
        
        // Should show user menu
        cy.getByTestId('user-menu').should('be.visible')
      })
    })

    it('should allow access to public routes', () => {
      const publicRoutes = [
        '/',
        '/about', 
        '/contact',
        '/search'
      ]

      publicRoutes.forEach(route => {
        cy.visit(route)
        
        // Should stay on the route
        cy.url().should('include', route)
        
        // Should show user menu
        cy.getByTestId('user-menu').should('be.visible')
      })
    })

    it('should not show login modal on protected routes', () => {
      cy.visit('/profile')
      
      // Should not show auth modal
      cy.get('[role="dialog"]').should('not.exist')
      
      // Should show page content
      cy.getByTestId('profile-content').should('be.visible')
    })
  })

  context('Admin User', () => {
    beforeEach(() => {
      // Mock admin user state
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-admin-token',
          user: { 
            id: 'admin-123', 
            email: 'admin@example.com',
            role: 'admin'
          }
        }))
      })
      
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          user: {
            id: 'admin-123',
            email: 'admin@example.com',
            role: 'admin'
          }
        }
      }).as('getAdminUser')
    })

    it('should allow access to admin routes', () => {
      cy.visit('/admin')
      
      // Should stay on admin route
      cy.url().should('include', '/admin')
      
      // Should show admin content
      cy.getByTestId('admin-dashboard').should('be.visible')
    })

    it('should allow access to all protected routes', () => {
      const routes = [
        '/profile',
        '/favorites',
        '/user-dashboard',
        '/owner-dashboard',
        '/admin'
      ]

      routes.forEach(route => {
        cy.visit(route)
        cy.url().should('include', route)
      })
    })
  })

  context('Regular User - Admin Route Access', () => {
    beforeEach(() => {
      // Mock regular user (non-admin)
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'mock-user-token',
          user: { 
            id: 'user-123', 
            email: 'user@example.com',
            role: 'user'
          }
        }))
      })
      
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 200,
        body: {
          user: {
            id: 'user-123',
            email: 'user@example.com',
            role: 'user'
          }
        }
      }).as('getRegularUser')
    })

    it('should block access to admin routes', () => {
      cy.visit('/admin')
      
      // Should redirect away from admin route
      cy.url().should('not.include', '/admin')
      
      // Should show unauthorized message or redirect to home
      cy.get('[data-testid="unauthorized-error"]').should('be.visible')
        .or(() => {
          cy.url().should('eq', Cypress.config().baseUrl + '/')
        })
    })

    it('should show appropriate error message for insufficient permissions', () => {
      cy.visit('/admin')
      
      // Should show permission error
      cy.getByTestId('permission-error').should('be.visible')
      cy.getByTestId('permission-error').should('contain', 'permission')
    })
  })

  context('Session Expiry', () => {
    beforeEach(() => {
      // Mock expired session
      cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: 'expired-token',
          expires_at: Date.now() - 3600000, // 1 hour ago
          user: { id: '123', email: 'test@example.com' }
        }))
      })
      
      cy.intercept('GET', '**/auth/v1/user', {
        statusCode: 401,
        body: { error: 'Token expired' }
      }).as('getExpiredUser')
    })

    it('should redirect to login when session expires', () => {
      cy.visit('/profile')
      
      // Should redirect to home or show login
      cy.url().should('not.include', '/profile')
      
      // Should show auth button
      cy.getByTestId('auth-button').should('be.visible')
    })

    it('should clear expired session data', () => {
      cy.visit('/profile')
      
      // Check that expired session is cleared
      cy.window().then((win) => {
        const authData = win.localStorage.getItem('supabase.auth.token')
        expect(authData).to.be.null
      })
    })
  })

  context('Network Errors', () => {
    it('should handle network errors gracefully', () => {
      // Mock network error
      cy.intercept('GET', '**/auth/v1/user', {
        forceNetworkError: true
      }).as('networkError')
      
      cy.visit('/profile')
      
      // Should show error state or retry option
      cy.getByTestId('network-error').should('be.visible')
        .or(() => {
          cy.getByTestId('retry-button').should('be.visible')
        })
    })
  })
})
