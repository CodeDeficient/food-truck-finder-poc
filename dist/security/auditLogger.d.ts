/**
 * SOTA Security Audit Logging System
 * Implements comprehensive audit logging for admin actions and security events
 */
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
export declare class AuditLogger {
    /**
     * Log admin action with full audit trail
     */
    static logAdminAction(options: {
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
    }): Promise<void>;
    /**
     * Log security event
     */
    static logSecurityEvent(event: SecurityEvent): Promise<void>;
    /**
     * Log authentication events
     */
    static logAuthEvent(options: {
        eventType: 'login_attempt' | 'login_success' | 'login_failure' | 'logout';
        userEmail?: string;
        userId?: string;
        request?: {
            ip?: string;
            userAgent?: string;
        };
        details?: Record<string, unknown>;
    }): Promise<void>;
    /**
     * Log data access events
     */
    static logDataAccess(options: {
        userId: string;
        userEmail: string;
        resourceType: string;
        resourceId?: string;
        action?: 'read' | 'search' | 'export' | 'admin_access';
        request?: {
            ip?: string;
            userAgent?: string;
        };
    }): Promise<void>;
    /**
     * Write audit log to database
     */
    private static writeAuditLog;
    /**
     * Determine severity based on action and resource type
     */
    private static determineSeverity;
    /**
     * Get audit logs for a specific user
     */
    static getUserAuditLogs(userId: string, limit?: number, offset?: number): Promise<AuditLogEntry[]>;
    /**
     * Get recent security events
     */
    static getRecentSecurityEvents(hours?: number, severity?: SeverityLevel): Promise<Record<string, unknown>[]>;
}
/**
 * Security monitoring utilities
 */
export declare const SecurityMonitor: {
    /**
     * Check for suspicious activity patterns
     */
    checkSuspiciousActivity(userId: string): Promise<{
        suspicious: boolean;
        reasons: string[];
        riskLevel: "low" | "medium" | "high";
    }>;
};
export {};
