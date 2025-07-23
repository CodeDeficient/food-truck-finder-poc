import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
function EventSubscriptionManager() {
    useEffect(() => {
        const handleEvent = (payload) => {
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
                }
                else {
                    console.warn('Received malformed event:', payload);
                }
            }
            catch (error) {
                console.error('Error processing pipeline event:', error);
            }
        };
        const subscription = supabase
            .channel('pipeline-events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pipeline_events' }, handleEvent)
            .subscribe((status, error) => {
            if (status === 'SUBSCRIBED') {
                console.info('Successfully subscribed to pipeline events.');
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
