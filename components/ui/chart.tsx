'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import {
  NameType,
  Payload,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

import { cn } from '@/lib/utils';
import { useTooltipLabel } from './chart/useTooltipLabel';
import { TooltipIndicator } from './chart/TooltipIndicator';
import { TooltipItemContent } from './chart/TooltipItemContent';
import { getPayloadConfigFromPayload } from './chart/getPayloadConfigFromPayload';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | undefined>(undefined);

function useChart() {
  const context = React.useContext(ChartContext);

  if (context === undefined) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    readonly config: ChartConfig;
    readonly children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replaceAll(':', '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
});
ChartContainer.displayName = 'Chart';

const ChartStyle = ({ id, config }: { readonly id: string; readonly config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, itemConfig]) => (itemConfig.theme ?? itemConfig.color) !== undefined);
  if (colorConfig.length === 0) {
    return undefined;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ?? itemConfig.color;
    return color !== undefined && color !== '' ? `  --color-${key}: ${color};` : undefined;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      readonly hideLabel?: boolean;
      readonly hideIndicator?: boolean;
      readonly indicator?: 'line' | 'dot' | 'dashed';
      readonly nameKey?: string;
      readonly labelKey?: string;
    }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart();

    // Ensure payload is properly typed
    const safePayload: Payload<ValueType, NameType>[] = Array.isArray(payload)
      ? (payload)
      : [];

    const tooltipLabel = useTooltipLabel({
      hideLabel,
      payload: safePayload,
      label,
      labelFormatter,
      labelClassName,
      config,
      labelKey
    });

    if (!active || !safePayload || safePayload.length === 0) {
      return undefined;
    }

    const nestLabel = safePayload.length === 1 && indicator !== 'dot';

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {nestLabel ? undefined : tooltipLabel}
        <div className="grid gap-1.5">
          {safePayload.map((item, index) => {
            // Add explicit type for itemData
            const dataKey = typeof item.dataKey === 'string' ? item.dataKey : undefined;
            const itemData: { name?: string; dataKey?: string; payload?: Record<string, unknown>; color?: string; value?: number } = {
              name: item.name === undefined ? undefined : String(item.name),
              dataKey,
              payload: typeof item.payload === 'object' && item.payload !== null ? (item.payload as Record<string, unknown>) : undefined,
              color: typeof item.color === 'string' ? item.color : undefined,
              value: typeof item.value === 'number' ? item.value : undefined,
            };
            const key = nameKey ?? itemData.name ?? itemData.dataKey ?? 'value';
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor =
              color ??
              (itemData.payload && typeof itemData.payload === 'object' && 'fill' in itemData.payload
                ? String(itemData.payload.fill)
                : undefined) ??
              itemData.color;

            return (
              <div
                key={itemData.dataKey ?? index}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center',
                )}
              >
                <TooltipIndicator
                  indicator={indicator}
                  hideIndicator={hideIndicator}
                  indicatorColor={indicatorColor}
                  nestLabel={nestLabel}
                  itemConfig={itemConfig}
                />
                <TooltipItemContent
                  formatter={formatter as ((value: number, name: string, item: unknown, index: number, payload: Record<string, unknown>[]) => React.ReactNode) | undefined}
                  itemData={itemData}
                  item={item}
                  index={index}
                  itemConfig={itemConfig}
                  nestLabel={nestLabel}
                  tooltipLabel={tooltipLabel}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  const { config } = useChart();

  const safePayload: Payload<ValueType, NameType>[] = Array.isArray(payload)
    ? (payload as Payload<ValueType, NameType>[])
    : [];

  if (!safePayload || safePayload.length === 0) {
    return undefined;
  }

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {safePayload.map((item, idx) => {
        const dataKey = typeof item.dataKey === 'string' ? item.dataKey : undefined;
        const itemData: { dataKey?: string; value?: string; color?: string } = {
          dataKey,
          value: typeof item.value === 'string' ? item.value : undefined,
          color: typeof item.color === 'string' ? item.color : undefined,
        };
        const keyValue = nameKey ?? (itemData.dataKey !== undefined && itemData.dataKey !== '' ? String(itemData.dataKey) : 'value');
        const key = keyValue;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={itemData.value ?? idx}
            className={cn(
              'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: itemData.color !== undefined && itemData.color !== '' ? String(itemData.color) : undefined,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = 'ChartLegend';

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
