'use client';

import * as React from 'react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { toggleVariants } from '@/components/ui/toggle';

type ToggleGroupContextType = {
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
};

const ToggleGroupContext = React.createContext<ToggleGroupContextType>({
  size: 'default',
  variant: 'default',
});

interface ToggleGroupProps extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>, VariantProps<typeof toggleVariants> {}

const ToggleGroup = React.forwardRef<
  HTMLDivElement,
  ToggleGroupProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <ToggleGroupContext.Provider value={{ variant, size }}>
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn('flex items-center justify-center gap-1', className)}
        {...props}
      >
        {children}
      </ToggleGroupPrimitive.Root>
    </ToggleGroupContext.Provider>
  );
});

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;

interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>, VariantProps<typeof toggleVariants> {}

const ToggleGroupItem = React.forwardRef<
  HTMLButtonElement,
  ToggleGroupItemProps
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext);
  // Refactor to avoid nested ternary and use explicit length check
  let computedSize = size;
  if (
    (typeof context.size === 'number' && context.size > 0) ||
    (typeof context.size === 'string' && context.size.length > 0)
  ) {
    computedSize = context.size;
  }

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant ?? variant,
          size: computedSize,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
});

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;

export { ToggleGroup, ToggleGroupItem };
