import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/variants';
const Pagination = ({ className, ...props }) => (<nav role="navigation" aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props}/>);
Pagination.displayName = 'Pagination';
const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (<ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props}/>));
PaginationContent.displayName = 'PaginationContent';
const PaginationItem = React.forwardRef(({ className, ...props }, ref) => <li ref={ref} className={cn('', className)} {...props}/>);
PaginationItem.displayName = 'PaginationItem';
/**
 * Renders a pagination link with dynamic attributes.
 * @example
 * PaginationLink({ className: 'custom-class', isActive: true })
 * <a aria-current="page" class="button-class custom-class" ...props></a>
 * @param {Object} PaginationLinkProps - Props containing className, isActive, size, and additional attributes.
 * @returns {JSX.Element} An anchor element with pagination related attributes and styles.
 * @description
 *   - Applies different styles based on whether the link is active or not.
 *   - Uses the `buttonVariants` function to determine the button style variant.
 *   - Further props can extend or override default attributes.
 */
const PaginationLink = ({ className, isActive, size = 'icon', ...props }) => (<a aria-current={isActive === true ? 'page' : undefined} className={cn(buttonVariants({
        variant: isActive === true ? 'outline' : 'ghost',
        size,
    }), className)} {...props}/>);
PaginationLink.displayName = 'PaginationLink';
/**
 * Renders a customizable pagination link to navigate to the previous page.
 * @example
 * renderPreviousPageLink('custom-class', additionalProps)
 * // Renders a PaginationLink with a chevron and 'Previous' label.
 * @param {string} className - Additional CSS class names to style the PaginationLink.
 * @param {React.ComponentProps<typeof PaginationLink>} props - Additional properties passed to PaginationLink.
 * @returns {JSX.Element} A JSX Element rendering a PaginationLink.
 * @description
 *   - Uses default size and pre-defined optional class names for styling.
 *   - Automatically spreads additional props to the PaginationLink component.
 *   - Ensures navigation to the previous page with an accessible aria-label.
 */
const PaginationPrevious = ({ className, ...props }) => (<PaginationLink aria-label="Go to previous page" size="default" // Removed ts-expect-error
 className={cn('gap-1 pl-2.5', className)} {...props}>
    <ChevronLeft className="size-4"/>
    <span>Previous</span>
  </PaginationLink>);
PaginationPrevious.displayName = 'PaginationPrevious';
const PaginationNext = ({ className, ...props }) => (<PaginationLink aria-label="Go to next page" size="default" // Removed ts-expect-error
 className={cn('gap-1 pr-2.5', className)} {...props}>
    <span>Next</span>
    <ChevronRight className="size-4"/>
  </PaginationLink>);
PaginationNext.displayName = 'PaginationNext';
const PaginationEllipsis = ({ className, ...props }) => (<span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="size-4"/>
    <span className="sr-only">More pages</span>
  </span>);
PaginationEllipsis.displayName = 'PaginationEllipsis';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, };
