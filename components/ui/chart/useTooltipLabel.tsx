import React from 'react';
import { cn } from '@/lib/utils';
import { ChartConfig } from '../chart'; // Assuming ChartConfig is exported from chart.tsx

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return;
  }

  const payloadPayload =
    'payload' in payload &&
    typeof (payload as Record<string, unknown>).payload === 'object' &&
    (payload as Record<string, unknown>).payload !== null
      ? (payload as Record<string, unknown>).payload
      : undefined;

  let configLabelKey: string = key;

  if (key in (payload as Record<string, unknown>) && typeof (payload as Record<string, unknown>)[key] === 'string') {
    configLabelKey = (payload as Record<string, unknown>)[key] as string;
  } else if (
    payloadPayload !== undefined &&
    key in (payloadPayload as Record<string, unknown>) &&
    typeof (payloadPayload as Record<string, unknown>)[key] === 'string'
  ) {
    configLabelKey = (payloadPayload as Record<string, unknown>)[key] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key];
}

interface UseTooltipLabelProps {
  hideLabel: boolean;
  payload: unknown[] | undefined;
  label: unknown;
  labelFormatter?: (value: unknown, payload: unknown[]) => React.ReactNode;
  labelClassName?: string;
  config: ChartConfig;
  labelKey?: string;
}

export function useTooltipLabel({
  hideLabel,
  payload,
  label,
  labelFormatter,
  labelClassName,
  config,
  labelKey
}: UseTooltipLabelProps) {
  return React.useMemo(() => {
    if (hideLabel === true || (payload?.length ?? 0) === 0) {
      return null;
    }

    const [item] = payload as unknown[];

    const key = `${labelKey ?? (item as { dataKey?: string; name?: string }).dataKey ?? (item as { dataKey?: string; name?: string }).name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      (labelKey === undefined && typeof label === 'string') ? config[label]?.label ?? label : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload as unknown[])}</div>
      );
    }

    if (value === undefined || value === null || value === '') {
      return null;
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
}
