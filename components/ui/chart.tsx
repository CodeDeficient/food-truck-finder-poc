'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
// Remove unused imports
// import {
//   type Payload,
//   type NameType,
//   type ValueType,
// } from "recharts/types/component/DefaultTooltipContent"

import { cn } from '@/lib/utils';

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

  if (context == undefined) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig;
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
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

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([_, itemConfig]) => (itemConfig.theme ?? itemConfig.color) !== undefined);
  if (colorConfig.length === 0) {
    return;
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

// Helper function to render tooltip label
function useTooltipLabel({
  hideLabel,
  payload,
  label,
  labelFormatter,
  labelClassName,
  config,
  labelKey
}: {
  readonly hideLabel: boolean;
  readonly payload: unknown[] | undefined;
  readonly label: unknown;
  readonly labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode;
  readonly labelClassName?: string;
  readonly config: ChartConfig;
  readonly labelKey?: string;
}) {
  return React.useMemo(() => {
    if (hideLabel === true || (payload?.length ?? 0) === 0) {
      return;
    }

    const [item] = payload;

    const key = `${labelKey ?? (item as { dataKey?: string; name?: string }).dataKey ?? (item as { dataKey?: string; name?: string }).name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      (labelKey == undefined && typeof label === 'string') ? config[label]?.label ?? label : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
      );
    }

    if (value === undefined || value === null || value === '') {
      return;
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
}

// Helper function to render tooltip indicator
function TooltipIndicator({
  indicator,
  hideIndicator,
  indicatorColor,
  nestLabel,
  itemConfig
}: {
  readonly indicator: string;
  readonly hideIndicator: boolean;
  readonly indicatorColor?: string;
  readonly nestLabel: boolean;
  readonly itemConfig?: { icon?: React.ComponentType };
}) {
  if (itemConfig?.icon) {
    return <itemConfig.icon />;
  }

  if (hideIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
        {
          'h-2.5 w-2.5': indicator === 'dot',
          'w-1': indicator === 'line',
          'w-0 border-[1.5px] border-dashed bg-transparent': indicator === 'dashed',
          'my-0.5': nestLabel && indicator === 'dashed',
        },
      )}
      style={
        {
          '--color-bg': indicatorColor,
          '--color-border': indicatorColor,
        } as React.CSSProperties
      }
    />
  );
}

// Helper function to render tooltip item content
function TooltipItemContent({
  formatter,
  itemData,
  item,
  index,
  itemConfig,
  nestLabel,
  tooltipLabel
}: {
  readonly formatter?: (value: number, name: string, item: unknown, index: number, payload: Record<string, unknown>[]) => React.ReactNode;
  readonly itemData: { name?: string; dataKey?: string; payload?: unknown; color?: string; value?: number };
  readonly item: unknown;
  readonly index: number;
  readonly itemConfig?: { label?: React.ReactNode };
  readonly nestLabel: boolean;
  readonly tooltipLabel: React.ReactNode;
}) {
  if (formatter !== undefined && itemData?.value !== undefined && itemData.name !== undefined && itemData.name !== '') {
    const payloadArray = Array.isArray(itemData.payload)
      ? (itemData.payload as Record<string, unknown>[])
      : [];
    return <>{formatter(itemData.value, itemData.name, item, index, payloadArray)}</>;
  }

  return (
    <div
      className={cn(
        'flex flex-1 justify-between leading-none',
        nestLabel ? 'items-end' : 'items-center',
      )}
    >
      <div className="grid gap-1.5">
        {nestLabel ? tooltipLabel : undefined}
        <span className="text-muted-foreground">
          {itemConfig?.label ?? itemData.name}
        </span>
      </div>
      {itemData.value !== undefined && itemData.value !== 0 && (
        <span className="font-mono font-medium tabular-nums text-foreground">
          {itemData.value.toLocaleString()}
        </span>
      )}
    </div>
  );
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean;
      hideIndicator?: boolean;
      indicator?: 'line' | 'dot' | 'dashed';
      nameKey?: string;
      labelKey?: string;
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

    const tooltipLabel = useTooltipLabel({
      hideLabel,
      payload,
      label,
      labelFormatter,
      labelClassName,
      config,
      labelKey
    });

    if (active !== true || (payload?.length ?? 0) === 0) {
      return;
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot';

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
          {payload.map((item: unknown, index: number) => {
            const itemData = item as { name?: string; dataKey?: string; payload?: unknown; color?: string; value?: number };
            const key = `${nameKey ?? itemData.name ?? itemData.dataKey ?? 'value'}`;
            const itemConfig = getPayloadConfigFromPayload(config, item, key);
            const indicatorColor =
              color ??
              (itemData.payload !== undefined && itemData.payload !== null && typeof itemData.payload === 'object' && 'fill' in itemData.payload
                ? String((itemData.payload as Record<string, unknown>).fill)
                : undefined) ??
              itemData.color;

            return (
              <div
                key={itemData.dataKey}
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
                  formatter={formatter}
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
  React.ComponentProps<'div'> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  const { config } = useChart();

  if ((payload?.length ?? 0) === 0) {
    return;
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
      {payload.map((item: unknown) => {
        const itemData = item as { dataKey?: string; value?: string; color?: string };
        const keyValue = nameKey ?? (itemData.dataKey !== undefined && itemData.dataKey !== '' ? String(itemData.dataKey) : 'value');
        const key = `${keyValue}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={itemData.value as string}
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

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload == undefined) {
    return;
  }

  const payloadPayload =
    'payload' in payload && typeof (payload as Record<string, unknown>).payload === 'object' && (payload as Record<string, unknown>).payload !== undefined
      ? (payload as Record<string, unknown>).payload
      : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload !== undefined && payloadPayload !== null &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
