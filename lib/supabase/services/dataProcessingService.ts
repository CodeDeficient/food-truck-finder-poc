import { supabase, supabaseAdmin } from '../client';
import { DataProcessingQueue } from '../types';
import { type PostgrestResponse, type PostgrestSingleResponse } from '@supabase/supabase-js';

export const DataProcessingService = {
  async addToQueue(queueData: Partial<DataProcessingQueue>): Promise<DataProcessingQueue> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
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

    if (error) throw error;
    return data;
  },

  async getNextQueueItem(): Promise<DataProcessingQueue | undefined> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (error !== null && String(error.code) != 'PGRST116') throw error;
    return data ?? undefined;
  },

  async getQueueByStatus(status: string): Promise<DataProcessingQueue[]> {
    try {
      const { data, error }: PostgrestResponse<DataProcessingQueue> = await supabase
        .from('data_processing_queue')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching queue:', error);
      return [];
    }
  },
  async updateQueueItem(
    id: string,
    updates: Partial<DataProcessingQueue>,
  ): Promise<DataProcessingQueue> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<DataProcessingQueue> = await supabaseAdmin
      .from('data_processing_queue')
      .update({
        ...updates,
        ...(updates.status === 'completed' && { processed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
