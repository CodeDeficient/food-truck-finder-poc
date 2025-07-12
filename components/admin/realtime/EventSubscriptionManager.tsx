import { useEffect } from 'react';

import { supabase } from '@/lib/supabase'; 
import { PipelineEvent } from '@/lib/types';

/**
 * Manages event subscriptions for pipeline events using Supabase.
 * @example
 * EventSubscriptionManager()
 * @returns {void} This component serves purely for side-effects of subscription management.
 * @description
 *   - Utilizes the Supabase Realtime Client to subscribe and process "pipeline-events".
 *   - Includes an effect cleanup to unsubscribe from events when the component unmounts.
 *   - Current implementation logs events to the console as placeholders.
 */
type RealtimeChannelStatus = 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT';

function EventSubscriptionManager() {
  useEffect(() => {
    const handleEvent = (payload: { new: PipelineEvent }) => {
      try {
        const event = payload.new;
        if (event && typeof event === 'object' && 'type' in event) {
          // Process the event based on its type
          switch (event.type) {
            case 'job_started': {
              console.info('Job started:', event.payload);
              break;
            }
            case 'job_completed': {
              console.info('Job completed:', event.payload);
              break;
            }
            case 'data_updated': {
              console.info('Data updated:', event.payload);
              break;
            }
            default: {
              console.warn('Received unknown event type:', event.type);
            }
          }
        } else {
          console.warn('Received malformed event:', payload);
        }
      } catch (error) {
        console.error('Error processing pipeline event:', error);
      }
    };

    const subscription = supabase
      .channel('pipeline-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_events' }, handleEvent)
      .subscribe((status: RealtimeChannelStatus, error?: Error) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to pipeline events.');
        }
        if (status === 'CHANNEL_ERROR' && error) {
          console.error('Pipeline event subscription error:', error);
        }
      });

    return () => {
      void supabase.realtime.removeChannel(subscription);
    };
  }, []);
}

export default EventSubscriptionManager;
