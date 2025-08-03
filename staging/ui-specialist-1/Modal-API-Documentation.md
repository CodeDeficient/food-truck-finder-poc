# Modal Component API Documentation
**UI_SPECIALIST_1 - Task 1.1.5**
**Date:** August 3, 2025

## Overview
The unified Modal component system provides a flexible, accessible, and consistent modal implementation across the food truck finder application. It supports multiple variants and use cases while maintaining a clean, type-safe API.

## Component Architecture

### Core Components
- **Modal**: Main component with variant routing
- **SimpleModal**: Basic modal with title, description, and actions
- **ContentModal**: Flexible modal for custom content
- **FormModal**: Form-specific modal with submission handling
- **ConfirmationModal**: Confirmation dialogs with promise-based API

### Hooks
- **useModal**: Basic modal state management
- **useConfirmationModal**: Promise-based confirmation modals
- **useFormModal**: Form submission handling
- **useModalStack**: Multiple modal management

## API Reference

### Base Props (Common to all variants)

\\\	ypescript
interface BaseModalProps {
  isOpen: boolean;                    // Modal visibility state
  onClose: () => void;               // Close handler
  title?: string;                    // Modal title
  description?: string;              // Modal description
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';  // Modal size
  className?: string;                // Additional CSS classes
  closeOnOverlayClick?: boolean;     // Close on overlay click (default: true)
  closeOnEscape?: boolean;           // Close on Escape key (default: true)
  showCloseButton?: boolean;         // Show X close button (default: true)
  preventScroll?: boolean;           // Prevent body scroll (default: true)
  zIndex?: number;                   // Custom z-index (default: 1000)
}
\\\

### Simple Modal

\\\	ypescript
interface SimpleModalProps extends BaseModalProps {
  variant: 'simple';
  actions?: ModalAction[];           // Action buttons
  error?: ModalError;                // Error display
}

interface ModalAction {
  label: string;                     // Button text
  variant?: ButtonVariant;           // Button style
  onClick: () => void;               // Click handler
  disabled?: boolean;                // Disabled state
  loading?: boolean;                 // Loading state
  className?: string;                // Custom button classes
}
\\\

**Usage:**
\\\	sx
<Modal
  variant="simple"
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  actions={[
    { label: 'Cancel', variant: 'outline', onClick: handleCancel },
    { label: 'Confirm', variant: 'default', onClick: handleConfirm }
  ]}
/>
\\\

### Content Modal

\\\	ypescript
interface ContentModalProps extends BaseModalProps {
  variant: 'content';
  children: ReactNode;               // Modal content
  header?: ReactNode;                // Custom header (overrides title/description)
  footer?: ReactNode;                // Custom footer
  error?: ModalError;                // Error display
  scrollable?: boolean;              // Enable content scrolling (default: true)
}
\\\

**Usage:**
\\\	sx
<Modal
  variant="content"
  isOpen={isOpen}
  onClose={onClose}
  title="Food Truck Details"
  size="lg"
  scrollable={true}
>
  <div className="space-y-4">
    <TruckInfo truck={truck} />
    <MenuSection items={items} />
    <ContactInfo contact={contact} />
  </div>
</Modal>
\\\

### Form Modal

\\\	ypescript
interface FormModalProps extends BaseModalProps {
  variant: 'form';
  children: ReactNode;               // Form content
  onSubmit?: (e: React.FormEvent) => void;  // Form submit handler
  submitLabel?: string;              // Submit button text (default: 'Submit')
  cancelLabel?: string;              // Cancel button text (default: 'Cancel')
  submitDisabled?: boolean;          // Disable submit button
  submitLoading?: boolean;           // Submit loading state
  error?: ModalError;                // Error display
  success?: boolean;                 // Success state display
}
\\\

**Usage:**
\\\	sx
<Modal
  variant="form"
  isOpen={isOpen}
  onClose={onClose}
  title="Add Food Truck"
  onSubmit={handleSubmit}
  submitLabel="Save Truck"
  submitLoading={isSubmitting}
  error={error}
>
  <div className="space-y-4">
    <Input label="Truck Name" {...nameProps} />
    <Textarea label="Description" {...descProps} />
    <Select label="Cuisine Type" {...cuisineProps} />
  </div>
</Modal>
\\\

### Confirmation Modal

\\\	ypescript
interface ConfirmationModalProps extends BaseModalProps {
  variant: 'confirmation';
  confirmLabel?: string;             // Confirm button text (default: 'Confirm')
  cancelLabel?: string;              // Cancel button text (default: 'Cancel')
  onConfirm: () => void;             // Confirm handler
  confirmVariant?: 'default' | 'destructive';  // Confirm button style
  confirmDisabled?: boolean;         // Disable confirm button
  confirmLoading?: boolean;          // Confirm loading state
  icon?: ReactNode;                  // Optional icon
}
\\\

**Usage:**
\\\	sx
<Modal
  variant="confirmation"
  isOpen={isOpen}
  onClose={onClose}
  title="Delete Food Truck"
  description="This action cannot be undone."
  confirmLabel="Delete"
  confirmVariant="destructive"
  onConfirm={handleDelete}
  icon={<Trash className="size-6 text-red-500" />}
/>
\\\

## Hook API Reference

### useModal

\\\	ypescript
const modal = useModal(initialOpen?: boolean);

// Returns:
{
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  error: ModalError | undefined;
  setError: (error: ModalError | undefined) => void;
  clearError: () => void;
}
\\\

**Usage:**
\\\	sx
const modal = useModal();

const handleOpenTruckDetails = () => {
  modal.open();
};

return (
  <>
    <Button onClick={handleOpenTruckDetails}>View Details</Button>
    <Modal
      variant="content"
      isOpen={modal.isOpen}
      onClose={modal.close}
      title="Truck Details"
    >
      <TruckDetails />
    </Modal>
  </>
);
\\\

### useConfirmationModal

\\\	ypescript
const confirmation = useConfirmationModal();

// Methods:
confirmation.confirm(options) => Promise<boolean>;
\\\

**Usage:**
\\\	sx
const confirmation = useConfirmationModal();

const handleDelete = async () => {
  const confirmed = await confirmation.confirm({
    title: 'Delete Item',
    description: 'Are you sure?',
    confirmLabel: 'Delete',
    variant: 'destructive'
  });
  
  if (confirmed) {
    // Proceed with deletion
  }
};
\\\

### useFormModal

\\\	ypescript
const form = useFormModal();

// Returns:
{
  ...useModal(),
  isSubmitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submitForm: () => void;
  formRef: React.RefObject<HTMLFormElement>;
}
\\\

### useModalStack

\\\	ypescript
const stack = useModalStack(baseZIndex?: number);

// Returns:
{
  modals: ModalStackItem[];
  openModal: (props: Omit<ModalProps, 'isOpen'>) => string;
  closeModal: (id: string) => void;
  closeTopModal: () => void;
  closeAllModals: () => void;
}
\\\

## Breaking Changes from Old Implementation

### Removed Components
- **components/ui/Modal.tsx**: Deprecated simple modal wrapper
  - **Migration**: Use \SimpleModal\ variant instead
  - **Old**: \<Modal isOpen={true} onClose={close} title="Title" description="Desc" />\
  - **New**: \<Modal variant="simple" isOpen={true} onClose={close} title="Title" description="Desc" />\

### Changed Props
- **TruckDetailsModal**: Will be refactored to use new ContentModal
  - **Migration**: Props remain similar, but component structure changes
  - **Old**: Direct usage of TruckDetailsModal
  - **New**: Wrapped in new Modal system for consistency

### New Requirements
- **variant prop**: All Modal usage now requires explicit variant
- **isOpen/onClose**: Standard across all variants
- **Type safety**: Stricter TypeScript interfaces

## Size Reference

| Size | Max Width | Use Case |
|------|-----------|----------|
| sm   | 24rem     | Simple confirmations, alerts |
| md   | 28rem     | Forms, basic content |
| lg   | 42rem     | Detailed content, truck details |
| xl   | 56rem     | Complex forms, dashboards |
| full | 95vw/95vh | Full-screen content, image galleries |

## Accessibility Features

### Built-in Accessibility
- **ARIA roles**: Proper dialog roles and labeling
- **Focus management**: Automatic focus trapping
- **Keyboard navigation**: Escape key, Tab navigation
- **Screen reader support**: Semantic markup and labels

### Custom Accessibility
\\\	sx
<Modal
  variant="content"
  isOpen={isOpen}
  onClose={onClose}
  title="Accessible Modal"
  aria-describedby="modal-description"
>
  <div id="modal-description">
    This modal contains important information...
  </div>
</Modal>
\\\

## Error Handling

### Error Object Structure
\\\	ypescript
interface ModalError {
  message: string;      // Error message to display
  field?: string;       // Associated form field (for forms)
  code?: string;        // Error code for programmatic handling
}
\\\

### Error Display
Errors are displayed consistently across all modal variants:
- Red background with error icon
- Clear, user-friendly messages
- Automatic clearing on modal open/close

## Best Practices

### 1. Choose Appropriate Variant
- **Simple**: Basic alerts, confirmations with predefined actions
- **Content**: Complex layouts, truck details, dashboards
- **Form**: Any form submission with validation
- **Confirmation**: Delete confirmations, dangerous actions

### 2. Use Proper Sizing
- Start with default size for variant
- Only customize when content requires it
- Test on mobile devices

### 3. Handle Loading States
\\\	sx
<Modal
  variant="form"
  submitLoading={isSubmitting}
  onSubmit={async (e) => {
    setIsSubmitting(true);
    try {
      await submitData();
      modal.close();
    } finally {
      setIsSubmitting(false);
    }
  }}
>
  {/* Form content */}
</Modal>
\\\

### 4. Error Management
\\\	sx
const modal = useModal();

const handleAction = async () => {
  try {
    await riskyOperation();
    modal.close();
  } catch (error) {
    modal.setError({
      message: 'Operation failed. Please try again.',
      code: 'OPERATION_FAILED'
    });
  }
};
\\\

## Migration Examples

### Old Simple Modal → New Simple Modal
\\\	sx
// OLD
import Modal from '@/components/ui/Modal';
<Modal isOpen={true} onClose={close} title="Title" description="Description" />

// NEW
import { Modal } from '@/staging/ui-specialist-1/components/ui/Modal';
<Modal 
  variant="simple" 
  isOpen={true} 
  onClose={close} 
  title="Title" 
  description="Description"
  actions={[
    { label: 'Close', onClick: close }
  ]}
/>
\\\

### Old TruckDetailsModal → New Content Modal
\\\	sx
// OLD
import { TruckDetailsModal } from '@/components/TruckDetailsModal';
<TruckDetailsModal truck={truck} isOpen={isOpen} onClose={onClose} isTruckOpen={isTruckOpen} />

// NEW (after migration)
import { Modal } from '@/staging/ui-specialist-1/components/ui/Modal';
import { TruckDetailsContent } from '@/components/TruckDetailsContent';
<Modal
  variant="content"
  isOpen={isOpen}
  onClose={onClose}
  title={truck.name}
  size="lg"
  scrollable={true}
>
  <TruckDetailsContent truck={truck} isTruckOpen={isTruckOpen} />
</Modal>
\\\

## Performance Considerations

### Lazy Loading
- Modal content is only rendered when \isOpen={true}\
- Heavy components should be lazy loaded
- Use React.lazy() for large modal content

### Memory Management
- Automatic cleanup of event listeners
- Form state reset on close (optional)
- Proper unmounting of modal content

### Z-index Management
- Automatic z-index stacking for multiple modals
- Base z-index: 1000
- Stack increment: 10 per modal

## Testing Guidelines

### Unit Tests
- Test all modal variants
- Test with different data completeness levels
- Test error states and loading states
- Test keyboard navigation and accessibility

### Integration Tests
- Test modal integration with forms
- Test modal stacking behavior
- Test responsive behavior across screen sizes

### Visual Tests
- Screenshot tests for all modal variants
- Test with long content and names
- Test error and success states
