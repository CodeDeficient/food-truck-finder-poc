import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Determines if the user's window is less than the mobile breakpoint width.
 * @example
 * useIsMobile()
 * true
 * @returns {boolean} Returns true if the window width is below the mobile breakpoint, false otherwise.
 * @description
 *   - Utilizes the MediaQueryList API to listen for changes in window width.
 *   - Initializes state to handle the mobile view status.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>();

  React.useEffect(() => {
    const mql = globalThis.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile === true;
}
