'use client';
import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import {} from 'next-themes';
/**
 * Wraps children components with a ThemeProvider to manage theme settings.
 * @example
 * ThemeProvider({ children: <MyComponent />, someProp: true })
 * <NextThemesProvider>...</NextThemesProvider>
 * @param {CustomThemeProviderProps} {children, ...props} - Components to be wrapped by the theme provider and additional props.
 * @returns {JSX.Element} A JSX element that provides theming capabilities.
 * @description
 *   - Utilizes NextThemesProvider to automatically manage themes based on system preferences.
 *   - The `storageKey` prop sets the key for theme storage; defaults to "vite-ui-theme" but can be customized.
 *   - Disables transitions on theme change to ensure a smooth experience.
 */
export function ThemeProvider({ children, ...props }) {
    return (<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange storageKey="vite-ui-theme" // Default storage key used by next-themes, can be customized
     {...props}>
      {children}
    </NextThemesProvider>);
}
export const useThemeSwitcher = () => {
    const context = useTheme();
    // eslint-disable-next-line sonarjs/different-types-comparison
    if (context === undefined) {
        throw new Error('useThemeSwitcher must be used within a ThemeProvider');
    }
    return context;
};
