'use client';
// Inspired by react-hot-toast library
import * as React from 'react';
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1_000_000;
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
/**
* Checks if a toast notification is active by its ID, sets a removal timeout if not.
* @example
* toastId('notification1')
* undefined
* @param {string} toastId - Unique identifier for the toast notification.
* @returns {void} Does not return a value, performs side effects.
* @description
*   - Utilizes a timeout to automatically remove a toast notification after a predefined delay.
*   - Ensures that a toast notification is only removed if it exists, preventing redundant operations.
*   - Utilizes a map called `toastTimeouts` to track active toast notifications and their removal timeouts.
*/
const addToRemoveQueue = (toastId) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: 'REMOVE_TOAST',
            toastId: toastId,
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
const handleAddToast = (state, toast) => ({
    ...state,
    toasts: [toast, ...state.toasts].slice(0, TOAST_LIMIT),
});
const handleUpdateToast = (state, toast) => ({
    ...state,
    toasts: state.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)),
});
/**
* Updates the state by removing a toast with a specific id or all open toasts if the id is unspecified.
* @example
* updateToastState(currentState, "toast123")
* { ...updatedState }
* @param {State} state - The current state object containing toast information.
* @param {string} [toastId] - Optional ID of the toast to be removed.
* @returns {State} Updated state with specified toast closed or all toasts closed if no id is provided.
* @description
*   - `addToRemoveQueue(toastId)` is invoked with the given `toastId` or each toast's id if `toastId` is not defined.
*   - If `toastId` is not provided, all toasts are set to open: false in the returned state.
*   - Ensure that toast ID is not empty when provided.
*   - The function handles updates immutably by returning a new state object.
*/
const handleDismissToast = (state, toastId) => {
    if (toastId != undefined && toastId !== '') {
        addToRemoveQueue(toastId);
    }
    else {
        for (const toast of state.toasts) {
            addToRemoveQueue(toast.id);
        }
    }
    return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
            }
            : t)),
    };
};
/**
* Removes toasts based on optional toastId or clears all if toastId not provided.
* @example
* updateToasts(state, '1234')
* Returns state with toast having id '1234' removed.
* @param {State} state - The current state containing toasts.
* @param {string} [toastId] - Optional ID of the toast to be removed.
* @returns {State} Updated state with specified toast removed or all toasts cleared.
* @description
*   - If toastId is not provided, all toasts will be removed from the state.
*   - Ensures immutability by creating a new state object.
*/
const handleRemoveToast = (state, toastId) => {
    if (toastId === undefined) {
        return {
            ...state,
            toasts: [],
        };
    }
    return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
    };
};
/**
* Manages toast notifications state transitions based on the action type.
* @example
* reducer(currentState, { type: 'ADD_TOAST', toast: newToast })
* // returns new state with added toast
* @param {State} state - Current state of the toast notifications.
* @param {Action} action - Action describing the type of state transition and payload.
* @returns {State} The new state of the toast notifications after applying the action.
* @description
*   - This function supports actions for adding, updating, dismissing, and removing toasts.
*   - If the action type does not match any case, it returns the current state without modification.
*/
export function reducer(state, action) {
    switch (action.type) {
        case 'ADD_TOAST': {
            return handleAddToast(state, action.toast);
        }
        case 'UPDATE_TOAST': {
            return handleUpdateToast(state, action.toast);
        }
        case 'DISMISS_TOAST': {
            return handleDismissToast(state, action.toastId);
        }
        case 'REMOVE_TOAST': {
            return handleRemoveToast(state, action.toastId);
        }
        default: {
            return state;
        }
    }
}
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    for (const listener of listeners) {
        listener(memoryState);
    }
}
/**
 * Creates and manages a toast notification by dispatching actions.
 * @example
 * toast({ message: 'Hello, World!', duration: 3000 })
 * // Returns: { id: 'generated_id', dismiss: [Function], update: [Function] }
 * @param {Toast} props - The properties for the toast notification.
 * @returns {Object} - The id of the toast and functions to dismiss or update the toast.
 * @description
 *   - Generates a unique id for each toast.
 *   - Automatically opens the toast on creation and provides a mechanism to change its open state.
 *   - The `dismiss` function closes the toast notification.
 *   - The `update` function allows modification of toast properties after creation.
 */
function toast({ ...props }) {
    const id = genId();
    const update = (props) => dispatch({
        type: 'UPDATE_TOAST',
        toast: { ...props, id },
    });
    const dismiss = () => dispatch({ type: 'DISMISS_TOAST', toastId: id });
    dispatch({
        type: 'ADD_TOAST',
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open)
                    dismiss();
            },
        },
    });
    return {
        id: id,
        dismiss,
        update,
    };
}
/**
 * Hook to manage toast notifications in a React component
 * @example
 * const { toast, dismiss } = useToast();
 * toast({ title: "Notification", message: "This is a toast message" });
 * dismiss(toastId);
 * @returns {Object} Returns an object containing the current toast state, a toast function, and a dismiss function.
 * @description
 *   - The hook maintains a local state that is synchronized with a global listener list.
 *   - Automatically removes the state listener when the component unmounts.
 *   - The `dismiss` function optionally accepts a `toastId` to dismiss specific toast notifications.
 *   - Utilizes a global dispatch to manipulate toast notifications state.
 */
function useToast() {
    const [state, setState] = React.useState(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    }, []);
    return {
        ...state,
        toast,
        dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
    };
}
export { useToast, toast };
