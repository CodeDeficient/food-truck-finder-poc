[21:15:22.721] Running build in Washington, D.C., USA (East) – iad1
[21:15:22.721] Build machine configuration: 2 cores, 8 GB
[21:15:22.763] Retrieving list of deployment files...
[21:15:22.766] Skipping build cache, deployment was triggered without cache.
[21:15:23.466] Downloading 746 deployment files...
[21:15:27.768] Running "vercel build"
[21:15:28.371] Vercel CLI 44.4.3
[21:15:28.784] Installing dependencies...
[21:15:34.227] npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
[21:15:34.346] npm warn deprecated glob@7.2.3: Glob versions prior to v9 are no longer supported
[21:15:34.587] npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
[21:15:35.738] npm warn deprecated @supabase/auth-helpers-shared@0.7.0: This package is now deprecated - please use the @supabase/ssr package instead.
[21:15:36.657] npm warn deprecated @supabase/auth-helpers-nextjs@0.10.0: This package is now deprecated - please use the @supabase/ssr package instead.
[21:15:54.021] 
[21:15:54.022] > my-v0-project@0.1.0 prepare
[21:15:54.022] > husky
[21:15:54.022] 
[21:15:54.090] .git can't be found
[21:15:54.090] added 1053 packages in 24s
[21:15:54.090] 
[21:15:54.091] 218 packages are looking for funding
[21:15:54.091]   run `npm fund` for details
[21:15:54.281] Detected Next.js version: 14.2.30
[21:15:54.291] Running "npm run build"
[21:15:54.526] 
[21:15:54.527] > my-v0-project@0.1.0 build
[21:15:54.527] > next build
[21:15:54.527] 
[21:15:55.271] Attention: Next.js now collects completely anonymous telemetry regarding usage.
[21:15:55.271] This information is used to shape Next.js' roadmap and prioritize features.
[21:15:55.273] You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
[21:15:55.274] https://nextjs.org/telemetry
[21:15:55.275] 
[21:15:55.400]   ▲ Next.js 14.2.30
[21:15:55.402] 
[21:15:55.665]    Creating an optimized production build ...
[21:16:21.886]  ✓ Compiled successfully
[21:16:21.887]    Linting and checking validity of types ...
[21:16:33.299]    Collecting page data ...
[21:16:33.766] Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using GOOGLE_API_KEY.
[21:16:35.307]    Generating static pages (0/42) ...
[21:16:36.225]    Generating static pages (10/42) 
[21:16:36.465]    Generating static pages (20/42) 
[21:16:36.508] Search error: B [Error]: Dynamic server usage: Route /api/search couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
[21:16:36.509]     at V (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21778)
[21:16:36.509]     at Object.get (/vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:29465)
[21:16:36.509]     at p (/vercel/path0/.next/server/app/api/search/route.js:1:4719)
[21:16:36.509]     at g (/vercel/path0/.next/server/app/api/search/route.js:1:5937)
[21:16:36.510]     at /vercel/path0/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
[21:16:36.510]     at /vercel/path0/node_modules/next/dist/server/lib/trace/tracer.js:140:36
[21:16:36.510]     at NoopContextManager.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
[21:16:36.510]     at ContextAPI.with (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
[21:16:36.511]     at NoopTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
[21:16:36.511]     at ProxyTracer.startActiveSpan (/vercel/path0/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854) {
[21:16:36.511]   description: "Route /api/search couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
[21:16:36.511]   digest: 'DYNAMIC_SERVER_USAGE'
[21:16:36.512] }
[21:16:37.464]    Generating static pages (31/42) 
[21:16:39.648]  ✓ Generating static pages (42/42)
[21:16:39.835]    Finalizing page optimization ...
[21:16:39.835]    Collecting build traces ...
[21:16:42.503] 
[21:16:42.507] Route (app)                             Size     First Load JS
[21:16:42.507] ┌ ○ /                                   5.39 kB         352 kB
[21:16:42.507] ├ ○ /_not-found                         187 B           296 kB
[21:16:42.508] ├ ○ /access-denied                      2.32 kB         351 kB
[21:16:42.508] ├ ○ /admin                              3.34 kB         352 kB
[21:16:42.508] ├ ○ /admin/analytics                    143 B           296 kB
[21:16:42.508] ├ ○ /admin/auto-scraping                4.05 kB         321 kB
[21:16:42.508] ├ ○ /admin/data-cleanup                 4.67 kB         322 kB
[21:16:42.508] ├ ○ /admin/data-quality                 64.1 kB         381 kB
[21:16:42.508] ├ ○ /admin/events                       179 B           296 kB
[21:16:42.508] ├ ○ /admin/food-trucks                  179 B           296 kB
[21:16:42.509] ├ ƒ /admin/food-trucks/[id]             179 B           296 kB
[21:16:42.510] ├ ○ /admin/monitoring                   678 B           297 kB
[21:16:42.510] ├ ○ /admin/pipeline                     143 B           296 kB
[21:16:42.510] ├ ○ /admin/test-pipeline                4.29 kB         321 kB
[21:16:42.510] ├ ○ /admin/users                        179 B           296 kB
[21:16:42.510] ├ ƒ /api/admin/automated-cleanup        0 B                0 B
[21:16:42.510] ├ ƒ /api/admin/cron-status              0 B                0 B
[21:16:42.510] ├ ƒ /api/admin/data-cleanup             0 B                0 B
[21:16:42.510] ├ ƒ /api/admin/data-quality             0 B                0 B
[21:16:42.510] ├ ƒ /api/admin/oauth-status             0 B                0 B
[21:16:42.510] ├ ƒ /api/admin/realtime-events          0 B                0 B
[21:16:42.511] ├ ƒ /api/admin/scraping-metrics         0 B                0 B
[21:16:42.514] ├ ƒ /api/analytics/web-vitals           0 B                0 B
[21:16:42.514] ├ ƒ /api/auto-scrape-initiate           0 B                0 B
[21:16:42.514] ├ ƒ /api/autonomous-discovery           0 B                0 B
[21:16:42.514] ├ ƒ /api/cron/auto-scrape               0 B                0 B
[21:16:42.514] ├ ƒ /api/cron/quality-check             0 B                0 B
[21:16:42.514] ├ ƒ /api/dashboard                      0 B                0 B
[21:16:42.515] ├ ƒ /api/enhanced-pipeline              0 B                0 B
[21:16:42.515] ├ ƒ /api/firecrawl                      0 B                0 B
[21:16:42.515] ├ ƒ /api/gemini                         0 B                0 B
[21:16:42.515] ├ ƒ /api/monitoring/api-usage           0 B                0 B
[21:16:42.515] ├ ƒ /api/pipeline                       0 B                0 B
[21:16:42.515] ├ ƒ /api/scheduler                      0 B                0 B
[21:16:42.521] ├ ƒ /api/scrape                         0 B                0 B
[21:16:42.521] ├ ƒ /api/search                         0 B                0 B
[21:16:42.521] ├ ƒ /api/tavily                         0 B                0 B
[21:16:42.522] ├ ƒ /api/test-integration               0 B                0 B
[21:16:42.522] ├ ƒ /api/test-pipeline-run              0 B                0 B
[21:16:42.522] ├ ƒ /api/trucks                         0 B                0 B
[21:16:42.522] ├ ƒ /api/trucks/[id]                    0 B                0 B
[21:16:42.522] ├ ƒ /auth/callback                      0 B                0 B
[21:16:42.522] ├ ○ /login                              3.43 kB         352 kB
[21:16:42.523] └ ƒ /trucks/[id]                        5.73 kB         353 kB
[21:16:42.523] + First Load JS shared by all           296 kB
[21:16:42.523]   └ chunks/vendors-34fe162792df752f.js  294 kB
[21:16:42.523]   └ other shared chunks (total)         2.43 kB
[21:16:42.523] 
[21:16:42.523] 
[21:16:42.525] ○  (Static)   prerendered as static content
[21:16:42.525] ƒ  (Dynamic)  server-rendered on demand
[21:16:42.525] 
[21:16:42.685] Traced Next.js server files in: 35.629ms
[21:16:42.831] Created all serverless functions in: 146.091ms
[21:16:42.884] Collected static files (public/, static/, .next/static): 31.832ms
[21:16:42.971] Build Completed in /vercel/output [1m]
[21:16:43.058] Deploying outputs...
[21:16:49.607] 
[21:16:49.808] Deployment completed
[21:17:09.916] Uploading build cache [196.40 MB]...
[21:17:12.902] Build cache uploaded: 2.985s
[21:17:15.107] Exiting build container