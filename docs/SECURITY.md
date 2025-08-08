# Security Documentation

## Overview
Food Truck Finder implements enterprise-grade security measures to protect user data and ensure system integrity.

## Security Architecture

### Authentication & Authorization
- **Provider**: Supabase Auth with Row Level Security (RLS)
- **Methods**: OAuth 2.0 (Google), Email/Password
- **Session Management**: JWT tokens with secure HTTP-only cookies
- **Role-Based Access Control**: Admin, Vendor, Customer roles

### Data Protection
- **Encryption at Rest**: All database content encrypted via Supabase
- **Encryption in Transit**: TLS 1.3 for all API communications
- **PII Handling**: Minimal PII collection, GDPR-compliant data practices

### API Security
- **Rate Limiting**: Request throttling per IP and user
- **Input Validation**: Strict TypeScript types and runtime validation
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **XSS Protection**: React's built-in escaping, Content Security Policy headers

### Infrastructure Security
- **Hosting**: Vercel edge network with DDoS protection
- **Database**: Supabase managed PostgreSQL with automatic backups
- **Secrets Management**: Environment variables, never committed to code
- **Monitoring**: Real-time error tracking and anomaly detection

## Compliance
- GDPR-ready data handling
- SOC 2 Type II compliance (via infrastructure providers)
- Regular security audits and penetration testing planned

## Security Contact
For security concerns or vulnerability reports, please contact:
security@foodtruckfinder.app

## Update History
- Last Review: 2025-08-08
- Next Scheduled Review: 2025-09-08
