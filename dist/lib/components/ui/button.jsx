import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { buttonVariants } from './variants';
export const Button = forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
    if (asChild) {
        return (<Slot className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
    }
    return (<button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = 'Button';
