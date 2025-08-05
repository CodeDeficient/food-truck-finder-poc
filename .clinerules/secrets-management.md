## Brief overview
This document outlines the rules for managing secrets and environment variables within the project. The primary goal is to prevent hardcoding sensitive information, such as API keys and tokens, directly into the codebase, and to ensure proper secrets management across different environments.

## Secrets Management
- **Never hardcode secrets**: Do not write API keys, database connection strings, or any other sensitive credentials directly in source code, including scripts, tests, or configuration files.
  - **Trigger Case**: When adding a new service or dependency that requires an API key or other secret.
  - **Incorrect Example**: `const apiKey = 'sk-12345abcdef';`
- **Use Environment Variables**: All secrets must be stored in environment-specific files (`.env.local`, `.env.development`, `.env.production`). The application and scripts should be configured to read these variables from the environment.
  - **Correct Example**: In `.env.local`, add `GEMINI_API_KEY=your_secret_key_here`. In the code, access it via `process.env.GEMINI_API_KEY`.
- **Environment-Specific Configuration**:
  - **Development**: Use `.env.local` for local development secrets
  - **Production**: Use platform-specific secret management (Vercel, GitHub Actions secrets, etc.)
  - **Never commit `.env` files**: Add `.env*` to `.gitignore` except for `.env.example`
- **Environment Variable Naming**: For client-side variables in Next.js, they must be prefixed with `NEXT_PUBLIC_`. Server-side-only variables should not have this prefix.
- **Validation**: Implement checks at application startup or script initialization to ensure that all required environment variables are present. If a variable is missing, the application should fail fast with a clear error message.
- **Dotenv Best Practices**:
  - **Proven Import Pattern**: Use `import dotenv from 'dotenv';` followed by `dotenv.config({ path: '.env.local' });` at the very beginning of your script
  - **Error Handling**: Implement proper error handling: `const result = require('dotenv').config({ path: '.env.local' }); if (result.error) { throw result.error; }`
  - **Load First**: Always load environment variables before any other imports that depend on them
  - **Dynamic Imports for Dependent Modules**: Use dynamic imports (`await import()`) for modules that require environment variables to be loaded first
  - **Example Pattern**:
    ```javascript
    // Load environment variables first
    import dotenv from 'dotenv';
    dotenv.config({ path: '.env.local' });
    
    // Then import modules that depend on environment variables
    const { processScrapingJob } = await import('../dist/lib/pipeline/scrapingProcessor.js');
    ```
- **Production Security**:
  - Never store production secrets in `.env` files
  - Use platform-provided secret management (Vercel Environment Variables, GitHub Actions Secrets)
  - For local production testing, use secure credential managers or encrypted files
- **Cross-Environment Consistency**:
  - Maintain the same variable names across environments
  - Use `.env.example` to document required variables without values
  - Implement validation to ensure all required variables are present in each environment
