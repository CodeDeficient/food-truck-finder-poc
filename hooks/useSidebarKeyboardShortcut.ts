import React from 'react';

const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

/**
 * Enables sidebar toggle via a keyboard shortcut.
 * @example
 * useSidebarKeyboardShortcut(toggleSidebarCallback)
 * // Toggles the sidebar when shortcut key is pressed.
 * @param {function} toggleSidebar - A callback function that triggers the sidebar toggle.
 * @returns {void} This function does not return a value.
 * @description
 *   - Listens for a specific key combination to trigger the toggle.
 *   - Uses `React.useEffect` to handle cleanup of the event listener.
 *   - Works with both `ctrl` and `meta` keys to accommodate different operating systems.
 */
export function useSidebarKeyboardShortcut(toggleSidebar: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);
}
