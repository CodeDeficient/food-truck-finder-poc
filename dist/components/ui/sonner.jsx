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
import { Toaster as SonnerToaster } from 'sonner';
import { useTheme } from 'next-themes';
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
const Toaster = (_a) => {
    var props = __rest(_a, []);
    const { theme = 'system' } = useTheme();
    return (<SonnerToaster theme={theme} className="toaster group" toastOptions={{
            classNames: {
                toast: 'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
                description: 'group-[.toast]:text-muted-foreground',
                actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
            },
        }} {...props}/>);
};
export { Toaster };
