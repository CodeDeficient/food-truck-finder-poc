'use client';

import { useToast } from '@/hooks/UseToast';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import type { ToasterToast } from '@/hooks/UseToast';

export function Toaster() {
  const { toasts }: { toasts: ToasterToast[] } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toast: ToasterToast) => {
        const { id, title, description, action, ...props } = toast;
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
