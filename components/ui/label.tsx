'use client';

'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { type VariantProps } from 'tailwind-variants';

import { cn } from '@/lib/utils';
import { labelVariants } from './variants';

export interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
