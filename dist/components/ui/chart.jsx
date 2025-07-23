/* eslint-disable max-params */
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
import * as RechartsPrimitive from 'recharts';
import { cn } from '@/lib/utils';
import { useTooltipLabel } from './chart/useTooltipLabel';
import { TooltipIndicator } from './chart/TooltipIndicator';
import { TooltipItemContent } from './chart/TooltipItemContent';
import { getPayloadConfigFromPayload } from './chart/getPayloadConfigFromPayload';
// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' };
const ChartContext = React.createContext(undefined);
function useChart() {
    const context = React.useContext(ChartContext);
    if (context === undefined) {
        throw new Error('useChart must be used within a <ChartContainer />');
    }
    return context;
}
const ChartContainer = React.forwardRef((_a, ref) => {
    var { id, className, children, config } = _a, props = __rest(_a, ["id", "className", "children", "config"]);
    const uniqueId = React.useId();
    const chartId = `chart-${id !== null && id !== void 0 ? id : uniqueId.replaceAll(':', '')}`;
    return (<ChartContext.Provider value={{ config }}>
      <div data-chart={chartId} ref={ref} className={cn("flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none", className)} {...props}>
        <ChartStyle id={chartId} config={config}/>
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>);
});
ChartContainer.displayName = 'Chart';
/**
 * Generates and returns a style JSX element with theme-based color configurations for charts.
 * @example
 * const jsxStyleElement = generateStyleElement({ id: 'myChart', config: myChartConfig });
 * @param {Object} context - An object containing the chart's identifier and configuration.
 * @param {string} context.id - The unique identifier for the chart.
 * @param {ChartConfig} context.config - The configuration object for the chart.
 * @returns {JSX.Element|undefined} A JSX style element setting CSS variables for chart colors, or undefined if no color configuration is provided.
 * @description
 *   - Only charts with theme or color properties in their configuration will generate color styles.
 *   - Utilizes `dangerouslySetInnerHTML` to inject computed styles into JSX.
 */
const ChartStyle = ({ id, config }) => {
    const colorConfig = Object.entries(config).filter(([_, itemConfig]) => { var _a; return ((_a = itemConfig.theme) !== null && _a !== void 0 ? _a : itemConfig.color) !== undefined; });
    if (colorConfig.length === 0) {
        return;
    }
    return (<style dangerouslySetInnerHTML={{
            __html: Object.entries(THEMES)
                .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                .map(([key, itemConfig]) => {
                var _a, _b;
                const color = (_b = (_a = itemConfig.theme) === null || _a === void 0 ? void 0 : _a[theme]) !== null && _b !== void 0 ? _b : itemConfig.color;
                return color !== undefined && color !== '' ? `  --color-${key}: ${color};` : undefined;
            })
                .join('\n')}
}
`)
                .join('\n'),
        }}/>);
};
const ChartTooltip = RechartsPrimitive.Tooltip;
function isNonEmptyArray(arr) {
    return Array.isArray(arr) && arr.length > 0;
}
/**
* Renders a tooltip indicator and content for a chart
* @example
* ChartTooltipIndicatorAndContent({ indicator: 'sample', hideIndicator: false })
* Returns a JSX fragment containing TooltipIndicator and TooltipItemContent components
* @param {ChartTooltipIndicatorAndContentProps} props - Configuration object for rendering the tooltip components.
* @returns {JSX.Element} A fragment that contains tooltip indicator and item content components.
* @description
*   - Combines TooltipIndicator and TooltipItemContent using provided configuration.
*   - Uses the `formatter` function to format the item data in the tooltip content.
*   - Passes the `itemConfig` and `nestLabel` to both child components for consistent rendering.
*/
function ChartTooltipIndicatorAndContent(props) {
    const { indicator, hideIndicator, indicatorColor, nestLabel, itemConfig, formatter, itemData, item, index, tooltipLabel, } = props;
    return (<>
      <TooltipIndicator indicator={indicator} hideIndicator={hideIndicator} indicatorColor={indicatorColor} nestLabel={nestLabel} itemConfig={itemConfig}/>
      <TooltipItemContent formatter={formatter} itemData={itemData} item={item} index={index} itemConfig={itemConfig} nestLabel={nestLabel} tooltipLabel={tooltipLabel}/>
    </>);
}
/**
 * Renders a chart tooltip item with a configurable indicator.
 * @example
 * ChartTooltipItem({ item: { name: "Sample", dataKey: "key" }, index: 0, indicatorProps: { indicator: "dot", hideIndicator: false, color: "blue" } })
 * // Returns JSX element for tooltip with indicator
 * @param {Object} item - The chart item containing dataKey, name, payload, color, and value attributes.
 * @param {number} index - The index position of the chart item.
 * @param {Object} indicatorProps - Properties for configuring the indicator like type, visibility, color, etc.
 * @returns {JSX.Element} A JSX element rendering the chart tooltip item with an optional indicator.
 * @description
 *   - The tooltip item will display customizable content based on provided item configuration.
 *   - Tooltip indicator can be hidden or shown based on `hideIndicator` property.
 *   - Determines the color of the indicator, initially defaulting to item-specific color or payload-specific fill.
 */
function ChartTooltipItem({ item, index, indicatorProps }) {
    var _a, _b, _c, _d;
    const { indicator, hideIndicator, color, nestLabel, config, nameKey, tooltipLabel, formatter } = indicatorProps;
    const dataKey = typeof item.dataKey === 'string' ? item.dataKey : undefined;
    const itemData = {
        name: item.name === undefined ? undefined : String(item.name),
        dataKey,
        payload: typeof item.payload === 'object' && item.payload !== null
            ? item.payload
            : undefined,
        color: typeof item.color === 'string' ? item.color : undefined,
        value: typeof item.value === 'number' ? item.value : undefined,
    };
    const key = (_b = (_a = nameKey !== null && nameKey !== void 0 ? nameKey : itemData.name) !== null && _a !== void 0 ? _a : itemData.dataKey) !== null && _b !== void 0 ? _b : 'value';
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const indicatorColor = (_c = color !== null && color !== void 0 ? color : (itemData.payload !== undefined &&
        typeof itemData.payload === 'object' &&
        'fill' in itemData.payload
        ? String(itemData.payload.fill)
        : undefined)) !== null && _c !== void 0 ? _c : itemData.color;
    return (<div key={(_d = itemData.dataKey) !== null && _d !== void 0 ? _d : index} className={cn('flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground', indicator === 'dot' && 'items-center')}>
      <ChartTooltipIndicatorAndContent indicator={indicator} hideIndicator={hideIndicator} indicatorColor={indicatorColor} nestLabel={nestLabel} itemConfig={itemConfig} formatter={formatter} itemData={itemData} item={item} index={index} tooltipLabel={tooltipLabel}/>
    </div>);
}
/**
 * Represents a grid layout of tooltip items for a chart.
 * @example
 * ChartTooltipItems({ safePayload: payloadData, indicatorProps: chartIndicatorSettings })
 * <div className="grid gap-1.5">...</div>
 * @param {Readonly<ChartTooltipItemsProps>} props - Contains the payload and indicator properties required for rendering tooltip items.
 * @returns {JSX.Element} A div containing tooltip items in a grid layout.
 * @description
 *   - Utilizes the `ChartTooltipItem` component to render individual tooltip items.
 *   - Applies a CSS class for a grid layout with spacing between items.
 *   - Ensures safe access to each item's key using `item.dataKey ?? index`.
 */
function ChartTooltipItems(props) {
    const { safePayload, indicatorProps } = props;
    return (<div className="grid gap-1.5">
      {safePayload.map((item, index) => {
            var _a;
            return (<ChartTooltipItem key={(_a = item.dataKey) !== null && _a !== void 0 ? _a : index} item={item} index={index} indicatorProps={indicatorProps}/>);
        })}
    </div>);
}
const ChartTooltipContent = React.forwardRef(({ active, payload, className, indicator = 'dot', hideLabel = false, hideIndicator = false, label, labelFormatter, labelClassName, formatter, color, nameKey, labelKey, }, ref) => {
    const { config } = useChart();
    const safePayload = isNonEmptyArray(payload) ? payload : [];
    const tooltipLabel = useTooltipLabel({
        hideLabel,
        payload: safePayload,
        label,
        labelFormatter,
        labelClassName,
        config,
        labelKey,
    });
    if (active === false || !isNonEmptyArray(safePayload)) {
        return;
    }
    const nestLabel = safePayload.length === 1 && indicator !== 'dot';
    return (<div ref={ref} className={cn('grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl', className)}>
        {!nestLabel && tooltipLabel}
        <ChartTooltipItems safePayload={safePayload} indicatorProps={{
            indicator,
            hideIndicator,
            formatter: formatter,
            nameKey,
            color,
            tooltipLabel,
            config,
            nestLabel,
        }}/>
      </div>);
});
ChartTooltipContent.displayName = 'ChartTooltip';
const ChartLegend = RechartsPrimitive.Legend;
/**
 * Renders a chart legend item with customizable appearance.
 * @example
 * ChartLegendItem({ item: sampleItem, idx: 0, hideIcon: false, nameKey: 'legendItem', config: sampleConfig })
 * Returns a JSX element representing the chart legend item with an icon, label, or color box.
 * @param {Object} item - The legend item data including `dataKey`, `value`, and `color`.
 * @param {number} idx - The index of the item in the legend list to be used as a fallback key.
 * @param {boolean} hideIcon - A flag to determine whether to hide the item icon.
 * @param {string} [nameKey] - Optional key to identify the legend item, falling back to `dataKey` or 'value'.
 * @param {Object} config - Configuration object to customize the legend item appearance and behavior.
 * @returns {JSX.Element} A JSX element representing the chart legend item with optional icon, label, or color box.
 * @description
 *   - Uses the item's `dataKey` as a unique identifier when `nameKey` is not provided.
 *   - Applies default styling to SVG icons within the legend item using Tailwind CSS classes.
 *   - Dynamically renders either an icon or a styled color box based on the `hideIcon` flag and `itemConfig`.
 *   - Retrieves configuration using `getPayloadConfigFromPayload` for interactive legend item customization.
 */
function ChartLegendItem({ item, idx, hideIcon, nameKey, config }) {
    var _a, _b, _c, _d, _e;
    const dataKey = (_a = item.dataKey) === null || _a === void 0 ? void 0 : _a.toString();
    const itemData = {
        dataKey,
        value: (_b = item.value) === null || _b === void 0 ? void 0 : _b.toString(),
        color: (_c = item.color) === null || _c === void 0 ? void 0 : _c.toString(),
    };
    const key = (_d = nameKey !== null && nameKey !== void 0 ? nameKey : dataKey) !== null && _d !== void 0 ? _d : 'value';
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    return (<div key={(_e = itemData.value) !== null && _e !== void 0 ? _e : idx} className={cn('flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground')}>
      {(itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.icon) && !hideIcon ? (<itemConfig.icon />) : (<div className="size-2 shrink-0 rounded-[2px]" style={{
                backgroundColor: itemData.color,
            }}/>)}
      {itemConfig === null || itemConfig === void 0 ? void 0 : itemConfig.label}
    </div>);
}
const ChartLegendContent = React.forwardRef(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
    const { config } = useChart();
    const safePayload = isNonEmptyArray(payload)
        ? payload
        : [];
    if (!isNonEmptyArray(safePayload)) {
        return;
    }
    return (<div ref={ref} className={cn('flex items-center justify-center gap-4', verticalAlign === 'top' ? 'pb-3' : 'pt-3', className)}>
      {safePayload.map((item, idx) => {
            var _a;
            return (<ChartLegendItem key={(_a = item.dataKey) !== null && _a !== void 0 ? _a : idx} item={item} idx={idx} hideIcon={hideIcon} nameKey={nameKey} config={config}/>);
        })}
    </div>);
});
ChartLegendContent.displayName = 'ChartLegend';
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle, };
