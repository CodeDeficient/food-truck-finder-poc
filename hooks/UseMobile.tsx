import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Determines if the current page view is displayed on a mobile device.
 * @example
 * useIsMobile()
 * true
 * @returns {boolean} - True if the current view is mobile, otherwise false.
 * @description
 *   - Utilizes the `matchMedia` API to listen for changes in viewport width.
 *   - It sets up an effect to update the mobile status when viewport changes.
 *   - The hook relies on a predefined `MOBILE_BREAKPOINT` constant to determine the mobile state.
 *   - Cleans up event listeners when the component using the hook is unmounted.
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
