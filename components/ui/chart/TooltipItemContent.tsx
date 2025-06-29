 
/* eslint-disable max-params */
import React from 'react';
import { cn } from '@/lib/utils';

interface TooltipItemContentProps {
  readonly formatter?: (value: number, name: string, item: unknown, index: number, payload: Record<string, unknown>[]) => React.ReactNode;
  readonly itemData: { name?: string; dataKey?: string; payload?: unknown; color?: string; value?: number };
  readonly item: unknown;
  readonly index: number;
  readonly itemConfig?: { label?: React.ReactNode };
  readonly nestLabel: boolean;
  readonly tooltipLabel: React.ReactNode;
}

export function TooltipItemContent(props: TooltipItemContentProps) {
  const { formatter, itemData, item, index, itemConfig, nestLabel, tooltipLabel } = props;
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
