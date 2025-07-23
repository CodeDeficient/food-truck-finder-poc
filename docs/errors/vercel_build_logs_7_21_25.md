[16:00:09.938] Running build in Washington, D.C., USA (East) – iad1
[16:00:09.939] Build machine configuration: 2 cores, 8 GB
[16:00:09.951] Cloning github.com/CodeDeficient/food-truck-finder-poc (Branch: main, Commit: 7fefa3a)
[16:00:10.486] Cloning completed: 535.000ms
[16:00:13.091] Restored build cache from previous deployment (HshpTgHuCYZi9TqfWqBnpBfzCGpD)
[16:00:16.431] Running "vercel build"
[16:00:16.973] Vercel CLI 44.5.0
[16:00:17.350] Installing dependencies...
[16:00:19.385] 
[16:00:19.391] added 3 packages in 2s
[16:00:19.391] 
[16:00:19.392] 201 packages are looking for funding
[16:00:19.392]   run `npm fund` for details
[16:00:19.426] Detected Next.js version: 14.2.30
[16:00:19.438] Running "npm run build"
[16:00:19.547] 
[16:00:19.547] > my-v0-project@0.1.0 build
[16:00:19.548] > next build
[16:00:19.548] 
[16:00:20.246]   ▲ Next.js 14.2.30
[16:00:20.247] 
[16:00:20.316]    Creating an optimized production build ...
[16:00:47.899]  ✓ Compiled successfully
[16:00:47.901]    Skipping linting
[16:00:47.902]    Checking validity of types ...
[16:01:01.887] Failed to compile.
[16:01:01.887] 
[16:01:01.887] ./lib/api/cron/auto-scrape/improvedHandler.ts:163:9
[16:01:01.887] Type error: Object literal may only specify known properties, and 'queued_at' does not exist in type 'Partial<ScrapingJob>'.
[16:01:01.887] 
[16:01:01.887] [0m [90m 161 |[39m       [90m// Just update status to indicate it's been queued[39m[0m
[16:01:01.887] [0m [90m 162 |[39m       [36mawait[39m [33mScrapingJobService[39m[33m.[39mupdateJobStatus(job[33m.[39mid[33m,[39m [32m'pending'[39m[33m,[39m {[0m
[16:01:01.887] [0m[31m[1m>[22m[39m[90m 163 |[39m         queued_at[33m:[39m [36mnew[39m [33mDate[39m()[33m.[39mtoISOString()[33m,[39m[0m
[16:01:01.887] [0m [90m     |[39m         [31m[1m^[22m[39m[0m
[16:01:01.888] [0m [90m 164 |[39m         notes[33m:[39m [32m'Queued for processing by job processor'[39m[0m
[16:01:01.888] [0m [90m 165 |[39m       })[33m;[39m[0m
[16:01:01.889] [0m [90m 166 |[39m     }[0m
[16:01:01.927] Next.js build worker exited with code: 1 and signal: null
[16:01:01.989] Error: Command "npm run build" exited with 1
[16:01:02.521] 