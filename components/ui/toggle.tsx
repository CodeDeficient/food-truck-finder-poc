'use client';

import * as React from 'react';
import * as TogglePrimitive from '@radix-ui/react-toggle';

import { cn } from '@/lib/utils';
import { toggleVariants } from './variants';

const Toggle = React.forwardRef<
  React.ComponentRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>
>(({ className, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ className }))}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle,  };

export {toggleVariants} from './variants';