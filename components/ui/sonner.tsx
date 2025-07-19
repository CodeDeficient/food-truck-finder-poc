'use client';

import * as React from 'react';
import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * Renders a Sonner toast notification with a customizable theme and style.
 * @example
 * renderToaster({ theme: 'light', position: 'top-right' })
 * Creates a toaster with a light theme positioned at the top-right of the screen.
 * @param {ToasterProps} props - Props for customizing the toaster appearance and behavior.
 * @returns {JSX.Element} A JSX element rendering the custom-styled toaster notification.
 * @description
 *   - Applies default theme as 'system' if no theme is specified.
 *   - Utilizes class groups for styling elements based on the parent toaster class.
 *   - Binds toast option classes to style various components like toast and buttons.
 *   - Requires React JSX environment to render properly.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <SonnerToaster
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
