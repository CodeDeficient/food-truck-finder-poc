'use client';
'use client';
import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';
import { labelVariants } from './variants';
const Label = React.forwardRef(({ className, ...props }, ref) => (<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}/>));
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
