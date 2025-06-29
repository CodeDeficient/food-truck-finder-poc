/**
 * SOTA Security Audit Logging System
 * Implements comprehensive audit logging for admin actions and security events
 */

import { supabaseAdmin } from '@/lib/supabase';

// Interface definitions moved to the top level
interface LogAdminActionParams {
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  request?: {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
  };
}

interface LogAuthEventParams {
  eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout';
  userEmail?: string;
  userId?: string;
  request?: {
    ip?: string;
    userAgent?: string;
  };
  details?: Record<string, unknown>;
}

interface LogDataAccessParams {
  userId: string;
  userEmail: string;
  resourceType: string;
  resourceId?: string;
  action?: 'read' | 'search' | 'export' | 'admin_access';
  request?: {
    ip?: string;
    userAgent?: string;
  };
}

// Type alias for severity levels to comply with sonarjs/use-type-alias
type SeverityLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLogEntry {
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  timestamp: string;
  severity: SeverityLevel;
}

export interface SecurityEvent {
  event_type: 'login_attempt' | 'login_success' | 'login_failure' | 'logout' | 'permission_denied' | 'data_access' | 'data_modification' | 'admin_action';
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  details?: Record<string, unknown>;
  severity: SeverityLevel;
}

/**
 * Audit Logger Service
 */
export class AuditLogger {
  /**
   * Log admin action with full audit trail
   */
  static async logAdminAction(params: LogAdminActionParams): Promise<void> {
    const auditEntry: AuditLogEntry = {
      user_id: params.userId,
      user_email: params.userEmail,
      action: params.action,
      resource_type: params.resourceType,
      resource_id: params.resourceId,
      details: params.details,
      ip_address: params.request?.ip,
      user_agent: params.request?.userAgent,
      session_id: params.request?.sessionId,
      timestamp: new Date().toISOString(),
      severity: this.determineSeverity(params.action, params.resourceType)
    };

    await this.writeAuditLog(auditEntry);
    
    // Log to console for immediate monitoring
    console.info('Admin Action Audit:', {
      user: params.userEmail,
      action: params.action,
      resource: (params.resourceId === undefined) ? params.resourceType : `${params.resourceType}:${params.resourceId}`,
      timestamp: auditEntry.timestamp
    });
  }

  /**
   * Log security event
   */
  static async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const logEntry = {
      event_type: event.event_type,
      user_id: event.user_id,
      user_email: event.user_email,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      details: event.details,
      severity: event.severity,
      timestamp: new Date().toISOString()
    };

    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('security_events')
          .insert(logEntry);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }

    // Always log security events to console
    console.info('Security Event:', logEntry);

    // Alert on critical security events
    if (event.severity === 'critical' || event.severity === 'error') {
      console.warn('SECURITY ALERT:', logEntry);
    }
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(params: LogAuthEventParams): Promise<void> {
    const severity = params.eventType === 'login_failure' ? 'warning' : 'info';
    
    await this.logSecurityEvent({
      event_type: params.eventType,
      user_id: params.userId,
      user_email: params.userEmail,
      ip_address: params.request?.ip,
      user_agent: params.request?.userAgent,
      details: params.details,
      severity
    });
  }

  /**
   * Log data access events
   */
interface LogDataAccessParams {
  userId: string;
  userEmail: string;
  resourceType: string;
  resourceId?: string;
  action?: 'read' | 'search' | 'export' | 'admin_access';
  request?: {
    ip?: string;
    userAgent?: string;
  };
}
  static async logDataAccess(params: LogDataAccessParams): Promise<void> {
    await this.logSecurityEvent({
      event_type: 'data_access',
      user_id: params.userId,
      user_email: params.userEmail,
      ip_address: params.request?.ip,
      user_agent: params.request?.userAgent,
      details: {
        resource_type: params.resourceType,
        resource_id: params.resourceId,
        action: params.action ?? 'read'
      },
      severity: 'info'
    });
  }

  /**
   * Write audit log to database
   */
  private static async writeAuditLog(entry: AuditLogEntry): Promise<void> {
    try {
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('audit_logs')
          .insert(entry);
      }
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Don't throw - audit logging should not break application flow
    }
  }

  /**
   * Determine severity based on action and resource type
   */
  private static determineSeverity(action: string, resourceType: string): SeverityLevel {
    // Critical actions
    if (action.includes('delete') || action.includes('remove')) {
      return 'critical';
    }
    
    // Warning actions
    if (action.includes('update') || action.includes('modify') || action.includes('change')) {
      return 'warning';
    }
    
    // Admin-specific actions
    if (resourceType === 'user' || resourceType === 'admin' || resourceType === 'system') {
      return 'warning';
    }
    
    // Default to info
    return 'info';
  }

  /**
   * Get audit logs for a specific user
   */
  static async getUserAuditLogs(
    userId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<AuditLogEntry[]> {
    try {
      if (!supabaseAdmin) {
        return [];
      }

      const { data, error } = await supabaseAdmin
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Failed to fetch user audit logs:', error);
        return [];
      }

      return (data as AuditLogEntry[]) ?? [];
    } catch (error) {
      console.error('Error fetching user audit logs:', error);
      return [];
    }
  }

  /**
   * Get recent security events
   */
  static async getRecentSecurityEvents(
    hours: number = 24,
    severity?: SeverityLevel
  ): Promise<Record<string, unknown>[]> {
    try {
      if (!supabaseAdmin) {
        return [];
      }

      const startTime = new Date();
      startTime.setHours(startTime.getHours() - hours);

      let query = supabaseAdmin
        .from('security_events')
        .select('*')
        .gte('timestamp', startTime.toISOString())
        .order('timestamp', { ascending: false });

      if (severity) {
        query = query.eq('severity', severity);
      }

      const { data, error } = await query.limit(500);

      if (error) {
        console.error('Failed to fetch security events:', error);
        return [];
      }

      return (data as Record<string, unknown>[]) ?? [];
    } catch (error) {
      console.error('Error fetching security events:', error);
      return [];
    }
  }
}

/**
 * Security monitoring utilities
 */
export const SecurityMonitor = {
  /**
   * Check for suspicious activity patterns
   */
  async checkSuspiciousActivity(userId: string): Promise<{
    suspicious: boolean;
    reasons: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const reasons: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' = 'low';

    try {
      // Check recent failed login attempts
      const recentEvents = await AuditLogger.getRecentSecurityEvents(1, 'warning');
      const failedLogins = recentEvents.filter(
        event => event.event_type === 'login_failure' && event.user_id === userId
      );

      if (failedLogins.length > 5) {
        reasons.push('Multiple failed login attempts');
        riskLevel = 'high';
      } else if (failedLogins.length > 2) {
        reasons.push('Recent failed login attempts');
        riskLevel = 'medium';
      }

      // Check for unusual access patterns
      const auditLogs = await AuditLogger.getUserAuditLogs(userId, 50);
      const recentActions = auditLogs.filter(
        log => new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000) // Last hour
      );

      if (recentActions.length > 20) {
        reasons.push('High activity volume');
        riskLevel = riskLevel === 'high' ? 'high' : 'medium';
      }

      return {
        suspicious: reasons.length > 0,
        reasons,
        riskLevel
      };
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return {
        suspicious: false,
        reasons: [],
        riskLevel: 'low'
      };
    }
  },
};
