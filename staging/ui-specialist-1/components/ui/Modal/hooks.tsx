'use client';

/**
 * Modal Hooks
 * UI_SPECIALIST_1 - Task 1.1.3
 */

import { useState, useCallback, useRef } from 'react';
import { ModalProps, ModalError } from './types';

export interface UseModalReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  error: ModalError | undefined;
  setError: (error: ModalError | undefined) => void;
  clearError: () => void;
}

/**
 * Basic modal state management hook
 */
export const useModal = (initialOpen = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [error, setError] = useState<ModalError | undefined>(undefined);

  const open = useCallback(() => {
    setIsOpen(true);
    setError(undefined); // Clear errors when opening
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setError(undefined); // Clear errors when closing
  }, []);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) setError(undefined); // Clear errors when opening
      return !prev;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(undefined);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    error,
    setError,
    clearError
  };
};

export interface UseConfirmationModalReturn extends UseModalReturn {
  confirm: (options: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
  }) => Promise<boolean>;
  isLoading: boolean;
}

/**
 * Confirmation modal hook with promise-based API
 */
export const useConfirmationModal = (): UseConfirmationModalReturn => {
  const modal = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: {
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
  }) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      modal.open();
    });
  }, [modal]);

  const handleConfirm = useCallback(() => {
    setIsLoading(true);
    resolveRef.current?.(true);
    resolveRef.current = null;
    setIsLoading(false);
    modal.close();
  }, [modal]);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    modal.close();
  }, [modal]);

  return {
    ...modal,
    confirm,
    isLoading,
    close: handleCancel,
  };
};

export interface UseFormModalReturn extends UseModalReturn {
  isSubmitting: boolean;
  setSubmitting: (submitting: boolean) => void;
  submitForm: () => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}

/**
 * Form modal hook with form submission handling
 */
export const useFormModal = (): UseFormModalReturn => {
  const modal = useModal();
  const [isSubmitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submitForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  }, []);

  const close = useCallback(() => {
    modal.close();
    setSubmitting(false); // Reset submitting state on close
  }, [modal]);

  return {
    ...modal,
    close,
    isSubmitting,
    setSubmitting,
    submitForm,
    formRef
  };
};

export interface ModalStackItem {
  id: string;
  props: ModalProps;
  zIndex: number;
}

export interface UseModalStackReturn {
  modals: ModalStackItem[];
  openModal: (props: Omit<ModalProps, 'isOpen'>) => string;
  closeModal: (id: string) => void;
  closeTopModal: () => void;
  closeAllModals: () => void;
}

/**
 * Modal stack management hook for handling multiple modals
 */
export const useModalStack = (baseZIndex = 1000): UseModalStackReturn => {
  const [modals, setModals] = useState<ModalStackItem[]>([]);
  const nextIdRef = useRef(1);

  const openModal = useCallback((props: Omit<ModalProps, 'isOpen'>) => {
    const id = `modal-${nextIdRef.current++}`;
    const zIndex = baseZIndex + (modals.length * 10);
    
    setModals(prev => [...prev, {
      id,
      props: { ...props, isOpen: true } as ModalProps,
      zIndex
    }]);
    
    return id;
  }, [modals.length, baseZIndex]);

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id));
  }, []);

  const closeTopModal = useCallback(() => {
    setModals(prev => prev.slice(0, -1));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  return {
    modals,
    openModal,
    closeModal,
    closeTopModal,
    closeAllModals
  };
};
