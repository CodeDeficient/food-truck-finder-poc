'use client';

// Inspired by react-hot-toast library
import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1_000_000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: 'ADD_TOAST';
      toast: ToasterToast;
    }
  | {
      type: 'UPDATE_TOAST';
      toast: Partial<ToasterToast>;
    }
  | {
      type: 'DISMISS_TOAST';
      toastId?: ToasterToast['id'];
    }
  | {
      type: 'REMOVE_TOAST';
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
* Initiates a timeout to remove a toast by its ID if not already scheduled
* @example
* setupToastRemoval('toast123')
* undefined
* @param {string} toastId - The unique identifier of the toast to be removed.
* @returns {void} No return value as the function performs a timeout operation.
* @description
*   - Ensures that only one removal timeout is set for a given toast ID.
*   - Utilizes a mapping (`toastTimeouts`) to track active timeouts by their toast IDs.
*   - Removes the toast from the timeout mapping upon execution of the timeout.
*   - Utilizes a pre-defined delay `TOAST_REMOVE_DELAY` for scheduling the removal.
*/
const addToRemoveQueue = (toastId: string) => {
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

const handleAddToast = (state: State, toast: ToasterToast): State => ({
  ...state,
  toasts: [toast, ...state.toasts].slice(0, TOAST_LIMIT),
});

const handleUpdateToast = (state: State, toast: Partial<ToasterToast>): State => ({
  ...state,
  toasts: state.toasts.map((t) => (t.id === toast.id ? { ...t, ...toast } : t)),
});

/**
 * Updates the state to close specific or all toasts.
 * @example
 * updateToastState(currentState, specificToastId)
 * // Returns a new state with specified toast closed.
 * @param {State} state - The current state of toasts.
 * @param {string} [toastId] - Optional toast ID to close, closes all if undefined or empty.
 * @returns {State} The new state with updated toasts openness.
 * @description
 *   - Closes the toast specified by `toastId` if provided; otherwise, closes all toasts.
 *   - Adds specified toast or all toasts to a removal queue before closing.
 */
const handleDismissToast = (state: State, toastId?: string): State => {
  if (toastId != undefined && toastId !== '') {
    addToRemoveQueue(toastId);
  } else {
    for (const toast of state.toasts) {
      addToRemoveQueue(toast.id);
    }
  }

  return {
    ...state,
    toasts: state.toasts.map((t) =>
      (t.id === toastId || toastId === undefined
        ? {
            ...t,
            open: false,
          }
        : t),
    ),
  };
};

/**
* Updates the state by clearing specific toasts based on toastId.
* @example
* stateUpdate(currentState, '123')
* // Returns updated state without the toast with id '123'
* @param {State} state - The current state containing the list of toasts.
* @param {string} [toastId] - The optional identifier of the toast to be removed; if not provided, all toasts are cleared.
* @returns {State} A new state object with the specified toast removed or all toasts cleared.
* @description
*   - If no toastId is given, it will clear all toasts.
*   - Uses shallow copy to avoid mutating the original state.
*/
const handleRemoveToast = (state: State, toastId?: string): State => {
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
* Manages toast notifications in the application state
* @example
* manageToasts(currentState, actionObject)
* updatedState
* @param {State} state - The current state of the application.
* @param {Action} action - The action containing the type and payload for toast operations.
* @returns {State} The updated state after applying the specified action on the toast notifications.
* @description
*   - Utilizes helper functions for different toast operations based on action type.
*   - Handles various toast actions such as addition, update, dismiss, and removal.
*   - Defaults to returning the current state when no matching action type is found.
*   - Requires exhaustive type checking to ensure all action types are handled.
*/
export const reducer = (state: State, action: Action): State => {
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
    } // Should not happen with exhaustive type checking
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  for (const listener of listeners) {
    listener(memoryState);
  }
}

type Toast = Omit<ToasterToast, 'id'>;

/**
* Creates and manages a toast notification.
* @example
* toast({ message: "Sample Message", duration: 3000 })
* { id: 'someUniqueId', dismiss: ƒ, update: ƒ }
* @param {Toast} props - Properties used to configure the toast display.
* @returns {Object} An object with `id`, `dismiss`, and `update` functions.
* @description
*   - Generates a unique ID for each toast.
*   - Provides a dismiss function to remove the toast.
*   - Allows the toast to be updated with new properties.
*/
function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
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
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
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
* Manages the toast notification state and provides functions to display or dismiss notifications.
* @example
* const { toast, dismiss } = useToast();
* toast({ title: 'Hello World' });
* dismiss('toastId123');
* @param {void} - This hook takes no arguments for initialization.
* @returns {Object} An object containing the current state of toasts, a function to display a toast, and a function to dismiss a toast.
* @description
*   - The hook internally manages a list of listeners to update the component state whenever a change in toast notifications occurs.
*   - Ensures the listener cleanup when the component is unmounted using a return function from useEffect.
*   - Dispatches actions to update the toast state through a centralized mechanism.
*/
function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

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
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}

export { useToast, toast };
