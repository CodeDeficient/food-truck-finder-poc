'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
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
