/**
 * Unified Modal Component Types
 * UI_SPECIALIST_1 - Task 1.1.2
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ModalVariant = 'simple' | 'content' | 'form' | 'confirmation';

export interface ModalAction {
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'neon';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface ModalError {
  message: string;
  field?: string;
  code?: string;
}

export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  zIndex?: number;
}

export interface SimpleModalProps extends BaseModalProps {
  variant: 'simple';
  actions?: ModalAction[];
  error?: ModalError;
}

export interface ContentModalProps extends BaseModalProps {
  variant: 'content';
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  error?: ModalError;
  scrollable?: boolean;
}

export interface FormModalProps extends BaseModalProps {
  variant: 'form';
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  submitDisabled?: boolean;
  submitLoading?: boolean;
  error?: ModalError;
  success?: boolean;
}

export interface ConfirmationModalProps extends BaseModalProps {
  variant: 'confirmation';
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  confirmVariant?: 'default' | 'destructive';
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  icon?: ReactNode;
}

export type ModalProps = 
  | SimpleModalProps 
  | ContentModalProps 
  | FormModalProps 
  | ConfirmationModalProps;

export interface ModalContextValue {
  openModal: (modalProps: ModalProps) => string;
  closeModal: (id?: string) => void;
  closeAllModals: () => void;
  modals: Array<{ id: string; props: ModalProps }>;
}

export interface ModalSizeConfig {
  className: string;
  maxWidth: string;
  maxHeight?: string;
}

export const MODAL_SIZES: Record<ModalSize, ModalSizeConfig> = {
  sm: { className: 'max-w-sm', maxWidth: '24rem' },
  md: { className: 'max-w-md', maxWidth: '28rem' },
  lg: { className: 'max-w-2xl', maxWidth: '42rem' },
  xl: { className: 'max-w-4xl', maxWidth: '56rem' },
  full: { className: 'max-w-[95vw] max-h-[95vh]', maxWidth: '95vw', maxHeight: '95vh' }
};

export const DEFAULT_Z_INDEX = 1000;
export const MODAL_STACK_INCREMENT = 10;
