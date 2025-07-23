import { useEffect } from 'react';
export function useAutoConnect(autoConnect, connect, disconnect) {
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);
}
