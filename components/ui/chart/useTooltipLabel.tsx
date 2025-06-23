import React from 'react';
import { cn } from '@/lib/utils';
import { ChartConfig } from '../chart';
import { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

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
  readonly hideLabel: boolean;
  readonly payload: Payload<ValueType, NameType>[] | undefined;
  readonly label: unknown;
  readonly labelFormatter?: (value: unknown, payload: Payload<ValueType, NameType>[]) => React.ReactNode;
  readonly labelClassName?: string;
  readonly config: ChartConfig;
  readonly labelKey?: string;
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
      return;
    }

    const [item] = payload;

    const key = `${labelKey ?? (item as { dataKey?: string; name?: string }).dataKey ?? (item as { dataKey?: string; name?: string }).name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      (labelKey === undefined && typeof label === 'string') ? config[label]?.label ?? label : itemConfig?.label;

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
