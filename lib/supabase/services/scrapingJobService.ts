import { getSupabaseAdmin, getSupabase } from '../client.js';
import type { ScrapingJob } from '../types/index.js';
import { type PostgrestResponse, type PostgrestSingleResponse } from '@supabase/supabase-js';

export const ScrapingJobService = {
  async createJob(jobData: Partial<ScrapingJob>): Promise<ScrapingJob> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .insert([
        {
          ...jobData,
          status: 'pending',
          retry_count: 0,
          max_retries: 3,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getJobsByStatus(status: string): Promise<ScrapingJob[]> {
    try {
      const supabaseAdmin = getSupabaseAdmin();
      if (!supabaseAdmin) {
        throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
      }

      const query = supabaseAdmin.from('scraping_jobs').select('*');

      const { data, error }: PostgrestResponse<ScrapingJob> = await (
        status === 'all' ? query : query.eq('status', status)
      )
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs:', error);
      return [];
    }
  },
  async updateJobStatus(
    id: string,
    status: string,
    updates: Partial<ScrapingJob> = {},
  ): Promise<ScrapingJob> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({
        status,
        ...updates,
        ...(status === 'running' && { started_at: new Date().toISOString() }),
        ...(status === 'completed' && { completed_at: new Date().toISOString() }),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async incrementRetryCount(id: string): Promise<ScrapingJob> {
    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
    }

    const {
      data: current,
      error: fetchError,
    }: PostgrestSingleResponse<Pick<ScrapingJob, 'retry_count'>> = await supabaseAdmin
      .from('scraping_jobs')
      .select('retry_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error }: PostgrestSingleResponse<ScrapingJob> = await supabaseAdmin
      .from('scraping_jobs')
      .update({ retry_count: (current?.retry_count ?? 0) + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  async getAllJobs(limit = 50, offset = 0): Promise<ScrapingJob[]> {
    try {
      const supabase = getSupabase();
      const { data, error }: PostgrestResponse<ScrapingJob> = await supabase
        .from('scraping_jobs')
        .select('*')
        .order('priority', { ascending: false })
        .order('scheduled_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs:', error);
      return [];
    }
  },

  async getJobsFromDate(date: Date): Promise<ScrapingJob[]> {
    try {
      const supabase = getSupabase();
      const { data, error }: PostgrestResponse<ScrapingJob> = await supabase
        .from('scraping_jobs')
        .select('*')
        .gte('created_at', date.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    } catch (error: unknown) {
      console.warn('Error fetching jobs from date:', error);
      return [];
    }
  },
};
