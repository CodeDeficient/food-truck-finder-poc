import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; 

type RealtimeChannelStatus = 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT';

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
    const subscription = supabase.realtime.channel('system-status').subscribe((status: RealtimeChannelStatus, response: unknown) => {
      if (status === 'SUBSCRIBED') {
        if (typeof response === 'object' && 'status' in response) {
          const typedResponse = response as SystemStatusResponse;
          const responseStatus = typedResponse.status; // Extract status to a variable

          if (typeof responseStatus === 'string' && responseStatus === "success") {
            if (typeof typedResponse.data === 'object' && 'status' in typedResponse.data) {
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
      }
    });

    return () => {
      void supabase.realtime.removeChannel(subscription);
    };
  }, []);

  return (
    <div>
      <h3>Current System Status:</h3>
      <span>{systemStatus}</span>
    </div>
  );
}

export default SystemStatusIndicators;
