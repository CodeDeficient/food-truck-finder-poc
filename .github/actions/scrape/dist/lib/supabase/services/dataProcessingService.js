import { supabase, supabaseAdmin } from '../supabase/client.js';
export const DataProcessingService = {
    async addToQueue(queueData) {
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data, error } = await supabaseAdmin
            .from('data_processing_queue')
            .insert([
            {
                ...queueData,
                status: 'pending',
                gemini_tokens_used: 0,
                created_at: new Date().toISOString(),
            },
        ])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async getNextQueueItem() {
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data, error } = await supabaseAdmin
            .from('data_processing_queue')
            .select('*')
            .eq('status', 'pending')
            .order('priority', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(1)
            .single();
        if (error !== null && String(error.code) != 'PGRST116')
            throw error;
        return data ?? undefined;
    },
    async getQueueByStatus(status) {
        try {
            const { data, error } = await supabase
                .from('data_processing_queue')
                .select('*')
                .eq('status', status)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data ?? [];
        }
        catch (error) {
            console.warn('Error fetching queue:', error);
            return [];
        }
    },
    async updateQueueItem(id, updates) {
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data, error } = await supabaseAdmin
            .from('data_processing_queue')
            .update({
            ...updates,
            ...(updates.status === 'completed' && { processed_at: new Date().toISOString() }),
        })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
};
