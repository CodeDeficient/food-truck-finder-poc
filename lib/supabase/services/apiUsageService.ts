import { supabase, supabaseAdmin } from '../client';
import type { ApiUsage } from '../types';
import { type PostgrestResponse, type PostgrestSingleResponse, type PostgrestError } from '@supabase/supabase-js';

export const APIUsageService = {
  async trackUsage(serviceName: string, requests: number, tokens: number): Promise<ApiUsage> {
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    try {
      const today = new Date().toISOString().split('T')[0];

      const {
        data: existing,
        error: existingError,
      } = await supabaseAdmin
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single() as unknown as {
        data: ApiUsage | undefined;
        error: PostgrestError | null;
      };

      if (existingError && existingError.code !== 'PGRST116') throw existingError;

      if (existing) {
        const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
          .from('api_usage')
          .update({
            requests_count: (existing.requests_count ?? 0) + requests,
            tokens_used: (existing.tokens_used ?? 0) + tokens,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabaseAdmin
          .from('api_usage')
          .insert([
            {
              service_name: serviceName,
              usage_date: today,
              requests_count: requests,
              tokens_used: tokens,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
      
    } catch (error: unknown) {
      console.warn('Error tracking usage:', error);
      throw error;
    }
  },
  async getTodayUsage(serviceName: string): Promise<ApiUsage | undefined> {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error }: PostgrestSingleResponse<ApiUsage> = await supabase
        .from('api_usage')
        .select('*')
        .eq('service_name', serviceName)
        .eq('usage_date', today)
        .single();

      if (error !== null && String(error.code) != 'PGRST116') throw error;
      return data ?? undefined;
    } catch (error: unknown) {
      console.warn('Error getting today usage:', error);
      throw error;
    }
  },

  async getAllUsageStats(): Promise<ApiUsage[]> {
    try {
      const { data, error }: PostgrestResponse<ApiUsage> = await supabase
        .from('api_usage')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error getting usage stats:', error);
      throw error;
    }
  },
};
