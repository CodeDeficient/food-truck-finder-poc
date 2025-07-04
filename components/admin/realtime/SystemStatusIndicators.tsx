import React, { useEffect, useState } from 'react';
import { SupabaseRealtimeClient } from '@/lib/supabase'; 

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
