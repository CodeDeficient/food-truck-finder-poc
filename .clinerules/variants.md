# VariantProps and cva Best Practices

## Objective
To establish a consistent and reliable pattern for using `class-variance-authority` (`cva`) and `VariantProps` in UI components to avoid TypeScript errors.

## The Problem
We have encountered a recurring issue where `VariantProps` is not correctly interpreted as a type, leading to a cascade of TypeScript and ESLint errors. This is often caused by a combination of factors, including how the `cva` function is defined, how the props interface is created, and how the component is typed.

## The Solution
To address this, we will adopt the following pattern for all UI components that use `cva`:

1.  **Centralize Variants**: Create a `components/ui/variants.ts` file to define all `cva` variants. This will help to keep the variants consistent and easy to manage.

2.  **Import Variants**: Import the variants into the respective components.

3.  **Use a Type Assertion**: Use a type assertion on the `cva` function to provide a specific type for the variants. This will help to ensure that the variants are correctly typed and that the `VariantProps` type can be correctly inferred.

4.  **Define a `Props` Interface**: Define a `Props` interface for each component that extends `React.ComponentPropsWithoutRef` and `VariantProps`. This will ensure that the component has the correct props and that the `variant` and `size` props are correctly typed.

## Example
```typescript
// components/ui/variants.ts
import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
) as (props?: { variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | null, size?: 'default' | 'sm' | 'lg' | 'icon' | null, className?: string | null }) => string;
```

```typescript
// components/ui/button.tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';
import { buttonVariants } from './variants';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };
