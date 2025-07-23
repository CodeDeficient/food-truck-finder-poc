import { supabase, supabaseAdmin } from '../client';
import {} from '@supabase/supabase-js';
export const APIUsageService = {
    async trackUsage(serviceName, requests, tokens) {
        var _a, _b;
        if (!supabaseAdmin) {
            throw new Error('Admin operations require SUPABASE_SERVICE_ROLE_KEY');
        }
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data: existing, error: existingError, } = await supabaseAdmin
                .from('api_usage')
                .select('*')
                .eq('service_name', serviceName)
                .eq('usage_date', today)
                .single();
            if (existingError && existingError.code !== 'PGRST116')
                throw existingError;
            if (existing) {
                const { data, error } = await supabaseAdmin
                    .from('api_usage')
                    .update({
                    requests_count: ((_a = existing.requests_count) !== null && _a !== void 0 ? _a : 0) + requests,
                    tokens_used: ((_b = existing.tokens_used) !== null && _b !== void 0 ? _b : 0) + tokens,
                })
                    .eq('id', existing.id)
                    .select()
                    .single();
                if (error)
                    throw error;
                return data;
            }
            else {
                const { data, error } = await supabaseAdmin
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
                if (error)
                    throw error;
                return data;
            }
        }
        catch (error) {
            console.warn('Error tracking usage:', error);
            throw error;
        }
    },
    async getTodayUsage(serviceName) {
        try {
            const today = new Date().toISOString().split('T')[0];
            const { data, error } = await supabase
                .from('api_usage')
                .select('*')
                .eq('service_name', serviceName)
                .eq('usage_date', today)
                .single();
            if (error !== null && String(error.code) != 'PGRST116')
                throw error;
            return data !== null && data !== void 0 ? data : undefined;
        }
        catch (error) {
            console.warn('Error getting today usage:', error);
            throw error;
        }
    },
    async getAllUsageStats() {
        try {
            const { data, error } = await supabase
                .from('api_usage')
                .select('*')
                .order('usage_date', { ascending: false })
                .limit(30);
            if (error)
                throw error;
            return data !== null && data !== void 0 ? data : [];
        }
        catch (error) {
            console.warn('Error getting usage stats:', error);
            throw error;
        }
    },
};
