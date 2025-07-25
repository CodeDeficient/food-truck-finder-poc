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
import { GripVertical } from 'lucide-react';
import * as ResizablePrimitive from 'react-resizable-panels';
import { cn } from '@/lib/utils';
const ResizablePanelGroup = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ResizablePrimitive.PanelGroup className={cn('flex h-full w-full data-[panel-group-direction=vertical]:flex-col', className)} {...props}/>);
};
const ResizablePanel = ResizablePrimitive.Panel;
/**
 * Renders a resizable panel handle with an optional grip indicator.
 * @example
 * renderResizablePanel(withHandle, className, props)
 * <ResizablePrimitive.PanelResizeHandle {...props}>
 *   {withHandle && <div className="handle">...</div>}
 * </ResizablePrimitive.PanelResizeHandle>
 * @param {boolean} withHandle - Indicates whether a grip indicator should be displayed.
 * @param {string} className - Additional classes to be applied for styling purposes.
 * @param {React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle>} props - Other props to be passed down to the component.
 * @returns {JSX.Element} A JSX element representing a resizable panel handle with possible visual enhancements.
 * @description
 *   - Adjusts styling based on panel group direction.
 *   - Uses Flexbox to control the layout and appearance of the handle.
 *   - Ensures accessibility focus styles when the handle is selected.
 */
const ResizableHandle = (_a) => {
    var { withHandle, className } = _a, props = __rest(_a, ["withHandle", "className"]);
    return (<ResizablePrimitive.PanelResizeHandle className={cn('relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90', className)} {...props}>
    {withHandle === true && (<div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <GripVertical className="size-2.5"/>
      </div>)}
  </ResizablePrimitive.PanelResizeHandle>);
};
export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
