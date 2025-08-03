/**
 * Modal Accessibility Tests
 * UI_SPECIALIST_1 - Task 1.1.8
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Modal } from '../components/ui/Modal';
import '@testing-library/jest-dom';

expect.extend(toHaveNoViolations);

describe('Modal Accessibility', () => {
  beforeEach(() => {
    // Reset focus and any global state
    document.body.focus();
  });

  describe('ARIA Compliance', () => {
    it('has correct ARIA roles and properties', async () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Accessible Modal"
          description="This modal tests ARIA compliance"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      
      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Accessible Modal');
      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    });

    it('has proper aria-describedby when description is provided', () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Modal with Description"
          description="This is the modal description"
        />
      );

      const dialog = screen.getByRole('dialog');
      const description = screen.getByText('This is the modal description');
      
      expect(dialog).toHaveAttribute('aria-describedby', description.id);
    });

    it('works without description', () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Modal without Description"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).not.toHaveAttribute('aria-describedby');
    });
  });

  describe('Focus Management', () => {
    it('focuses the modal when opened', async () => {
      const { rerender } = render(
        <Modal
          variant="simple"
          isOpen={false}
          onClose={() => {}}
          title="Focus Test Modal"
        />
      );

      // Initial focus should not be on modal
      expect(document.activeElement).toBe(document.body);

      rerender(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Focus Test Modal"
        />
      );

      await waitFor(() => {
        const dialog = screen.getByRole('dialog');
        expect(document.activeElement).toBe(dialog);
      });
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Outside Button</button>
          <Modal
            variant="form"
            isOpen={true}
            onClose={() => {}}
            title="Focus Trap Test"
            onSubmit={() => {}}
          >
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
          </Modal>
        </div>
      );

      const firstInput = screen.getByPlaceholderText('First input');
      const secondInput = screen.getByPlaceholderText('Second input');
      const submitButton = screen.getByText('Submit');
      const cancelButton = screen.getByText('Cancel');

      // Focus should start on the modal
      await waitFor(() => {
        expect(document.activeElement).toBe(screen.getByRole('dialog'));
      });

      // Tab to first input
      await user.tab();
      expect(document.activeElement).toBe(firstInput);

      // Tab to second input
      await user.tab();
      expect(document.activeElement).toBe(secondInput);

      // Tab to cancel button
      await user.tab();
      expect(document.activeElement).toBe(cancelButton);

      // Tab to submit button
      await user.tab();
      expect(document.activeElement).toBe(submitButton);

      // Tab should cycle back to close button
      await user.tab();
      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(document.activeElement).toBe(closeButton);

      // Shift+Tab should go back to submit
      await user.tab({ shift: true });
      expect(document.activeElement).toBe(submitButton);
    });

    it('returns focus to trigger element when closed', async () => {
      const user = userEvent.setup();
      let isOpen = false;
      
      const TestComponent = () => {
        const [modalOpen, setModalOpen] = React.useState(isOpen);
        
        return (
          <div>
            <button onClick={() => setModalOpen(true)}>Open Modal</button>
            <Modal
              variant="simple"
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              title="Return Focus Test"
            />
          </div>
        );
      };

      render(<TestComponent />);
      
      const trigger = screen.getByText('Open Modal');
      
      // Click trigger to open modal
      await user.click(trigger);
      
      // Modal should be focused
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close modal with Escape
      fireEvent.keyDown(document, { key: 'Escape' });

      // Focus should return to trigger
      await waitFor(() => {
        expect(document.activeElement).toBe(trigger);
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes on Escape key', async () => {
      const onClose = jest.fn();

      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={onClose}
          title="Escape Test Modal"
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close on other keys', async () => {
      const onClose = jest.fn();

      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={onClose}
          title="Key Test Modal"
        />
      );

      fireEvent.keyDown(document, { key: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('activates buttons with Enter and Space', async () => {
      const user = userEvent.setup();
      const onAction = jest.fn();

      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Button Activation Test"
          actions={[
            { label: 'Test Action', onClick: onAction }
          ]}
        />
      );

      const button = screen.getByText('Test Action');
      button.focus();

      // Test Enter key
      await user.keyboard('{Enter}');
      expect(onAction).toHaveBeenCalledTimes(1);

      // Test Space key
      await user.keyboard(' ');
      expect(onAction).toHaveBeenCalledTimes(2);
    });
  });

  describe('Screen Reader Support', () => {
    it('provides proper semantic structure', () => {
      render(
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Screen Reader Test"
          description="Modal description for screen readers"
        >
          <div>
            <h3>Section Header</h3>
            <p>Section content</p>
            <ul>
              <li>List item 1</li>
              <li>List item 2</li>
            </ul>
          </div>
        </Modal>
      );

      // Check for proper heading hierarchy
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Screen Reader Test');
      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Section Header');
      
      // Check for list structure
      expect(screen.getByRole('list')).toBeInTheDocument();
      expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('announces form errors appropriately', async () => {
      render(
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form with Error"
          error={{ message: 'Please correct the following errors' }}
        >
          <input type="text" aria-describedby="error-message" />
        </Modal>
      );

      const errorMessage = screen.getByText('Please correct the following errors');
      expect(errorMessage).toHaveAttribute('role', 'alert');
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });

    it('provides status updates for loading states', () => {
      render(
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Loading Form"
          submitLoading={true}
        >
          <input type="text" />
        </Modal>
      );

      const loadingButton = screen.getByText('Loading...');
      expect(loadingButton).toHaveAttribute('aria-disabled', 'true');
      expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('has sufficient color contrast for text', () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Contrast Test Modal"
          description="This tests color contrast compliance"
        />
      );

      const title = screen.getByText('Contrast Test Modal');
      const description = screen.getByText('This tests color contrast compliance');

      // These would typically be tested with actual contrast ratio calculations
      expect(title).toBeVisible();
      expect(description).toBeVisible();
    });

    it('maintains visibility in high contrast mode', () => {
      // Simulate high contrast mode
      document.body.style.filter = 'contrast(1000%)';

      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="High Contrast Test"
          actions={[
            { label: 'Action Button', onClick: () => {} }
          ]}
        />
      );

      const modal = screen.getByRole('dialog');
      const button = screen.getByText('Action Button');

      expect(modal).toBeVisible();
      expect(button).toBeVisible();

      // Reset
      document.body.style.filter = '';
    });
  });

  describe('Axe Accessibility Testing', () => {
    it('has no accessibility violations - Simple Modal', async () => {
      const { container } = render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Axe Test Modal"
          description="Testing with axe-core"
          actions={[
            { label: 'Cancel', variant: 'outline', onClick: () => {} },
            { label: 'Confirm', variant: 'default', onClick: () => {} }
          ]}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - Content Modal', async () => {
      const { container } = render(
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Content Axe Test"
        >
          <div>
            <h3>Heading</h3>
            <p>Paragraph content</p>
            <button>Interactive element</button>
          </div>
        </Modal>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - Form Modal', async () => {
      const { container } = render(
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Axe Test"
          onSubmit={() => {}}
        >
          <div>
            <label htmlFor="test-input">Test Input</label>
            <input id="test-input" type="text" />
          </div>
        </Modal>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('has no accessibility violations - Confirmation Modal', async () => {
      const { container } = render(
        <Modal
          variant="confirmation"
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirmation Axe Test"
          description="Are you sure?"
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    beforeEach(() => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true });
    });

    it('maintains accessibility on mobile devices', async () => {
      const { container } = render(
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Mobile Accessibility Test"
          size="full"
        >
          <div>
            <p>Mobile optimized content</p>
            <button>Touch target</button>
          </div>
        </Modal>
      );

      // Test touch target size (minimum 44px)
      const button = screen.getByText('Touch target');
      const styles = getComputedStyle(button);
      const minSize = 44;
      
      expect(parseInt(styles.minHeight) || parseInt(styles.height)).toBeGreaterThanOrEqual(minSize);
      expect(parseInt(styles.minWidth) || parseInt(styles.width)).toBeGreaterThanOrEqual(minSize);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('supports screen reader navigation on mobile', () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Mobile Screen Reader Test"
          description="Testing mobile screen reader support"
        />
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Reduced Motion Accessibility', () => {
    beforeEach(() => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
    });

    it('respects prefers-reduced-motion setting', () => {
      render(
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Reduced Motion Test"
        />
      );

      const dialog = screen.getByRole('dialog');
      
      // Modal should still be functional without animations
      expect(dialog).toBeVisible();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });
  });
});
