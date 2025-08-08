# Service Level Agreement (SLA)

## Service Availability

### Uptime Commitment
- **Target**: 99.9% uptime (excluding scheduled maintenance)
- **Measurement Period**: Monthly
- **Exclusions**: Scheduled maintenance windows (communicated 48 hours in advance)

### Performance Targets
| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms p95 | 95th percentile of all API calls |
| Search Query Time | < 500ms p95 | Location-based search queries |
| Page Load Time | < 2s | Time to interactive |
| Data Pipeline Freshness | < 1 hour | Time from source update to display |

## Support Response Times

### Issue Priority Levels
| Priority | Description | Initial Response | Resolution Target |
|----------|-------------|------------------|-------------------|
| P1 - Critical | Service down, data loss risk | 1 hour | 4 hours |
| P2 - High | Major feature unavailable | 4 hours | 24 hours |
| P3 - Medium | Minor feature issues | 1 business day | 3 business days |
| P4 - Low | Cosmetic issues, questions | 2 business days | Best effort |

## Data Guarantees

### Backup & Recovery
- **Backup Frequency**: Daily automated backups
- **Retention Period**: 30 days
- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours

### Data Accuracy
- **Food Truck Locations**: Updated hourly during business hours
- **Business Information**: Verified weekly via AI pipeline
- **User Data**: Real-time synchronization

## Maintenance Windows
- **Scheduled Maintenance**: Sundays 2:00 AM - 4:00 AM EST
- **Emergency Maintenance**: As required with immediate notification

## Service Credits
Service credits may be available for uptime below 99.9%. Contact support for details.

## Contact
- **Support Email**: support@foodtruckfinder.app
- **Emergency Hotline**: [To be established]
- **Status Page**: status.foodtruckfinder.app

*This SLA is subject to the terms of your service agreement.*
