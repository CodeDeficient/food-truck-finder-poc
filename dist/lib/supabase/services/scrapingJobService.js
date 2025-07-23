import { supabase, supabaseAdmin } from '../client';
import {} from '@supabase/supabase-js';
export const ScrapingJobService = {
    async createJob(jobData) {
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data, error } = await supabaseAdmin
            .from('scraping_jobs')
            .insert([
            Object.assign(Object.assign({}, jobData), { status: 'pending', retry_count: 0, max_retries: 3, created_at: new Date().toISOString() }),
        ])
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async getJobsByStatus(status) {
        try {
            const query = supabase.from('scraping_jobs').select('*');
            const { data, error } = await (status === 'all' ? query : query.eq('status', status))
                .order('priority', { ascending: false })
                .order('scheduled_at', { ascending: true });
            if (error)
                throw error;
            return data !== null && data !== void 0 ? data : [];
        }
        catch (error) {
            console.warn('Error fetching jobs:', error);
            return [];
        }
    },
    async updateJobStatus(id, status, updates = {}) {
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data, error } = await supabaseAdmin
            .from('scraping_jobs')
            .update(Object.assign(Object.assign(Object.assign({ status }, updates), (status === 'running' && { started_at: new Date().toISOString() })), (status === 'completed' && { completed_at: new Date().toISOString() })))
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async incrementRetryCount(id) {
        var _a;
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        const { data: current, error: fetchError, } = await supabaseAdmin
            .from('scraping_jobs')
            .select('retry_count')
            .eq('id', id)
            .single();
        if (fetchError)
            throw fetchError;
        const { data, error } = await supabaseAdmin
            .from('scraping_jobs')
            .update({ retry_count: ((_a = current === null || current === void 0 ? void 0 : current.retry_count) !== null && _a !== void 0 ? _a : 0) + 1 })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    },
    async getAllJobs(limit = 50, offset = 0) {
        try {
            const { data, error } = await supabase
                .from('scraping_jobs')
                .select('*')
                .order('priority', { ascending: false })
                .order('scheduled_at', { ascending: true })
                .range(offset, offset + limit - 1);
            if (error)
                throw error;
            return data !== null && data !== void 0 ? data : [];
        }
        catch (error) {
            console.warn('Error fetching jobs:', error);
            return [];
        }
    },
    async getJobsFromDate(date) {
        try {
            const { data, error } = await supabase
                .from('scraping_jobs')
                .select('*')
                .gte('created_at', date.toISOString())
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            return data !== null && data !== void 0 ? data : [];
        }
        catch (error) {
            console.warn('Error fetching jobs from date:', error);
            return [];
        }
    },
};
