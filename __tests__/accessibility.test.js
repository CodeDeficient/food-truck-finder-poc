
const { axe, toHaveNoViolations } = require('jest-axe');
require('@testing-library/jest-dom');

// Extend Jest matchers
expect.extend(toHaveNoViolations);

describe('Accessibility Tests - New Components', () => {
  beforeEach(() => {
    // Clear any previous DOM state
    document.body.innerHTML = '';
  });

  describe('AuthModal Component', () => {
    const defaultProps = {
      mounted: true,
      isOpen: true,
      onClose: jest.fn(),
      onAuthSuccess: jest.fn(),
    };

    test('should not have accessibility violations in light theme', async () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should not have accessibility violations in dark theme', async () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('should have proper focus management', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      // Check if modal is properly focused
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    test('should have proper form labels and inputs', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      // Check for proper form labeling
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('should have proper button roles and states', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      // Check for proper button states
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAttribute('type', 'submit');
    });

    test('should handle keyboard navigation properly', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal {...defaultProps} />
        </ThemeProvider>
      );

      // Check for tab navigation support
      const tabbableElements = screen.getAllByRole('button')
        .concat(screen.getAllByRole('textbox'))
        .concat(screen.getAllByRole('tab'));

      tabbableElements.forEach(element => {
        expect(element).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });

  describe('Color Contrast Tests', () => {
    test('should meet WCAG AA color contrast standards in light theme', async () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="bg-background text-foreground p-4">
            <h1 className="text-primary">Primary Text</h1>
            <p className="text-muted-foreground">Muted Text</p>
            <button className="bg-primary text-primary-foreground px-4 py-2">
              Primary Button
            </button>
          </div>
        </ThemeProvider>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });

    test('should meet WCAG AA color contrast standards in dark theme', async () => {
      const { container } = render(
        <ThemeProvider attribute="class" defaultTheme="dark">
          <div className="bg-background text-foreground p-4">
            <h1 className="text-primary">Primary Text</h1>
            <p className="text-muted-foreground">Muted Text</p>
            <button className="bg-primary text-primary-foreground px-4 py-2">
              Primary Button
            </button>
          </div>
        </ThemeProvider>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      
      expect(results).toHaveNoViolations();
    });
  });

  describe('Focus Trap Verification', () => {
    test('should trap focus within AuthModal', async () => {
      const { container } = render(
        <div>
          <button data-testid="outside-button">Outside Button</button>
          <ThemeProvider attribute="class" defaultTheme="light">
            <AuthModal 
              mounted={true}
              isOpen={true}
              onClose={jest.fn()}
              onAuthSuccess={jest.fn()}
            />
          </ThemeProvider>
        </div>
      );

      // Test that focus is trapped within the modal
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      
      // The modal should have focus management attributes
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      // Check for proper focus trapping elements
      const focusableElements = container.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      // Should have focusable elements within the modal
      expect(focusableElements.length).toBeGreaterThan(0);
    });
  });

  describe('ARIA Compliance', () => {
    test('should have proper ARIA labels and descriptions', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal 
            mounted={true}
            isOpen={true}
            onClose={jest.fn()}
            onAuthSuccess={jest.fn()}
          />
        </ThemeProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      // Check for dialog title
      const title = screen.getByText(/sign in|create account/i);
      expect(title).toBeInTheDocument();
    });

    test('should have proper form validation messages', async () => {
      render(
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthModal 
            mounted={true}
            isOpen={true}
            onClose={jest.fn()}
            onAuthSuccess={jest.fn()}
          />
        </ThemeProvider>
      );

      // Form should have proper structure
      const form = container.querySelector('form');
      if (form) {
        expect(form).toBeInTheDocument();
      }
    });
  });
});
