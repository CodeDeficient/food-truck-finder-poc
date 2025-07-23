/* eslint-disable max-params */
import { cn } from '@/lib/utils';
/**
 * Renders the content of a tooltip item based on the provided data and formatter.
 * @example
 * TooltipItemContent({
 *   formatter: myFormatterFunction,
 *   itemData: { value: 10, name: 'Item A' },
 *   item: someItem,
 *   index: 0,
 *   itemConfig: itemConfigObject,
 *   nestLabel: true,
 *   tooltipLabel: 'Label'
 * })
 * // Returns formatted content for the tooltip
 * @param {object} props - The properties for rendering the tooltip item content.
 * @param {function} [props.formatter] - Function to format the item data value and name.
 * @param {object} props.itemData - Data of the item to be displayed in the tooltip.
 * @param {any} props.item - The item itself, passed along to the formatter.
 * @param {number} props.index - The index of the item in the list.
 * @param {object} [props.itemConfig] - Configuration object for the item.
 * @param {boolean} props.nestLabel - Determines the vertical alignment of the content.
 * @param {string} [props.tooltipLabel] - Optional label to display when nestLabel is true.
 * @returns {JSX.Element} Rendered content for the tooltip item.
 * @description
 *   - Formats the tooltip content using a custom formatter if provided.
 *   - Displays the value as a formatted string if it exists and is non-zero.
 *   - Uses 'text-muted-foreground' and 'text-foreground' for text styling.
 */
export function TooltipItemContent(props) {
    const { formatter, itemData, item, index, itemConfig, nestLabel, tooltipLabel } = props;
    if (formatter !== undefined &&
        itemData?.value !== undefined &&
        itemData.name !== undefined &&
        itemData.name !== '') {
        const payloadArray = Array.isArray(itemData.payload)
            ? itemData.payload
            : [];
        return <>{formatter(itemData.value, itemData.name, item, index, payloadArray)}</>;
    }
    return (<div className={cn('flex flex-1 justify-between leading-none', nestLabel ? 'items-end' : 'items-center')}>
      <div className="grid gap-1.5">
        {nestLabel ? tooltipLabel : undefined}
        <span className="text-muted-foreground">{itemConfig?.label ?? itemData.name}</span>
      </div>
      {itemData.value !== undefined && itemData.value !== 0 && (<span className="font-mono font-medium tabular-nums text-foreground">
          {itemData.value.toLocaleString()}
        </span>)}
    </div>);
}
