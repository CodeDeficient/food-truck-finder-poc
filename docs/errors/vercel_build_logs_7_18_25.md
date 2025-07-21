[20:17:01.529] Running build in Washington, D.C., USA (East) – iad1
[20:17:01.529] Build machine configuration: 2 cores, 8 GB
[20:17:01.546] Cloning github.com/CodeDeficient/food-truck-finder-poc (Branch: feature/phase-4-ui-overhaul, Commit: c9c3fad)
[20:17:02.091] Cloning completed: 544.000ms
[20:17:06.138] Restored build cache from previous deployment (9KWraXZw8upYwEd7Zv7ruLow5bPG)
[20:17:07.088] Running "vercel build"
[20:17:07.786] Vercel CLI 44.4.3
[20:17:08.935] Installing dependencies...
[20:17:11.632] 
[20:17:11.633] > my-v0-project@0.1.0 prepare
[20:17:11.633] > husky
[20:17:11.633] 
[20:17:11.699] 
[20:17:11.699] up to date in 2s
[20:17:11.700] 
[20:17:11.700] 220 packages are looking for funding
[20:17:11.700]   run `npm fund` for details
[20:17:11.734] Detected Next.js version: 14.2.30
[20:17:11.740] Running "npm run build"
[20:17:11.849] 
[20:17:11.850] > my-v0-project@0.1.0 build
[20:17:11.850] > next build
[20:17:11.850] 
[20:17:12.528]   ▲ Next.js 14.2.30
[20:17:12.529] 
[20:17:12.600]    Creating an optimized production build ...
[20:17:22.624]  ✓ Compiled successfully
[20:17:22.625]    Skipping linting
[20:17:22.626]    Checking validity of types ...
[20:17:36.409] Failed to compile.
[20:17:36.409] 
[20:17:36.409] ./components/map/MapComponent.tsx:167:9
[20:17:36.410] Type error: Type '{ attribution: string; url: string; maxZoom: number; minZoom: number; tileSize: number; zoomOffset: number; keepBuffer: number; updateWhenIdle: true; updateWhenZooming: false; className: string; style: { ...; } | {}; }' is not assignable to type 'IntrinsicAttributes & TileLayerProps & RefAttributes<TileLayer>'.
[20:17:36.410]   Property 'style' does not exist on type 'IntrinsicAttributes & TileLayerProps & RefAttributes<TileLayer>'.
[20:17:36.410] 
[20:17:36.410] [0m [90m 165 |[39m         className[33m=[39m{tileLayerProps[33m.[39mclassName}[0m
[20:17:36.410] [0m [90m 166 |[39m         [90m// Apply dark filter directly as style[39m[0m
[20:17:36.411] [0m[31m[1m>[22m[39m[90m 167 |[39m         style[33m=[39m{isDark [33m?[39m {[0m
[20:17:36.411] [0m [90m     |[39m         [31m[1m^[22m[39m[0m
[20:17:36.411] [0m [90m 168 |[39m           filter[33m:[39m [32m'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)'[39m[0m
[20:17:36.411] [0m [90m 169 |[39m         } [33m:[39m {}}[0m
[20:17:36.411] [0m [90m 170 |[39m       [33m/[39m[33m>[39m[0m
[20:17:36.445] Next.js build worker exited with code: 1 and signal: null
[20:17:36.485] Error: Command "npm run build" exited with 1
[20:17:36.954] 
[20:17:40.065] Exiting build container