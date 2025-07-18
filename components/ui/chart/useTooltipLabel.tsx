
import React from 'react';
import { cn } from '@/lib/utils';
import type { ChartConfig } from '../chart';
import type { Payload, ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

import { getPayloadConfigFromPayload } from './getPayloadConfigFromPayload';

interface UseTooltipLabelProps {
  readonly hideLabel: boolean;
  readonly payload: Payload<ValueType, NameType>[] | undefined;
  readonly label: unknown;
  readonly labelFormatter?: (
    value: unknown,
    payload: Payload<ValueType, NameType>[],
  ) => React.ReactNode;
  readonly labelClassName?: string;
  readonly config: ChartConfig;
  readonly labelKey?: string;
}

/**
 * Generates a formatted tooltip label based on provided payload data and configuration.
 * @example
 * useTooltipLabel({ hideLabel: false, payload: [...], label: 'Data', labelFormatter: (val) => val.toUpperCase() })
 * // returns formatted label wrapped in a div
 * @param {object} props - The properties to configure the tooltip label generation.
 * @param {boolean} props.hideLabel - Flag indicating whether to hide the tooltip label.
 * @param {array} props.payload - Array of payload objects to derive label information.
 * @param {string} props.label - Label text or key used for lookup in configuration.
 * @param {function} props.labelFormatter - Function to format the label display.
 * @param {string} props.labelClassName - CSS class name for styling the label.
 * @param {object} props.config - Configuration object for label customization.
 * @param {string} props.labelKey - Key to determine the item in the payload to display.
 * @returns {JSX.Element|undefined} Formatted label wrapped in a div or undefined if no label or payload is available.
 * @description
 *   - Uses `useMemo` for performance optimization by memoizing the label.
 *   - Applies a default 'font-medium' CSS class for label styling.
 *   - Uses configuration object to derive label when labelKey is not explicitly defined.
 *   - Returns formatted label via labelFormatter if provided.
 */
export function useTooltipLabel({
  hideLabel,
  payload,
  label,
  labelFormatter,
  labelClassName,
  config,
  labelKey,
}: UseTooltipLabelProps) {
  return React.useMemo(() => {
    if (hideLabel || !payload || payload.length === 0) {
      return; // Return undefined or an empty div if no label or payload
    }

    const [item] = payload;

    const key = `${labelKey ?? (item as { dataKey?: string; name?: string }).dataKey ?? (item as { dataKey?: string; name?: string }).name ?? 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      labelKey === undefined && typeof label === 'string'
        ? (config[label]?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      return (
        <div className={cn('font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>
      );
    }

    if (value === undefined || value === null || value === '') { /* empty */ }

    return <div className={cn('font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);
}
