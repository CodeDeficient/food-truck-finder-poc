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
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cn } from '@/lib/utils';
const ToggleGroup = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<ToggleGroupPrimitive.Root ref={ref} className={cn('flex items-center justify-center gap-1', className)} {...props}>
    {children}
  </ToggleGroupPrimitive.Root>);
});
ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName;
const ToggleGroupItem = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<ToggleGroupPrimitive.Item ref={ref} className={cn(className)} {...props}>
    {children}
  </ToggleGroupPrimitive.Item>);
});
ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName;
export { ToggleGroup, ToggleGroupItem };
