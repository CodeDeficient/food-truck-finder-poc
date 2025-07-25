'use client';
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
import * as ToastPrimitives from '@radix-ui/react-toast';
import {} from 'tailwind-variants';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toastVariants } from './variants';
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Viewport ref={ref} className={cn('fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]', className)} {...props}/>);
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const Toast = React.forwardRef((_a, ref) => {
    var { className, variant } = _a, props = __rest(_a, ["className", "variant"]);
    return (<ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props}/>);
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Action ref={ref} className={cn('inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive', className)} {...props}/>);
});
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Close ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600', className)} toast-close="" {...props}>
    <X className="size-4"/>
  </ToastPrimitives.Close>);
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props}/>);
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props}/>);
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, };
