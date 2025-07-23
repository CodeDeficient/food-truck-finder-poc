import { cn } from '@/lib/utils';
/**
 * Renders a tooltip indicator component with customizable styles.
 * @example
 * TooltipIndicator({
 *   indicator: 'dot',
 *   hideIndicator: false,
 *   indicatorColor: '#ff0000',
 *   nestLabel: true,
 *   itemConfig: { icon: SomeIconComponent }
 * })
 * <SomeIconComponent />
 * @param {string} indicator - Type of indicator, such as 'dot', 'line', or 'dashed'.
 * @param {boolean} hideIndicator - Determines whether the indicator should be hidden.
 * @param {string} indicatorColor - Specifies the color for the indicator background and border.
 * @param {boolean} nestLabel - Applies vertical margin when indicator is 'dashed'.
 * @param {object} itemConfig - Configuration object for item, possibly containing an icon component.
 * @returns {JSX.Element | undefined} JSX element representing the indicator, or an icon if provided.
 * @description
 *   - Uses CSS custom properties to dynamically set background and border colors.
 *   - Applies conditional styles based on the type of indicator.
 *   - Supports rendering a custom icon if `itemConfig.icon` is provided.
 *   - Returns nothing if `hideIndicator` is true.
 */
export function TooltipIndicator({ indicator, hideIndicator, indicatorColor, nestLabel, itemConfig, }) {
    if (itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.icon) {
        return <itemConfig.icon />;
    }
    if (hideIndicator) {
        return;
    }
    return (<div className={cn('shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]', {
            'h-2.5 w-2.5': indicator === 'dot',
            'w-1': indicator === 'line',
            'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
            'my-0.5': nestLabel && indicator === 'dashed',
        })} style={{
            '--color-bg': indicatorColor,
            '--color-border': indicatorColor,
        }}/>);
}
