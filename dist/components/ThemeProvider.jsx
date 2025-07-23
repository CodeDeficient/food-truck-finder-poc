'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
export function ThemeProvider(_a) {
    var { children } = _a, props = __rest(_a, ["children"]);
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
