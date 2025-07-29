# ESM Import Best Practices & Common Issues

## Objective
To establish clear guidelines and best practices for handling ESM imports in the food-truck-finder project to prevent directory import errors and ensure proper module resolution.

## Core Principles

### 1. Explicit File Extensions Required
- **Rule 1.1:** Always include `.js` file extensions in relative imports
  - ❌ `import { APIUsageService } from '../supabase/client'`
  - ✅ `import { APIUsageService } from '../supabase/client.js'`

### 2. No Directory Imports
- **Rule 2.1:** Never import directly from directories - always specify the exact file
  - ❌ `import { APIUsageService } from '../supabase'`
  - ✅ `import { APIUsageService } from '../supabase/services/apiUsageService.js'`

### 3. Correct Relative Path Resolution
- **Rule 3.1:** Verify relative paths account for the current file's location
  - ❌ `import { supabaseAdmin } from '../supabase/client.js'` (in `dist/lib/supabase/utils/index.js`)
  - ✅ `import { supabaseAdmin } from '../client.js'` (in `dist/lib/supabase/utils/index.js`)

## Common Error Patterns and Solutions

### Pattern 1: Directory Import Not Supported
**Error:** `Error [ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '.../dist/lib/supabase' is not supported resolving ES modules`

**Solution:** 
1. Identify the specific file being imported (e.g., `apiUsageService.js`)
2. Update import to point to the exact file path
3. Add `.js` extension

### Pattern 2: Module Not Found with Correct Path
**Error:** `Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../dist/lib/supabase/client'`

**Solution:**
1. Add `.js` extension to the import path
2. Verify the file actually exists at that location

### Pattern 3: Named Export Not Found
**Error:** `SyntaxError: The requested module '../supabase/client.js' does not provide an export named 'APIUsageService'`

**Solution:**
1. Check what the module actually exports
2. Import from the correct file where the export is defined
3. Verify export names match exactly

## Environment Variable Loading in ESM

### Proper dotenv Integration
When using ESM modules that require environment variables:

1. **Load dotenv first** before any other imports
2. **Use dynamic imports** for modules that depend on environment variables
3. **Initialize modules after** environment variables are loaded

**Example Pattern:**
```javascript
// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Use dynamic imports for modules that need env vars
let processScrapingJob, ScrapingJobService;
async function initializeModules() {
  const scrapingProcessor = await import('../dist/lib/pipeline/scrapingProcessor.js');
  const scrapingJobService = await import('../dist/lib/supabase/services/scrapingJobService.js');
  processScrapingJob = scrapingProcessor.processScrapingJob;
  ScrapingJobService = scrapingJobService.ScrapingJobService;
}
```

## Automated Fixing Strategy

### Systematic Import Fixing
1. **Identify all problematic imports** using regex patterns
2. **Categorize by error type** (missing extensions, directory imports, wrong paths)
3. **Apply targeted fixes** based on file location and import targets
4. **Verify fixes work** by testing module resolution

### Key Regex Patterns for Detection
- Directory imports: `from\s+['"][^'"]*[^\.js]['"]`
- Missing extensions: Look for imports without .js extension
- Relative path issues: Complex pattern matching file structure

## Prevention Strategies

### 1. Build Process Integration
- **Rule 1.1:** Run import validation as part of build process
- **Rule 1.2:** Fail builds on import resolution errors
- **Rule 1.3:** Generate import maps during compilation

### 2. Code Review Checklist
- [ ] All relative imports include `.js` extension
- [ ] No directory imports (importing from folders without specifying files)
- [ ] Relative paths are correct for the file's location
- [ ] Named exports match what's actually exported
- [ ] Environment variable dependent modules use dynamic imports

### 3. Testing Protocol
- **Rule 3.1:** Test script execution with `--help` flag first
- **Rule 3.2:** Verify environment variable loading works
- **Rule 3.3:** Test actual functionality with real data
- **Rule 3.4:** Check error handling and edge cases

## GitHub Actions Specific Considerations

### Local vs Remote Execution
- **Rule 4.1:** Scripts run locally using compiled `dist/` files
- **Rule 4.2:** Changes must be committed to affect GitHub Actions workflow
- **Rule 4.3:** Environment variables in GitHub Actions come from repository secrets
- **Rule 4.4:** Local testing should mirror GitHub Actions environment

### Workflow Integration
- **Rule 5.1:** GitHub Actions workflows call local scripts directly
- **Rule 5.2:** Local scripts should be self-contained and not depend on external triggers
- **Rule 5.3:** Error handling should be robust for CI/CD environments
- **Rule 5.4:** Logging should be clear and informative for debugging

## Quality Control and Data Pipeline Integration

### Safe Script Execution
- **Rule 6.1:** Always implement proper error handling and validation in ESM scripts
- **Rule 6.2:** Use batch processing with safety checks for data operations
- **Rule 6.3:** Implement retry logic and quality scoring for robust data pipelines

**Example Pattern:**
```javascript
async function safeConvertDiscoveredUrlsToJobs() {
  try {
    // Get URLs with safety limits and ordering
    const { data: discoveredUrls, error } = await supabase
      .from('discovered_urls')
      .select('url, id, processing_attempts')
      .eq('status', 'new')
      .order('processing_attempts', { ascending: true })
      .limit(10); // Small batch for safety

    // Process with error handling and quality scoring
    for (const urlRecord of discoveredUrls) {
      try {
        // Process URL with validation
        if ((urlRecord.processing_attempts || 0) >= 3) {
          console.log(`⏭️ Skipping URL with too many failures: ${urlRecord.url}`);
          continue;
        }
        
        // Update quality scores based on success/failure
        await updateUrlQualityScore(urlRecord.url, 'success'); // or 'failure'
      } catch (error) {
        await updateUrlQualityScore(urlRecord.url, 'failure');
      }
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}
```

## Tools and Scripts

### Fix Import Script
The `scripts/fix-imports-systematic.js` script provides automated fixing:
- Scans for common import patterns
- Applies targeted corrections
- Validates fixes don't break existing functionality
- Generates reports of changes made

### Usage:
```bash
node scripts/fix-imports-systematic.js
```

## Verification Standards
- **Verification 1:** All scripts execute without import resolution errors
- **Verification 2:** Environment variables load correctly
- **Verification 3:** Module dependencies resolve properly
- **Verification 4:** GitHub Actions can execute the scripts successfully
- **Verification 5:** No regressions in existing functionality

## Implementation Workflow
1. **Detection Phase:** Identify all import issues using automated tools
2. **Analysis Phase:** Categorize issues and plan fixes
3. **Fix Phase:** Apply systematic corrections
4. **Validation Phase:** Test fixes don't break functionality
5. **Prevention Phase:** Update processes to prevent future issues
