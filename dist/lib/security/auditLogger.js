/**
 * SOTA Security Audit Logging System
 * Implements comprehensive audit logging for admin actions and security events
 */
import { supabaseAdmin } from '@/lib/supabase';
/**
 * Audit Logger Service
 */
export class AuditLogger {
    /**
     * Log admin action with full audit trail
     */
    static async logAdminAction(options) {
        const { userId, userEmail, action, resourceType, resourceId, details, request } = options;
        const auditEntry = {
            user_id: userId,
            user_email: userEmail,
            action,
            resource_type: resourceType,
            resource_id: resourceId,
            details,
            ip_address: request === null || request === void 0 ? void 0 : request.ip,
            user_agent: request === null || request === void 0 ? void 0 : request.userAgent,
            session_id: request === null || request === void 0 ? void 0 : request.sessionId,
            timestamp: new Date().toISOString(),
            severity: this.determineSeverity(action, resourceType),
        };
        await this.writeAuditLog(auditEntry);
        // Log to console for immediate monitoring
        console.info('Admin Action Audit:', {
            user: userEmail,
            action,
            resource: resourceId === undefined ? resourceType : `${resourceType}:${resourceId}`,
            timestamp: auditEntry.timestamp,
        });
    }
    /**
     * Log security event
     */
    static async logSecurityEvent(event) {
        const logEntry = {
            event_type: event.event_type,
            user_id: event.user_id,
            user_email: event.user_email,
            ip_address: event.ip_address,
            user_agent: event.user_agent,
            details: event.details,
            severity: event.severity,
            timestamp: new Date().toISOString(),
        };
        try {
            if (supabaseAdmin) {
                await supabaseAdmin.from('security_events').insert(logEntry);
            }
        }
        catch (error) {
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
    static async logAuthEvent(options) {
        const { eventType, userEmail, userId, request, details } = options;
        const severity = eventType === 'login_failure' ? 'warning' : 'info';
        await this.logSecurityEvent({
            event_type: eventType,
            user_id: userId,
            user_email: userEmail,
            ip_address: request === null || request === void 0 ? void 0 : request.ip,
            user_agent: request === null || request === void 0 ? void 0 : request.userAgent,
            details,
            severity,
        });
    }
    /**
     * Log data access events
     */
    static async logDataAccess(options) {
        const { userId, userEmail, resourceType, resourceId, action = 'read', request } = options;
        await this.logSecurityEvent({
            event_type: 'data_access',
            user_id: userId,
            user_email: userEmail,
            ip_address: request === null || request === void 0 ? void 0 : request.ip,
            user_agent: request === null || request === void 0 ? void 0 : request.userAgent,
            details: {
                resource_type: resourceType,
                resource_id: resourceId,
                action,
            },
            severity: 'info',
        });
    }
    /**
     * Write audit log to database
     */
    static async writeAuditLog(entry) {
        try {
            if (supabaseAdmin) {
                await supabaseAdmin.from('audit_logs').insert(entry);
            }
        }
        catch (error) {
            console.error('Failed to write audit log:', error);
            // Don't throw - audit logging should not break application flow
        }
    }
    /**
     * Determine severity based on action and resource type
     */
    static determineSeverity(action, resourceType) {
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
    static async getUserAuditLogs(userId, limit = 100, offset = 0) {
        var _a;
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
            return (_a = data) !== null && _a !== void 0 ? _a : [];
        }
        catch (error) {
            console.error('Error fetching user audit logs:', error);
            return [];
        }
    }
    /**
     * Get recent security events
     */
    static async getRecentSecurityEvents(hours = 24, severity) {
        var _a;
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
            return (_a = data) !== null && _a !== void 0 ? _a : [];
        }
        catch (error) {
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
    async checkSuspiciousActivity(userId) {
        const reasons = [];
        let riskLevel = 'low';
        try {
            // Check recent failed login attempts
            const recentEvents = await AuditLogger.getRecentSecurityEvents(1, 'warning');
            const failedLogins = recentEvents.filter((event) => event.event_type === 'login_failed' && event.user_id === userId);
            if (failedLogins.length > 5) {
                reasons.push('Multiple failed login attempts');
                riskLevel = 'high';
            }
            else if (failedLogins.length > 2) {
                reasons.push('Recent failed login attempts');
                riskLevel = 'medium';
            }
            // Check for unusual access patterns
            const auditLogs = await AuditLogger.getUserAuditLogs(userId, 50);
            const recentActions = auditLogs.filter((log) => new Date(log.timestamp) > new Date(Date.now() - 60 * 60 * 1000));
            if (recentActions.length > 20) {
                reasons.push('High activity volume');
                riskLevel = riskLevel === 'high' ? 'high' : 'medium';
            }
            return {
                suspicious: reasons.length > 0,
                reasons,
                riskLevel,
            };
        }
        catch (error) {
            console.error('Error checking suspicious activity:', error);
            return {
                suspicious: false,
                reasons: [],
                riskLevel: 'low',
            };
        }
    },
};
