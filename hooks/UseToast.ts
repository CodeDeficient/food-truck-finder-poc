'use client';

// Inspired by react-hot-toast library
import * as React from 'react';

import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1_000_000;

export type ToasterToast = ToastProps & {
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
      t.id === toastId || toastId === undefined
        ? {
            ...t,
            open: false,
          }
        : t,
    ),
  };
};

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

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_TOAST':
      return handleAddToast(state, action.toast);
    case 'UPDATE_TOAST':
      return handleUpdateToast(state, action.toast);
    case 'DISMISS_TOAST':
      return handleDismissToast(state, action.toastId);
    case 'REMOVE_TOAST':
      return handleRemoveToast(state, action.toastId);
    default:
      return state;
  }
}

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  for (const listener of listeners) {
    listener(memoryState);
  }
}

type Toast = Omit<ToasterToast, 'id'>;

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
