import { useEffect } from 'react';

export function useAutoConnect(autoConnect: boolean, connect: () => void, disconnect: () => void) {
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
}
