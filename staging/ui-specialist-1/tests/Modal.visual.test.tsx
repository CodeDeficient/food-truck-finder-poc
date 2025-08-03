/**
 * Modal Visual Regression Tests
 * UI_SPECIALIST_1 - Task 1.1.6
 */

import React from 'react';
import { render } from '@testing-library/react';
import { Modal } from '../components/ui/Modal';
import { Trash, AlertCircle, Star } from 'lucide-react';

// Mock data for testing
const mockTruckComplete = {
  id: '1',
  name: 'The Perfect Food Truck',
  description: 'Amazing food truck with complete information and very long description that should test scrolling behavior in the modal. This description is intentionally long to test how the modal handles overflow content and scrolling. It should wrap properly and not break the layout.',
  cuisine_type: ['Mexican', 'American', 'Fusion'],
  location: '123 Main St, City, State 12345',
  phone: '+1 (555) 123-4567',
  website: 'https://perfectfoodtruck.com',
  rating: 4.8,
  reviews: 127
};

const mockTruckLongName = {
  name: 'This is an extremely long food truck name that should test how the modal handles very long titles and whether they wrap properly or get truncated in the modal header section'
};

describe('Modal Visual Tests', () => {
  // Helper function to render modal for visual testing
  const renderModalForVisual = (modalProps: any, testName: string) => {
    const { container } = render(
      <div data-testid={testName}>
        {modalProps}
      </div>
    );
    return container;
  };

  describe('Simple Modal Variants', () => {
    it('renders simple modal with actions', () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Simple Modal Test"
          description="This is a simple modal with multiple actions to test the layout."
          actions={[
            { label: 'Cancel', variant: 'outline', onClick: () => {} },
            { label: 'Save', variant: 'default', onClick: () => {} },
            { label: 'Delete', variant: 'destructive', onClick: () => {} }
          ]}
        />
      );
      
      const container = renderModalForVisual(modal, 'simple-modal-actions');
      expect(container).toMatchSnapshot('simple-modal-with-actions');
    });

    it('renders simple modal with error', () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Error State Test"
          description="This modal shows an error state."
          error={{ message: 'Something went wrong! Please try again later.' }}
          actions={[
            { label: 'Retry', variant: 'default', onClick: () => {} }
          ]}
        />
      );
      
      const container = renderModalForVisual(modal, 'simple-modal-error');
      expect(container).toMatchSnapshot('simple-modal-with-error');
    });

    it('renders simple modal with loading action', () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="Loading State Test"
          description="This modal shows a loading action button."
          actions={[
            { label: 'Cancel', variant: 'outline', onClick: () => {} },
            { label: 'Processing', variant: 'default', onClick: () => {}, loading: true }
          ]}
        />
      );
      
      const container = renderModalForVisual(modal, 'simple-modal-loading');
      expect(container).toMatchSnapshot('simple-modal-with-loading');
    });
  });

  describe('Content Modal Variants', () => {
    it('renders content modal with truck details', () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title={mockTruckComplete.name}
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{mockTruckComplete.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Cuisine Types</h3>
              <div className="flex gap-2">
                {mockTruckComplete.cuisine_type.map(cuisine => (
                  <span key={cuisine} className="px-2 py-1 bg-secondary rounded-md text-sm">
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
              <p>📍 {mockTruckComplete.location}</p>
              <p>📞 {mockTruckComplete.phone}</p>
              <p>🌐 {mockTruckComplete.website}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Star className="size-4 mr-2 fill-yellow-400 text-yellow-400" />
                Rating
              </h3>
              <p>{mockTruckComplete.rating}/5 ({mockTruckComplete.reviews} reviews)</p>
            </div>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'content-modal-truck-details');
      expect(container).toMatchSnapshot('content-modal-truck-details');
    });

    it('renders content modal with long name', () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title={mockTruckLongName.name}
          description="This tests how the modal handles very long titles."
        >
          <div>
            <p>Content area with normal text that should display properly even with a very long title above.</p>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'content-modal-long-name');
      expect(container).toMatchSnapshot('content-modal-long-name');
    });

    it('renders content modal with scrollable content', () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Scrollable Content Test"
          size="md"
          scrollable={true}
        >
          <div className="space-y-4">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-4 border rounded">
                <h4>Section {i + 1}</h4>
                <p>This is content section {i + 1}. This modal should show scrolling behavior when content exceeds the viewport height.</p>
              </div>
            ))}
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'content-modal-scrollable');
      expect(container).toMatchSnapshot('content-modal-scrollable');
    });

    it('renders content modal with custom header and footer', () => {
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          header={
            <div className="flex items-center gap-3 p-4 border-b">
              <AlertCircle className="size-6 text-blue-500" />
              <div>
                <h2 className="text-xl font-bold">Custom Header</h2>
                <p className="text-sm text-muted-foreground">With icon and description</p>
              </div>
            </div>
          }
          footer={
            <div className="flex justify-between items-center p-4 border-t bg-muted">
              <span className="text-sm text-muted-foreground">Custom footer area</span>
              <div className="flex gap-2">
                <button className="px-4 py-2 border rounded">Secondary</button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded">Primary</button>
              </div>
            </div>
          }
        >
          <div className="p-4">
            <p>This modal has custom header and footer components.</p>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'content-modal-custom-header-footer');
      expect(container).toMatchSnapshot('content-modal-custom-header-footer');
    });
  });

  describe('Form Modal Variants', () => {
    it('renders form modal with fields', () => {
      const modal = (
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Add New Food Truck"
          onSubmit={() => {}}
          submitLabel="Save Truck"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Truck Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border rounded-md" 
                placeholder="Enter truck name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border rounded-md" 
                rows={3}
                placeholder="Describe your food truck"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cuisine Type</label>
              <select className="w-full px-3 py-2 border rounded-md">
                <option>Select cuisine type</option>
                <option>Mexican</option>
                <option>American</option>
                <option>Italian</option>
                <option>Asian</option>
              </select>
            </div>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'form-modal-basic');
      expect(container).toMatchSnapshot('form-modal-basic');
    });

    it('renders form modal with error state', () => {
      const modal = (
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form with Error"
          onSubmit={() => {}}
          error={{ message: 'Please fill in all required fields.' }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Required Field</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-red-300 rounded-md" 
                placeholder="This field has an error"
              />
              <p className="text-sm text-red-600 mt-1">This field is required</p>
            </div>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'form-modal-error');
      expect(container).toMatchSnapshot('form-modal-error');
    });

    it('renders form modal with success state', () => {
      const modal = (
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Form Success"
          success={true}
        >
          <div className="text-center py-4">
            <p>Your food truck has been successfully added!</p>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'form-modal-success');
      expect(container).toMatchSnapshot('form-modal-success');
    });

    it('renders form modal with loading state', () => {
      const modal = (
        <Modal
          variant="form"
          isOpen={true}
          onClose={() => {}}
          title="Submitting Form"
          submitLoading={true}
          submitLabel="Saving"
        >
          <div className="space-y-4">
            <input type="text" className="w-full px-3 py-2 border rounded-md" value="Sample data" readOnly />
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'form-modal-loading');
      expect(container).toMatchSnapshot('form-modal-loading');
    });
  });

  describe('Confirmation Modal Variants', () => {
    it('renders confirmation modal basic', () => {
      const modal = (
        <Modal
          variant="confirmation"
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Confirm Action"
          description="Are you sure you want to proceed with this action?"
        />
      );
      
      const container = renderModalForVisual(modal, 'confirmation-modal-basic');
      expect(container).toMatchSnapshot('confirmation-modal-basic');
    });

    it('renders confirmation modal destructive', () => {
      const modal = (
        <Modal
          variant="confirmation"
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Delete Food Truck"
          description="This action cannot be undone. The food truck and all its data will be permanently removed."
          confirmLabel="Delete"
          confirmVariant="destructive"
          icon={<Trash className="size-6 text-red-500" />}
        />
      );
      
      const container = renderModalForVisual(modal, 'confirmation-modal-destructive');
      expect(container).toMatchSnapshot('confirmation-modal-destructive');
    });

    it('renders confirmation modal with loading', () => {
      const modal = (
        <Modal
          variant="confirmation"
          isOpen={true}
          onClose={() => {}}
          onConfirm={() => {}}
          title="Processing"
          description="Please wait while we process your request."
          confirmLoading={true}
          confirmLabel="Processing"
        />
      );
      
      const container = renderModalForVisual(modal, 'confirmation-modal-loading');
      expect(container).toMatchSnapshot('confirmation-modal-loading');
    });
  });

  describe('Modal Sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl', 'full'] as const;
    
    sizes.forEach(size => {
      it(enders  modal size, () => {
        const modal = (
          <Modal
            variant="content"
            isOpen={true}
            onClose={() => {}}
            title={${size.toUpperCase()} Modal Size}
            size={size}
          >
            <div className="p-4">
              <p>This is a {size} sized modal for testing responsive behavior.</p>
              <div className="mt-4 p-4 bg-muted rounded">
                <p>Content area that should resize based on modal size.</p>
              </div>
            </div>
          </Modal>
        );
        
        const container = renderModalForVisual(modal, modal-size-);
        expect(container).toMatchSnapshot(modal-size-);
      });
    });
  });

  describe('Modal States', () => {
    it('renders modal without close button', () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="No Close Button"
          showCloseButton={false}
          actions={[
            { label: 'Done', onClick: () => {} }
          ]}
        />
      );
      
      const container = renderModalForVisual(modal, 'modal-no-close-button');
      expect(container).toMatchSnapshot('modal-no-close-button');
    });

    it('renders modal with custom z-index', () => {
      const modal = (
        <Modal
          variant="simple"
          isOpen={true}
          onClose={() => {}}
          title="High Z-Index Modal"
          zIndex={2000}
        />
      );
      
      const container = renderModalForVisual(modal, 'modal-custom-zindex');
      expect(container).toMatchSnapshot('modal-custom-zindex');
    });
  });

  describe('Responsive Behavior', () => {
    // These tests would typically be run with different viewport sizes
    it('renders modal on mobile viewport', () => {
      // Simulate mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375 });
      Object.defineProperty(window, 'innerHeight', { value: 667 });
      
      const modal = (
        <Modal
          variant="content"
          isOpen={true}
          onClose={() => {}}
          title="Mobile Modal Test"
          size="md"
        >
          <div className="p-4">
            <p>This modal should adapt to mobile screen sizes.</p>
            <div className="mt-4 grid grid-cols-1 gap-2">
              <button className="w-full p-2 border rounded">Button 1</button>
              <button className="w-full p-2 border rounded">Button 2</button>
            </div>
          </div>
        </Modal>
      );
      
      const container = renderModalForVisual(modal, 'modal-mobile');
      expect(container).toMatchSnapshot('modal-mobile');
    });
  });
});

// Visual diff utility for comparing before/after implementations
export const generateVisualDiffs = () => {
  // This would typically integrate with a visual regression testing tool
  // such as Percy, Chromatic, or a custom screenshot comparison system
  
  const testCases = [
    'simple-modal-with-actions',
    'content-modal-truck-details',
    'form-modal-basic',
    'confirmation-modal-destructive'
  ];
  
  return testCases.map(testCase => ({
    name: testCase,
    // Screenshots would be captured here
    before: screenshots/before/.png,
    after: screenshots/after/.png,
    diff: screenshots/diff/.png
  }));
};
