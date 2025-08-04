/**
 * Modal Component Usage Examples
 * UI_SPECIALIST_1 - Task 1.1.7
 */

import React from 'react';
import { Modal, useModal, useFormModal, useConfirmationModal } from '../components/ui/Modal';
import { Button } from '../../../components/ui/button';

/**
 * Simple Modal Example
 */
export const SimpleModalExample = () => {
  const modal = useModal();

  return (
    <div>
      <Button onClick={modal.open}>Open Simple Modal</Button>

      <Modal
        variant="simple"
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Simple Modal"
        description="This is an example of a simple modal with actions."
        actions={[
          { label: 'Cancel', variant: 'outline', onClick: modal.close },
          { label: 'Confirm', variant: 'default', onClick: modal.close }
        ]}
      />
    </div>
  );
};

/**
 * Content Modal Example
 */
export const ContentModalExample = () => {
  const modal = useModal();

  return (
    <div>
      <Button onClick={modal.open}>Open Content Modal</Button>

      <Modal
        variant="content"
        isOpen={modal.isOpen}
        onClose={modal.close}
        title="Content Modal"
        size="lg"
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <p className="text-muted-foreground">This modal demonstrates content rendering with scroll support and custom layout.</p>
        </div>
      </Modal>
    </div>
  );
};

/**
 * Form Modal Example
 */
export const FormModalExample = () => {
  const formModal = useFormModal();

  return (
    <div>
      <Button onClick={formModal.open}>Open Form Modal</Button>

      <Modal
        variant="form"
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title="Submit Your Information"
        onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted');
          formModal.close();
        }}
        submitLabel="Submit"
      >
        <form ref={formModal.formRef} className="space-y-4">
          <input type="text" placeholder="Name" className="input-primary" required />
          <input type="email" placeholder="Email" className="input-primary" required />
        </form>
      </Modal>
    </div>
  );
};

/**
 * Confirmation Modal Example
 */
export const ConfirmationModalExample = () => {
  const confirmation = useConfirmationModal();

  const handleDelete = async () => {
    const confirmed = await confirmation.confirm({
      title: 'Delete Item',
      description: 'Are you sure you want to delete this item?',
      confirmLabel: 'Delete',
      variant: 'destructive'
    });

    if (confirmed) {
      alert('Item deleted');
    }
  };

  return (
    <div>
      <Button onClick={handleDelete}>Delete Item</Button>
    </div>
  );
};
