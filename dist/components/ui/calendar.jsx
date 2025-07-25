'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/variants';
/**
 * Renders a calendar component with customizable day styles and navigation.
 * @example
 * Calendar({ className: 'my-class', classNames: { months: 'my-months' } })
 * // Returns a styled DayPicker component
 * @param {Object} { className, classNames, showOutsideDays } - Class names and props for customizing the calendar display.
 * @returns {JSX.Element} A DayPicker element with applied styles and functionality.
 * @description
 *   - Utilizes `DayPicker` from a UI library with styling and navigation customization.
 *   - Allows distinct styling for outside days, disabled days, and selected days.
 *   - Provides responsive flex layout for month display.
 *   - Navigation buttons are styled with varying opacity on hover.
 */
function Calendar(_a) {
    var { className, classNames, showOutsideDays = true } = _a, props = __rest(_a, ["className", "classNames", "showOutsideDays"]);
    return (<DayPicker showOutsideDays={showOutsideDays} className={cn('p-3', className)} classNames={Object.assign({ months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0', month: 'space-y-4', caption: 'flex justify-center pt-1 relative items-center', caption_label: 'text-sm font-medium', nav: 'space-x-1 flex items-center', nav_button: cn(buttonVariants({ variant: 'outline' }), 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'), nav_button_previous: 'absolute left-1', nav_button_next: 'absolute right-1', table: 'w-full border-collapse space-y-1', head_row: 'flex', head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]', row: 'flex w-full mt-2', cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20', day: cn(buttonVariants({ variant: 'ghost' }), 'h-9 w-9 p-0 font-normal aria-selected:opacity-100'), day_range_end: 'day-range-end', day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground', day_today: 'bg-accent text-accent-foreground', day_outside: 'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground', day_disabled: 'text-muted-foreground opacity-50', day_range_middle: 'aria-selected:bg-accent aria-selected:text-accent-foreground', day_hidden: 'invisible' }, classNames)} {...props}/>);
}
Calendar.displayName = 'Calendar';
export { Calendar };
