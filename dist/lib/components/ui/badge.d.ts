import * as React from 'react';
import { type VariantProps } from 'tailwind-variants';
import { badgeVariants } from './variants';
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}
declare function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;
export { Badge };
