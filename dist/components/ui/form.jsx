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
import * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext, } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
const Form = FormProvider;
const FormFieldContext = React.createContext({});
/**
* A React component that provides a form field context and renders a Controller with the supplied props.
* @example
* FormFieldComponent({ name: "username", control: someControlObject })
* Renders a form field with context provider for 'username'
* @param {ControllerProps<TFieldValues, TName>} {props} - Properties to pass to the Controller component.
* @returns {JSX.Element} A JSX element wrapping the Controller component with a FormFieldContext provider.
* @description
*   - Utilizes FormFieldContext.Provider to set context based on 'name' prop.
*   - Simplifies integration of React Hook Form's Controller by encapsulating the context logic.
*/
const FormField = (_a) => {
    var props = __rest(_a, []);
    return (<FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props}/>
    </FormFieldContext.Provider>);
};
/**
 * Retrieves form field related identifiers and state.
 * @example
 * useFormField()
 * { id: 'example-id', name: 'example-name', formItemId: 'example-id-form-item', ... }
 * @param {FormFieldContext} {fieldContext} - Context providing field name and associated data.
 * @returns {Object} Object containing form item identifiers and current field state.
 * @description
 *   - Throws an error if used outside of a <FormField> component.
 *   - Combines multiple context values and form state into a single object.
 *   - Generates unique identifiers for form item components using the `id` from itemContext.
 */
const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const { getFieldState, formState } = useFormContext();
    const fieldState = getFieldState(fieldContext.name, formState);
    if (fieldContext == undefined) {
        throw new Error('useFormField should be used within <FormField>');
    }
    const { id } = itemContext;
    return Object.assign({ id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message` }, fieldState);
};
const FormItemContext = React.createContext({});
const FormItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const id = React.useId();
    return (<FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}/>
      </FormItemContext.Provider>);
});
FormItem.displayName = 'FormItem';
const FormLabel = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formItemId } = useFormField();
    return (<Label ref={ref} className={cn(error && 'text-destructive', className)} htmlFor={formItemId} {...props}/>);
});
FormLabel.displayName = 'FormLabel';
const FormControl = React.forwardRef((_a, ref) => {
    var props = __rest(_a, []);
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (<Slot ref={ref} id={formItemId} aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : `${formDescriptionId}`} aria-invalid={error != undefined} {...props}/>);
});
FormControl.displayName = 'FormControl';
const FormDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { formDescriptionId } = useFormField();
    return (<p ref={ref} id={formDescriptionId} className={cn('text-sm text-muted-foreground', className)} {...props}/>);
});
FormDescription.displayName = 'FormDescription';
const FormMessage = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    const { error, formMessageId } = useFormField();
    const body = error ? String(error === null || error === void 0 ? void 0 : error.message) : children;
    if (body == undefined || body === '') { /* empty */ }
    return (<p ref={ref} id={formMessageId} className={cn('text-sm font-medium text-destructive', className)} {...props}>
      {body}
    </p>);
});
FormMessage.displayName = 'FormMessage';
export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField, };
