import React, { useEffect, useState } from 'react';
import { SupabaseRealtimeClient } from '@/lib/supabase'; 

interface SystemStatusResponse {
  status: string;
  data: {
    status: string;
  };
}

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
    const subscription = SupabaseRealtimeClient.subscribe('system-status', (response: unknown) => {
      if (typeof response === 'object' && response !== null && 'status' in response) {
        const typedResponse = response as SystemStatusResponse;
        const responseStatus = typedResponse.status; // Extract status to a variable

        if (typeof responseStatus === 'string' && responseStatus === "success") { // eslint-disable-next-line sonarjs/different-types-comparison
          if (typeof typedResponse.data === 'object' && typedResponse.data !== null && 'status' in typedResponse.data) {
            setSystemStatus(typedResponse.data.status);
          } else {
            console.error("Invalid data structure in system status response");
          }
        } else {
          console.error("Failed to retrieve system status or invalid response format");
        }
      } else {
        console.error("Failed to retrieve system status or invalid response format");
      }
    });

    return () => subscription.unsubscribe() as void;
  }, []);

  return (
    <div>
      <h3>Current System Status:</h3>
      <span>{systemStatus}</span>
    </div>
  );
}

export default SystemStatusIndicators;
