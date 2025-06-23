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
        // Only spread props that are safe and expected by <Toast>
        const safeProps = Object.fromEntries(
          Object.entries(props).filter(([key]) =>
            [
              'type',
              'duration',
              'onOpenChange',
              'open',
              'variant',
              // add other allowed keys as needed
            ].includes(key)
          )
        );
        return (
          <Toast key={id} {...safeProps}>
            <div className="grid gap-1">
              {title != undefined && title !== '' && <ToastTitle>{title}</ToastTitle>}
              {description != undefined && description !== '' && <ToastDescription>{description}</ToastDescription>}
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
