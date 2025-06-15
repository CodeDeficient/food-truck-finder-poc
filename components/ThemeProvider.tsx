'use client';

import * as React from 'react';
// @ts-expect-error TS(2792): Cannot find module 'next-themes'. Did you mean to ... Remove this comment to see the full error message
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
// @ts-expect-error TS(2792): Cannot find module 'next-themes'. Did you mean to ... Remove this comment to see the full error message
import { type ThemeProviderProps } from 'next-themes';

export interface CustomThemeProviderProps extends ThemeProviderProps {
  readonly children: React.ReactNode;
}

export function ThemeProvider({ children, ...props }: CustomThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="vite-ui-theme" // Default storage key used by next-themes, can be customized
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export const useThemeSwitcher = () => {
  const context = useTheme();

  // eslint-disable-next-line sonarjs/different-types-comparison
  if (context === undefined) {
    throw new Error('useThemeSwitcher must be used within a ThemeProvider');
  }

  return context;
};
