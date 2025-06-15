'use client';

import * as React from 'react';
// @ts-expect-error TS(2792): Cannot find module '@radix-ui/react-label'. Did yo... Remove this comment to see the full error message
import * as LabelPrimitive from '@radix-ui/react-label';
// @ts-expect-error TS(2792): Cannot find module 'class-variance-authority'. Did... Remove this comment to see the full error message
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
);

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
