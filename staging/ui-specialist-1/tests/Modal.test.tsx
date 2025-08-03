/**
 * Modal Component Tests
 * UI_SPECIALIST_1 - Task 1.1.4
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, SimpleModal, ContentModal, FormModal, ConfirmationModal } from '../components/ui/Modal';
import { useModal, useConfirmationModal, useFormModal } from '../components/ui/Modal/hooks';
import '@testing-library/jest-dom';

// Mock truck data with different completeness levels
const mockTruckComplete = {
  id: '1',
  name: 'The Perfect Food Truck',
  description: 'Amazing food truck with complete information and very long description that should test scrolling behavior in the modal.',
  cuisine_type: ['Mexican', 'American', 'Fusion'],
  current_location: { address: '123 Main St, City, State 12345' },
  contact_info: {
    phone: '+1 (555) 123-4567',
    email: 'perfect@foodtruck.com',
    website: 'https://perfectfoodtruck.com'
  },
  social_media: {
    facebook: 'https://facebook.com/perfectfoodtruck',
    instagram: 'https://instagram.com/perfectfoodtruck',
    twitter: 'https://twitter.com/perfectfoodtruck'
  },
  average_rating: 4.8,
  review_count: 127,
  verification_status: 'verified'
};

const mockTruckIncomplete = {
  id: '2',
  name: 'Basic Truck',
  description: '',
  cuisine_type: [],
  current_location: { address: '' },
  contact_info: { phone: '', email: '', website: '' },
  social_media: {},
  average_rating: 0,
  review_count: 0,
  verification_status: 'unverified'
};

const mockTruckLongName = {
  id: '3',
  name: 'This is an extremely long food truck name that should test how the modal handles very long titles and whether they wrap properly or get truncated',
  description: 'Regular description',
  cuisine_type: ['Italian'],
  current_location: { address: '456 Long Name Ave' },
  contact_info: { phone: '555-123-4567', email: '', website: '' },
  social_media: {},
  average_rating: 3.5,
  review_count: 42,
  verification_status: 'pending'
};

describe('Modal Component', () => {
  beforeEach(() => {
    // Reset body overflow
    document.body.style.overflow = '';
  });

  describe('SimpleModal', () => {
    it('renders with title and description', () => {
      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          description="This is a test modal"
        />
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('This is a test modal')).toBeInTheDocument();
    });

    it('renders actions correctly', async () => {
      const onAction1 = jest.fn();
      const onAction2 = jest.fn();

      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          actions={[
            { label: 'Action 1', onClick: onAction1 },
            { label: 'Action 2', onClick: onAction2, variant: 'destructive' }
          ]}
        />
      );

      const action1Button = screen.getByText('Action 1');
      const action2Button = screen.getByText('Action 2');

      expect(action1Button).toBeInTheDocument();
      expect(action2Button).toBeInTheDocument();

      await userEvent.click(action1Button);
      await userEvent.click(action2Button);

      expect(onAction1).toHaveBeenCalledTimes(1);
      expect(onAction2).toHaveBeenCalledTimes(1);
    });

    it('displays errors correctly', () => {
      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          error={{ message: 'Something went wrong!' }}
        />
      );

      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });
  });

  describe('ContentModal', () => {
    it('renders custom content', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Content Modal"
        >
          <div>Custom content here</div>
        </ContentModal>
      );

      expect(screen.getByText('Content Modal')).toBeInTheDocument();
      expect(screen.getByText('Custom content here')).toBeInTheDocument();
    });

    it('renders custom header and footer', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          header={<div>Custom Header</div>}
          footer={<div>Custom Footer</div>}
        >
          <div>Content</div>
        </ContentModal>
      );

      expect(screen.getByText('Custom Header')).toBeInTheDocument();
      expect(screen.getByText('Custom Footer')).toBeInTheDocument();
    });

    it('handles scrollable content', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Scrollable Modal"
          scrollable={true}
        >
          <div style={{ height: '2000px' }}>Very tall content</div>
        </ContentModal>
      );

      const content = screen.getByText('Very tall content').parentElement;
      expect(content).toHaveClass('overflow-y-auto');
    });
  });

  describe('FormModal', () => {
    it('handles form submission', async () => {
      const onSubmit = jest.fn();

      render(
        <FormModal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Modal"
          onSubmit={onSubmit}
        >
          <input type="text" placeholder="Test input" />
        </FormModal>
      );

      const submitButton = screen.getByText('Submit');
      await userEvent.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
      render(
        <FormModal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Modal"
          submitLoading={true}
        >
          <input type="text" />
        </FormModal>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('shows success state', () => {
      render(
        <FormModal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Modal"
          success={true}
        >
          <input type="text" />
        </FormModal>
      );

      expect(screen.getByText('Success!')).toBeInTheDocument();
    });
  });

  describe('ConfirmationModal', () => {
    it('handles confirmation', async () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <ConfirmationModal
          variant="confirmation"
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm Action"
          description="Are you sure?"
        />
      );

      const confirmButton = screen.getByText('Confirm');
      await userEvent.click(confirmButton);

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('handles cancellation', async () => {
      const onConfirm = jest.fn();
      const onClose = jest.fn();

      render(
        <ConfirmationModal
          variant="confirmation"
          isOpen={true}
          onClose={onClose}
          onConfirm={onConfirm}
          title="Confirm Action"
        />
      );

      const cancelButton = screen.getByText('Cancel');
      await userEvent.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  describe('Modal Sizes', () => {
    it('applies correct size classes', () => {
      const { rerender } = render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Small Modal"
          size="sm"
        />
      );

      expect(document.querySelector('.max-w-sm')).toBeInTheDocument();

      rerender(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Large Modal"
          size="lg"
        />
      );

      expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes on Escape key', async () => {
      const onClose = jest.fn();

      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('does not close on Escape when disabled', async () => {
      const onClose = jest.fn();

      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={onClose}
          title="Test Modal"
          closeOnEscape={false}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });

      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Scroll Prevention', () => {
    it('prevents body scroll when modal is open', () => {
      render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          preventScroll={true}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal closes', () => {
      const { rerender } = render(
        <SimpleModal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Test Modal"
          preventScroll={true}
        />
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <SimpleModal
          variant="simple"
          isOpen={false}
          onClose={() => {}}
          title="Test Modal"
          preventScroll={true}
        />
      );

      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Food Truck Data Testing', () => {
    // Test with complete truck data
    it('handles complete truck data', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title={mockTruckComplete.name}
          description={mockTruckComplete.description}
        >
          <div>
            <p>Cuisine: {mockTruckComplete.cuisine_type.join(', ')}</p>
            <p>Address: {mockTruckComplete.current_location.address}</p>
            <p>Phone: {mockTruckComplete.contact_info.phone}</p>
            <p>Rating: {mockTruckComplete.average_rating}/5</p>
          </div>
        </ContentModal>
      );

      expect(screen.getByText(mockTruckComplete.name)).toBeInTheDocument();
      expect(screen.getByText(/Mexican, American, Fusion/)).toBeInTheDocument();
      expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
    });

    // Test with incomplete truck data
    it('handles incomplete truck data gracefully', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title={mockTruckIncomplete.name || 'Unnamed Truck'}
        >
          <div>
            <p>Cuisine: {mockTruckIncomplete.cuisine_type.length > 0 ? mockTruckIncomplete.cuisine_type.join(', ') : 'Not specified'}</p>
            <p>Address: {mockTruckIncomplete.current_location.address || 'Not available'}</p>
            <p>Phone: {mockTruckIncomplete.contact_info.phone || 'Not available'}</p>
          </div>
        </ContentModal>
      );

      expect(screen.getByText('Basic Truck')).toBeInTheDocument();
      expect(screen.getByText(/Not specified/)).toBeInTheDocument();
      expect(screen.getByText(/Not available/)).toBeInTheDocument();
    });

    // Test with long truck name
    it('handles long truck names', () => {
      render(
        <ContentModal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title={mockTruckLongName.name}
          size="lg"
        >
          <div>Long name test content</div>
        </ContentModal>
      );

      expect(screen.getByText(/extremely long food truck name/)).toBeInTheDocument();
    });
  });
});

describe('Modal Hooks', () => {
  describe('useModal', () => {
    const TestComponent = () => {
      const modal = useModal();
      
      return (
        <div>
          <button onClick={modal.open}>Open</button>
          <button onClick={modal.close}>Close</button>
          <button onClick={modal.toggle}>Toggle</button>
          <span>Status: {modal.isOpen ? 'open' : 'closed'}</span>
          {modal.error && <span>Error: {modal.error.message}</span>}
        </div>
      );
    };

    it('manages modal state correctly', async () => {
      render(<TestComponent />);

      expect(screen.getByText('Status: closed')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Open'));
      expect(screen.getByText('Status: open')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Close'));
      expect(screen.getByText('Status: closed')).toBeInTheDocument();

      await userEvent.click(screen.getByText('Toggle'));
      expect(screen.getByText('Status: open')).toBeInTheDocument();
    });
  });
});
