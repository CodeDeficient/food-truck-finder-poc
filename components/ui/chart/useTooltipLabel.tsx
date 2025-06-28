import React from 'react';
import { cn } from '@/lib/utils';
import { ChartConfig } from '../chart';
import { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

import { getPayloadConfigFromPayload } from './getPayloadConfigFromPayload';

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
    if (hideLabel || !payload || payload.length === 0) {
      return null; // Return null or an empty div if no label or payload
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
      
    }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
}
