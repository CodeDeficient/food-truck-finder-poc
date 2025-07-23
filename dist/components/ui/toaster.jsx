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
import { useToast } from '@/hooks/UseToast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, } from '@/components/ui/toast';
/**
 * Renders a Toast notification component with safe props.
 * @example
 * Toaster()
 * Displays a series of Toast notifications based on the state of useToast.
 * @param {Object} toasts - Array of toast objects containing necessary information to render each toast.
 * @returns {JSX.Element} A ToastProvider containing mapped Toast components.
 * @description
 *   - Filters toast props to ensure only predefined safe keys are spread into the Toast component.
 *   - Uses a grid layout to organize toast title and description.
 *   - Includes a ToastClose component for dismissing the toast.
 *   - Provides a ToastViewport for displaying the toast notifications on-screen.
 */
export function Toaster() {
    const { toasts } = useToast();
    return (<ToastProvider>
      {toasts.map((toast) => {
            const { id, title, description, action } = toast, props = __rest(toast, ["id", "title", "description", "action"]);
            // Only spread props that are safe and expected by <Toast>
            const safeProps = Object.fromEntries(Object.entries(props).filter(([key]) => [
                'type',
                'duration',
                'onOpenChange',
                'open',
                'variant',
                // add other allowed keys as needed
            ].includes(key)));
            return (<Toast key={id} {...safeProps}>
            <div className="grid gap-1">
              {title != undefined && title !== '' && <ToastTitle>{title}</ToastTitle>}
              {description != undefined && description !== '' && (<ToastDescription>{description}</ToastDescription>)}
            </div>
            {action}
            <ToastClose />
          </Toast>);
        })}
      <ToastViewport />
    </ToastProvider>);
}
