/* eslint-disable max-params */
'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';
import { NameType, Payload, ValueType } from 'recharts/types/component/DefaultTooltipContent';

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
    readonly children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >['children'];
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
  const colorConfig = Object.entries(config).filter(
    ([_, itemConfig]) => (itemConfig.theme ?? itemConfig.color) !== undefined,
  );
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

function isNonEmptyArray<T>(arr: T[] | undefined): arr is T[] {
  return Array.isArray(arr) && arr.length > 0;
}

type TooltipFormatter = (
  value: number,
  name: string,
  item: unknown,
  index: number,
  payload: Record<string, unknown>[],
) => React.ReactNode;
type TooltipItemData = {
  name?: string;
  dataKey?: string;
  payload?: Record<string, unknown>;
  color?: string;
  value?: number;
};

type ChartTooltipIndicatorAndContentProps = {
  indicator: 'line' | 'dot' | 'dashed';
  hideIndicator: boolean;
  indicatorColor?: string;
  nestLabel: boolean;
  itemConfig: Record<string, unknown>;
  formatter: TooltipFormatter | undefined;
  itemData: TooltipItemData;
  item: Payload<ValueType, NameType>;
  index: number;
  tooltipLabel: React.ReactNode;
};

function ChartTooltipIndicatorAndContent(props: Readonly<ChartTooltipIndicatorAndContentProps>) {
  const {
    indicator,
    hideIndicator,
    indicatorColor,
    nestLabel,
    itemConfig,
    formatter,
    itemData,
    item,
    index,
    tooltipLabel,
  } = props;
  return (
    <>
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
    </>
  );
}

type ChartTooltipItemProps = {
  item: Payload<ValueType, NameType>;
  index: number;
  indicatorProps: {
    indicator: 'line' | 'dot' | 'dashed';
    hideIndicator: boolean;
    color?: string;
    nestLabel: boolean;
    config: ChartConfig;
    nameKey?: string;
    tooltipLabel: React.ReactNode;
    formatter: TooltipFormatter | undefined;
  };
};

function ChartTooltipItem({ item, index, indicatorProps }: Readonly<ChartTooltipItemProps>) {
  const { indicator, hideIndicator, color, nestLabel, config, nameKey, tooltipLabel, formatter } =
    indicatorProps;
  const dataKey = typeof item.dataKey === 'string' ? item.dataKey : undefined;

  const itemData: TooltipItemData = {
    name: item.name === undefined ? undefined : String(item.name),
    dataKey,
    payload:
      typeof item.payload === 'object' && item.payload
        ? (item.payload as Record<string, unknown>)
        : undefined,
    color: typeof item.color === 'string' ? item.color : undefined,
    value: typeof item.value === 'number' ? item.value : undefined,
  };
  const key = nameKey ?? itemData.name ?? itemData.dataKey ?? 'value';
  const itemConfig = getPayloadConfigFromPayload(config, item, key) as Record<string, unknown>;
  const indicatorColor =
    color ??
    (itemData.payload !== undefined &&
    typeof itemData.payload === 'object' &&
    'fill' in itemData.payload
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
      <ChartTooltipIndicatorAndContent
        indicator={indicator}
        hideIndicator={hideIndicator}
        indicatorColor={indicatorColor}
        nestLabel={nestLabel}
        itemConfig={itemConfig}
        formatter={formatter}
        itemData={itemData}
        item={item}
        index={index}
        tooltipLabel={tooltipLabel}
      />
    </div>
  );
}

type ChartTooltipItemsProps = {
  safePayload: Payload<ValueType, NameType>[];
  indicatorProps: {
    indicator: 'line' | 'dot' | 'dashed';
    hideIndicator: boolean;
    formatter: TooltipFormatter | undefined;
    nameKey?: string;
    color?: string;
    tooltipLabel: React.ReactNode;
    config: ChartConfig;
    nestLabel: boolean;
  };
};

function ChartTooltipItems(props: Readonly<ChartTooltipItemsProps>) {
  const { safePayload, indicatorProps } = props;
  return (
    <div className="grid gap-1.5">
      {safePayload.map((item, index) => (
        <ChartTooltipItem
          key={item.dataKey ?? index}
          item={item}
          index={index}
          indicatorProps={indicatorProps}
        />
      ))}
    </div>
  );
}

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
    const safePayload: Payload<ValueType, NameType>[] = isNonEmptyArray(payload) ? payload : [];
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

    return (
      <div
        ref={ref}
        className={cn(
          'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {!nestLabel && tooltipLabel}
        <ChartTooltipItems
          safePayload={safePayload}
          indicatorProps={{
            indicator,
            hideIndicator,
            formatter: formatter as TooltipFormatter | undefined,
            nameKey,
            color,
            tooltipLabel,
            config,
            nestLabel,
          }}
        />
      </div>
    );
  },
);
ChartTooltipContent.displayName = 'ChartTooltip';

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendItemProps {
  item: Payload<ValueType, NameType>;
  idx: number;
  hideIcon: boolean;
  nameKey?: string;
  config: ChartConfig;
}

function ChartLegendItem({ item, idx, hideIcon, nameKey, config }: Readonly<ChartLegendItemProps>) {
  const dataKey = item.dataKey?.toString();
  const itemData = {
    dataKey,
    value: item.value?.toString(),
    color: item.color?.toString(),
  };
  const key = nameKey ?? dataKey ?? 'value';
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
            backgroundColor: itemData.color,
          }}
        />
      )}
      {itemConfig?.label}
    </div>
  );
}

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean;
      nameKey?: string;
    }
>(({ className, hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  const { config } = useChart();
  const safePayload: Payload<ValueType, NameType>[] = isNonEmptyArray(payload)
    ? (payload as Payload<ValueType, NameType>[])
    : [];
  if (!isNonEmptyArray(safePayload)) {
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
      {safePayload.map((item, idx) => (
        <ChartLegendItem
          key={item.dataKey ?? idx}
          item={item}
          idx={idx}
          hideIcon={hideIcon}
          nameKey={nameKey}
          config={config}
        />
      ))}
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
