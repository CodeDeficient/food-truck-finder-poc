# Configuration Migration Guide

## Purpose
This document serves as a migration guide to standardize configuration files across the project. The goal is to reduce complexity, improve performance, and enforce consistent practices.

## Background
Previously, configuration was stored in a mix of JSON, JavaScript, and Markdown files. This approach led to inconsistencies, redundant efforts, and confusion when making changes. We decided to migrate to centralized TOML-based configuration using `supabase/project.config.toml` format.

## Benefits
- Centralized configuration: All configuration options are stored in single file.
- Simplified management: Easier to maintain, modify and track changes
- Performance improvement: Reduced parsing overhead by eliminating multiple file reads
- Type safety: Enforced via TOML schema validation

## Before & After
```diff
- project-config.json
- system-defaults.json
- override-settings.env
- backup/configuration_history.md
+ project.config.toml
```

## Configuration Translation Table

### Security Settings
| Legacy | New Location | Description |
|--------|--------------|-------------|
| auth_disabled | Security.disable_auth | Disable authentication module |
| rate_limit_max | Security.rate_limit.max_requests | API rate limiting threshold |
| admin_whitelist | Security.Admin_IPs | Whitelisted admin IP addresses |

### Feature Flags
| Old Key | New Path | Remarks |
|---------|----------|---------|
| enable_beta_features | Features.BetaOnboarding | Now includes tutorial completions |
| show_experimental_ui | Features.ExperimentalUX.Enabled | Split into UI version selector |
| analytics_consent | Privacy.AnalyticsEnabled | Migrated to telemetry panel settings |

### Integration Settings
| Legacy | New Configuration | Changes |
|--------|-------------------|---------|
| storage.provider | Integrations.Storage.Provider | Added multi-provider support |
| notification.email | Integrations.Email.enabled | Email notifications via SMTP |
| twilio.api_key | Integrations.SmsProvider.TwilioApiKeys | Integrated with messaging queue |

### Migration Steps
1. **Export current settings**: Run backup script to export JSON configurations:
   ```sh
   node scripts/backup-config.cjs > 2025_backup_config
   ```

2. **Install TOML parser**:
   ```sh
   npm install @iarna/toml
   ```

3. **Convert JSON to TOML**:
   Example script in scripts/convert_to_toml.ts:
   ```typescript
   import fs from 'fs';
   import { parse } from '@iarna/toml';

   // Read existing JSON configuration
   const configJson = JSON.parse(fs.readFileSync('project-config.json', 'utf8'));
   const tomlConfig = {
      Project: {
          Name: configJson.project_name,
          Version: '1.0.0-beta',
      },
      Security: {
          disable_auth: configJson.auth_disabled,
          rate_limit: {
              max_requests: configJson.rate_limit_max,
              reset_interval: 60 // Default in seconds
          }
      },
      Features: {
          ExperimentalUX: {
              Enabled: configJson.show_experimental_ui || false
          }
      }
      // ... Additional sections
   };

   // Write to TOML file
   fs.writeFileSync('project.config.toml', JSON.stringify(tomlConfig, null, 2));
   ```

4. **Validate converted configuration**:
   Run unit tests and static analysis on the new configuration file.

5. **Update documentation**:
   Update all project READMEs and developer docs to reference project.config.toml as the central config source:

   ```txt
   // Before
   import config from 'project-config.json'

   // After
   import projectConfig from '@supabase/project.config.toml'
   ```

6. **Audit integrations**:
   - Review all code that interacts with the config modules
   - Update environment variable loading patterns
   - Remove deprecated settings

### Migration Checklist
```js
// Automated checklist verification script
import { projectConfigFileExists, allServicesReachable, unitTestsPassing } from './migration_checklist.cjs';

console.log('Migration Complete!', {
  projectConfigFileExists: projectConfigFileExists(),
  allServicesOnline: allServicesReachable(),
  testResults: unitTestsPassing()
});
```

### Post-migration Testing
Use integration test suites to verify end-to-end behavior against migrated config settings. Ensure features:
- Authentication remains consistent
- Rate limiting enforces actual limits
- Experimental features toggle as expected

For any issues or configuration inconsistencies, refer to the migration script's logs and adjust the `project.config.toml` using schema validation tools (`@stoplight/spectral`).

End users should be informed of configuration adjustments and feature changes during the next update cycle through in-app notifications and release documentation.
