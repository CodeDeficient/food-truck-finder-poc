'use client';

/**
 * Unified Modal Component
 * UI_SPECIALIST_1 - Task 1.1.3
 */

import React, { useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ModalProps, 
  SimpleModalProps, 
  ContentModalProps, 
  FormModalProps, 
  ConfirmationModalProps,
  MODAL_SIZES,
  DEFAULT_Z_INDEX,
  ModalError
} from './types';

// Error Display Component
const ModalErrorDisplay: React.FC<{ error: ModalError }> = ({ error }) => (
  <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-md mb-4">
    <AlertCircle className="size-4 shrink-0" />
    <span>{error.message}</span>
  </div>
);

// Simple Modal Implementation
const SimpleModal: React.FC<SimpleModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  actions = [], 
  error,
  size = 'md',
  className,
  showCloseButton = true,
  zIndex = DEFAULT_Z_INDEX
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent 
      className={cn(
        MODAL_SIZES[size].className,
        'gap-4',
        className
      )}
      style={{ zIndex }}
    >
      {title && (
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
      )}
      
      {error && <ModalErrorDisplay error={error} />}
      
      {actions.length > 0 && (
        <DialogFooter>
          <div className="flex gap-2 w-full sm:w-auto">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className={cn('flex-1 sm:flex-initial', action.className)}
              >
                {action.loading ? 'Loading...' : action.label}
              </Button>
            ))}
          </div>
        </DialogFooter>
      )}
      
      {showCloseButton && (
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogContent>
  </Dialog>
);

// Content Modal Implementation
const ContentModal: React.FC<ContentModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children,
  header,
  footer,
  error,
  size = 'lg',
  className,
  showCloseButton = true,
  scrollable = true,
  zIndex = DEFAULT_Z_INDEX
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent 
      className={cn(
        MODAL_SIZES[size].className,
        scrollable && 'max-h-[90vh] overflow-y-auto',
        'gap-4',
        className
      )}
      style={{ zIndex }}
    >
      {(title || header) && (
        <DialogHeader>
          {header || (
            <>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </>
          )}
        </DialogHeader>
      )}
      
      {error && <ModalErrorDisplay error={error} />}
      
      <div className={cn('flex-1', scrollable && 'overflow-y-auto')}>
        {children}
      </div>
      
      {footer && (
        <DialogFooter>
          {footer}
        </DialogFooter>
      )}
      
      {showCloseButton && (
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogClose>
      )}
    </DialogContent>
  </Dialog>
);

// Form Modal Implementation
const FormModal: React.FC<FormModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  children,
  onSubmit,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  submitDisabled = false,
  submitLoading = false,
  error,
  success = false,
  size = 'md',
  className,
  showCloseButton = true,
  zIndex = DEFAULT_Z_INDEX
}) => {
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  }, [onSubmit]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          MODAL_SIZES[size].className,
          'gap-4',
          className
        )}
        style={{ zIndex }}
      >
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        {error && <ModalErrorDisplay error={error} />}
        
        {success && (
          <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 rounded-md mb-4">
            <AlertCircle className="size-4 shrink-0" />
            <span>Success!</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {children}
          
          <DialogFooter>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
                {cancelLabel}
              </Button>
              <Button 
                type="submit" 
                disabled={submitDisabled || submitLoading}
                className="flex-1 sm:flex-initial"
              >
                {submitLoading ? 'Loading...' : submitLabel}
              </Button>
            </div>
          </DialogFooter>
        </form>
        
        {showCloseButton && (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Confirmation Modal Implementation
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'default',
  confirmDisabled = false,
  confirmLoading = false,
  icon,
  size = 'sm',
  className,
  showCloseButton = true,
  zIndex = DEFAULT_Z_INDEX
}) => {
  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          MODAL_SIZES[size].className,
          'gap-4',
          className
        )}
        style={{ zIndex }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            {icon && <div className="shrink-0">{icon}</div>}
            <div>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && <DialogDescription>{description}</DialogDescription>}
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:flex-initial">
              {cancelLabel}
            </Button>
            <Button 
              variant={confirmVariant}
              onClick={handleConfirm}
              disabled={confirmDisabled || confirmLoading}
              className="flex-1 sm:flex-initial"
            >
              {confirmLoading ? 'Loading...' : confirmLabel}
            </Button>
          </div>
        </DialogFooter>
        
        {showCloseButton && (
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Main Modal Component with variant routing
export const Modal: React.FC<ModalProps> = (props) => {
  // Handle escape key
  useEffect(() => {
    if (!props.isOpen || props.closeOnEscape === false) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        props.onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [props.isOpen, props.closeOnEscape, props.onClose]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (!props.isOpen || props.preventScroll === false) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [props.isOpen, props.preventScroll]);

  // Route to appropriate modal variant
  switch (props.variant) {
    case 'simple':
      return <SimpleModal {...props} />;
    case 'content':
      return <ContentModal {...props} />;
    case 'form':
      return <FormModal {...props} />;
    case 'confirmation':
      return <ConfirmationModal {...props} />;
    default:
      console.warn('Unknown modal variant:', (props as any)?.variant);
      return null;
  }
};

// Export individual modal components for direct usage
export { SimpleModal, ContentModal, FormModal, ConfirmationModal };

// Export types
export * from './types';

// Default export
export default Modal;
