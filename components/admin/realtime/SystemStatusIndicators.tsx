import React, { useEffect, useState } from 'react';
import { SupabaseRealtimeClient } from '@/lib/supabase'; 

/**
* Represents system status indicators in real-time
* @example
* SystemStatusIndicators()
* <div><h3>Current System Status:</h3><span>ONLINE</span></div>
* @returns {JSX.Element} A JSX element displaying the current system status.
* @description
*   - Utilizes Supabase Realtime Client for subscribing to system status updates.
*   - Updates the display with the latest system status retrieved from a realtime database.
*   - Handles subscription clean-up on component unmount to avoid memory leaks.
*/
function SystemStatusIndicators() {
  const [systemStatus, setSystemStatus] = useState('UNKNOWN');

  useEffect(() => {
    const subscription = SupabaseRealtimeClient.subscribe('system-status', (response: any) => {
      if (response.status === "success") {
        setSystemStatus(response.data.status);
      } else {
        console.error("Failed to retrieve system status");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div>
      <h3>Current System Status:</h3>
      <span>{systemStatus}</span>
    </div>
  );
}

export default SystemStatusIndicators;
