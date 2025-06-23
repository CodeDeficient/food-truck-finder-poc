import React from 'react';
import { cn } from '@/lib/utils';

interface TooltipIndicatorProps {
  readonly indicator: 'line' | 'dot' | 'dashed';
  readonly hideIndicator: boolean;
  readonly indicatorColor?: string;
  readonly nestLabel: boolean;
  readonly itemConfig?: { icon?: React.ComponentType };
}

export function TooltipIndicator({
  indicator,
  hideIndicator,
  indicatorColor,
  nestLabel,
  itemConfig
}: TooltipIndicatorProps) {
  if (itemConfig?.icon) {
    return <itemConfig.icon />;
  }

  if (hideIndicator) {
    return;
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
