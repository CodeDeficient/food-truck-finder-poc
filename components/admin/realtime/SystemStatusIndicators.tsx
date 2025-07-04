import React, { useEffect, useState } from 'react';
import { supabaseAdmin } from '@/lib/supabase'; // Use the actual client instance
import { RealtimeChannel } from '@supabase/supabase-js';

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
    if (!supabaseAdmin) {
      console.warn('Supabase admin client not available for realtime subscription.');
      return;
    }
    const channel: RealtimeChannel = supabaseAdmin.channel('system-status');

    channel
      .on('broadcast', { event: 'status-update' }, (message) => {
        // Assuming the message payload has a 'status' field
        if (message.payload && typeof (message.payload as any).status === 'string') {
          setSystemStatus((message.payload as any).status);
        }
      })
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.info('Subscribed to system-status channel!');
        }
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to system-status channel:', err);
        }
      });

    return () => {
      if (supabaseAdmin && channel) {
        supabaseAdmin.removeChannel(channel).catch(err => console.error('Error removing channel:', err));
      }
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
