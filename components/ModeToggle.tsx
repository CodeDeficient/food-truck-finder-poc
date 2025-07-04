'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';

/**
 * A toggle component for switching between light, dark, and system themes.
 * @example
 * ModeToggle()
 * Renders a toggle button with a dropdown menu for theme selection.
 * @param {Object} useTheme - A custom hook that provides the current theme state and a function to update the theme.
 * @returns {JSX.Element} A dropdown menu integrated with a toggle button for theme switching.
 * @description
 *   - Utilizes icons to visually represent the current theme state, using transition effects for smooth changes.
 *   - Interacts with the `useTheme` hook to update the theme based on user's selection.
 *   - Includes a visually hidden span for accessibility to indicate the button's purpose.
 *   - Positions dropdown content using alignment properties for proper rendering.
 */
export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
