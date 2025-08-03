/**
 * Supabase Validation Logs Service
 * 
 * This service manages validation error logs in Supabase with automatic TTL cleanup
 */

import { createClient } from '@supabase/supabase-js';
import type { ValidationError, ValidationErrorCollection } from '../errors/validationError';
import { logError, logWarning } from '../logging';

// Supabase client - use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Validation log entry structure in Supabase
 */
export interface ValidationLogEntry {
  id: string;
  error_id: string;
  code: string;
  message: string;
  path: string[];
  severity: 'error' | 'warn';
  context?: string;
  user_id?: string;
  session_id?: string;
  timestamp: string;
  expires_at: string;
  metadata?: Record<string, unknown>;
}

/**
 * Validation log summary for analytics
 */
export interface ValidationLogSummary {
  total_logs: number;
  error_count: number;
  warning_count: number;
  top_error_codes: Array<{ code: string; count: number }>;
  date_range: {
    start: string;
    end: string;
  };
}

/**
 * Default TTL for validation logs (7 days)
 */
const DEFAULT_TTL_HOURS = 7 * 24; // 7 days

/**
 * Calculate expiration timestamp based on TTL
 */
function calculateExpirationDate(ttlHours: number = DEFAULT_TTL_HOURS): string {
  const expiration = new Date();
  expiration.setHours(expiration.getHours() + ttlHours);
  return expiration.toISOString();
}

/**
 * Write validation error to Supabase validation_logs table
 */
export async function writeValidationLogToSupabase(
  error: ValidationError,
  ttlHours: number = DEFAULT_TTL_HOURS,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  try {
    const logEntry: Omit<ValidationLogEntry, 'id'> = {
      error_id: error.id,
      code: error.code,
      message: error.message,
      path: error.path,
      severity: error.severity,
      context: error.context,
      user_id: error.userId,
      session_id: error.sessionId,
      timestamp: error.timestamp,
      expires_at: calculateExpirationDate(ttlHours),
      metadata,
    };

    const { error: supabaseError } = await supabase
      .from('validation_logs')
      .insert([logEntry]);

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.writeValidationLogToSupabase');
      return { success: false, error: supabaseError.message };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.writeValidationLogToSupabase');
    return { success: false, error: errorMessage };
  }
}

/**
 * Write multiple validation errors to Supabase in batch
 */
export async function writeValidationLogsBatchToSupabase(
  errors: ValidationError[],
  ttlHours: number = DEFAULT_TTL_HOURS,
  metadata?: Record<string, unknown>
): Promise<{ success: boolean; error?: string; processedCount: number }> {
  if (errors.length === 0) {
    return { success: true, processedCount: 0 };
  }

  try {
    const logEntries: Array<Omit<ValidationLogEntry, 'id'>> = errors.map(error => ({
      error_id: error.id,
      code: error.code,
      message: error.message,
      path: error.path,
      severity: error.severity,
      context: error.context,
      user_id: error.userId,
      session_id: error.sessionId,
      timestamp: error.timestamp,
      expires_at: calculateExpirationDate(ttlHours),
      metadata,
    }));

    const { error: supabaseError } = await supabase
      .from('validation_logs')
      .insert(logEntries);

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.writeValidationLogsBatchToSupabase');
      return { success: false, error: supabaseError.message, processedCount: 0 };
    }

    return { success: true, processedCount: errors.length };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.writeValidationLogsBatchToSupabase');
    return { success: false, error: errorMessage, processedCount: 0 };
  }
}

/**
 * Retrieve validation logs from Supabase with filters
 */
export async function getValidationLogsFromSupabase(options?: {
  severity?: 'error' | 'warn';
  code?: string;
  userId?: string;
  sessionId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data?: ValidationLogEntry[]; error?: string; total?: number }> {
  try {
    let query = supabase
      .from('validation_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    // Apply filters
    if (options?.severity) {
      query = query.eq('severity', options.severity);
    }
    if (options?.code) {
      query = query.eq('code', options.code);
    }
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options?.sessionId) {
      query = query.eq('session_id', options.sessionId);
    }
    if (options?.startDate) {
      query = query.gte('timestamp', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('timestamp', options.endDate);
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, (options.offset + (options.limit || 50)) - 1);
    }

    const { data, error: supabaseError, count } = await query;

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.getValidationLogsFromSupabase');
      return { success: false, error: supabaseError.message };
    }

    return { success: true, data: data || [], total: count || 0 };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.getValidationLogsFromSupabase');
    return { success: false, error: errorMessage };
  }
}

/**
 * Get validation logs summary for analytics
 */
export async function getValidationLogsSummary(options?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<{ success: boolean; data?: ValidationLogSummary; error?: string }> {
  try {
    let query = supabase
      .from('validation_logs')
      .select('code, severity, timestamp');

    // Apply filters
    if (options?.userId) {
      query = query.eq('user_id', options.userId);
    }
    if (options?.startDate) {
      query = query.gte('timestamp', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('timestamp', options.endDate);
    }

    const { data, error: supabaseError } = await query;

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.getValidationLogsSummary');
      return { success: false, error: supabaseError.message };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: {
          total_logs: 0,
          error_count: 0,
          warning_count: 0,
          top_error_codes: [],
          date_range: {
            start: options?.startDate || new Date().toISOString(),
            end: options?.endDate || new Date().toISOString(),
          },
        },
      };
    }

    // Calculate summary statistics
    const errorCount = data.filter(log => log.severity === 'error').length;
    const warningCount = data.filter(log => log.severity === 'warn').length;

    // Calculate top error codes
    const codeCount = data.reduce((acc, log) => {
      acc[log.code] = (acc[log.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrorCodes = Object.entries(codeCount)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate date range
    const timestamps = data.map(log => log.timestamp).sort();
    const dateRange = {
      start: timestamps[0] || (options?.startDate || new Date().toISOString()),
      end: timestamps[timestamps.length - 1] || (options?.endDate || new Date().toISOString()),
    };

    const summary: ValidationLogSummary = {
      total_logs: data.length,
      error_count: errorCount,
      warning_count: warningCount,
      top_error_codes: topErrorCodes,
      date_range: dateRange,
    };

    return { success: true, data: summary };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.getValidationLogsSummary');
    return { success: false, error: errorMessage };
  }
}

/**
 * Clean up expired validation logs (called by cron job)
 */
export async function cleanupExpiredValidationLogs(): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const now = new Date().toISOString();
    
    const { count, error: supabaseError } = await supabase
      .from('validation_logs')
      .delete({ count: 'exact' })
      .lt('expires_at', now);

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.cleanupExpiredValidationLogs');
      return { success: false, deletedCount: 0, error: supabaseError.message };
    }

    const deletedCount = count || 0;
    if (deletedCount > 0) {
      logWarning(`Cleaned up ${deletedCount} expired validation logs`);
    }

    return { success: true, deletedCount };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.cleanupExpiredValidationLogs');
    return { success: false, deletedCount: 0, error: errorMessage };
  }
}

/**
 * Delete validation logs for a specific user (GDPR compliance)
 */
export async function deleteUserValidationLogs(userId: string): Promise<{ success: boolean; deletedCount: number; error?: string }> {
  try {
    const { count, error: supabaseError } = await supabase
      .from('validation_logs')
      .delete({ count: 'exact' })
      .eq('user_id', userId);

    if (supabaseError) {
      logError(supabaseError, 'ValidationLogsService.deleteUserValidationLogs');
      return { success: false, deletedCount: 0, error: supabaseError.message };
    }

    const deletedCount = count || 0;
    if (deletedCount > 0) {
      logWarning(`Deleted ${deletedCount} validation logs for user ${userId}`);
    }

    return { success: true, deletedCount };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.deleteUserValidationLogs');
    return { success: false, deletedCount: 0, error: errorMessage };
  }
}

/**
 * Get validation logs statistics for dashboard
 */
export async function getValidationLogsStats(timeframe: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
  success: boolean;
  data?: {
    totalLogs: number;
    errorRate: number;
    topErrorCodes: Array<{ code: string; count: number }>;
    timeline: Array<{ hour: string; errors: number; warnings: number }>;
  };
  error?: string;
}> {
  try {
    // Calculate time range
    const now = new Date();
    const timeRanges = {
      '1h': 1,
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30,
    };
    
    const hoursBack = timeRanges[timeframe];
    const startTime = new Date(now.getTime() - hoursBack * 60 * 60 * 1000);

    const { success, data: logs, error } = await getValidationLogsFromSupabase({
      startDate: startTime.toISOString(),
      endDate: now.toISOString(),
    });

    if (!success || !logs) {
      return { success: false, error };
    }

    // Calculate statistics
    const totalLogs = logs.length;
    const errorCount = logs.filter(log => log.severity === 'error').length;
    const errorRate = totalLogs > 0 ? (errorCount / totalLogs) * 100 : 0;

    // Top error codes
    const codeCount = logs.reduce((acc, log) => {
      acc[log.code] = (acc[log.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topErrorCodes = Object.entries(codeCount)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Timeline data (grouped by hour)
    const timeline = logs.reduce((acc, log) => {
      const hour = new Date(log.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH
      if (!acc[hour]) {
        acc[hour] = { hour, errors: 0, warnings: 0 };
      }
      if (log.severity === 'error') {
        acc[hour].errors++;
      } else {
        acc[hour].warnings++;
      }
      return acc;
    }, {} as Record<string, { hour: string; errors: number; warnings: number }>);

    return {
      success: true,
      data: {
        totalLogs,
        errorRate,
        topErrorCodes,
        timeline: Object.values(timeline).sort((a, b) => a.hour.localeCompare(b.hour)),
      },
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logError(err, 'ValidationLogsService.getValidationLogsStats');
    return { success: false, error: errorMessage };
  }
}

// Export the supabase client for direct access if needed
export { supabase as validationLogsSupabaseClient };
