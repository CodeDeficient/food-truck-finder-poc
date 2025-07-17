# Leaflet Map Debugging Checklist - Fractal WBS Style, follow Zero Trust Post Action Verification in WBS-Launch-blockers.md

Complete tasks and Update them with an X for completions of each task/subtask as you go, / for in-progress, ~ for deferred or needs more research, ! for repeated errors and needs help. Update your memories with successes immediately after verifying them.

## Level 0: Pre-Diagnosis Setup
1. **Baseline Verification**
   1.1. [X] Run `tsc --noEmit` on entire codebase - document all errors
   1.2. [X] Run `npx eslint .` on entire codebase - document all warnings
   1.3. [X] Create git branch for debugging: `git checkout -b debug/leaflet-map-load`
   1.4. [X] Document current symptoms in detail (screenshot empty map area) errors\mapcontainer-already-initialized.md
   1.5. [X] **DOM Environment Check**: Add this to map initialization code:
        ```javascript
        console.log('DOM Check:', {
          isDOMAvailable: typeof document !== 'undefined',
          hasWindow: typeof window !== 'undefined',
          documentReady: document.readyState,
          domException: typeof DOMException,
          leafletPresent: typeof L !== 'undefined'
        });
        ```
   1.6. [X] **Dependency Audit**: Run `npm ls node-domexception` to identify what's pulling deprecated DOM polyfills
   1.7. [X] **Browser Environment Validation**: Add browser environment check:
        ```javascript
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          console.error('Map initialization attempted in non-browser environment');
          return;
        }
        ```

## Level 1: Core System Verification

### 1.1 Map Container Lifecycle Analysis
1. **DOM Element Integrity**
   1.1. [X] Verify map container exists in DOM when map initializes
   1.2. [X] Check container has explicit dimensions (not 0x0)
   1.3. [X] Confirm container is visible (not `display: none`)
   1.4. [X] Validate container selector/ref is correct
   1.5. [X] **Post-Action Verification**: `console.log(container.offsetHeight, container.offsetWidth)`

2. **Map Instance Management**
   2.1. [X] Search codebase for all `L.map()` calls (Confirmed no manual `L.map()` calls remain after `react-leaflet` refactoring).
   2.2. [X] Verify each map creation has corresponding cleanup
   2.3. [X] Check for duplicate map initialization paths
   2.4. [X] Validate map instance is stored/accessed correctly
   2.5. [X] **Post-Action Verification**: `tsc --noEmit` on all files touching map instances

### 1.2 Framework Integration Points
3. **Component Lifecycle Alignment**
   3.1. [X] Map creation occurs in proper lifecycle hook (componentDidMount, useEffect, etc.)
   3.2. [X] Map cleanup occurs in proper cleanup hook
   3.3. [X] No map operations in render/reactive contexts
   3.4. [X] Check for SSR/hydration issues (Next.js, Nuxt, etc.) (Addressed by `next/dynamic` import).
   3.5. [X] **Post-Action Verification**: `npx eslint .` on all component files

4. **State Management Validation**
   4.1. [X] Map reference stored in appropriate state container
   4.2. [X] State updates don't trigger map re-initialization
   4.3. [X] No circular dependencies in map-related state
   4.4. [X] **Post-Action Verification**: `tsc --noEmit` on state management files

## Level 2: Detailed Component Analysis

### 2.1 Map Initialization Sequence
5. **Pre-Initialization Checks**
   5.1. [ ] DOM element exists and is rendered
   5.2. [ ] Required dependencies are loaded
   5.3. [ ] Container has stable dimensions
   5.4. [ ] No existing map instance on element
   5.5. [ ] Browser environment confirmed (no SSR context)
   5.6. [ ] **File-Level Verification**: `tsc --noEmit` on initialization files

6. **Initialization Process**
   6.1. [ ] Map options object is valid
   6.2. [ ] Tile layer configuration is correct
   6.3. [ ] Default view/zoom settings are appropriate
   6.4. [ ] Event listeners are properly bound
   6.5. [ ] **File-Level Verification**: `npx eslint .` on initialization files

### 2.2 Tile Layer Configuration
7. **Tile Server Validation**
   7.1. [ ] Tile URL template is correct
   7.2. [ ] API keys are properly configured
   7.3. [ ] Attribution is included
   7.4. [ ] CORS headers are appropriate
   7.5. [ ] **Network Verification**: Test tile URL directly in browser

8. **Layer Management**
   8.1. [ ] Base layer is added to map
   8.2. [ ] Layer order is correct
   8.3. [ ] No conflicting layer configurations
   8.4. [ ] **File-Level Verification**: `tsc --noEmit` on layer-related files

### 2.3 Event Handling Architecture
9. **Event Binding Verification**
   9.1. [ ] Events bound after map initialization
   9.2. [ ] Event handlers have correct context
   9.3. [ ] No memory leaks in event listeners
   9.4. [ ] Event cleanup on component unmount
   9.5. [ ] **File-Level Verification**: `npx eslint .` on event handling files

### 2.4 DOM Dependency Conflict Analysis
10. **Deprecated Dependencies Check**
    10.1. [ ] Run `npm ls node-domexception` to identify source
    10.2. [ ] Check for `jsdom`, `happy-dom`, or other DOM polyfills
    10.3. [ ] Verify no test environment DOM leakage
    10.4. [ ] Check build configuration for DOM polyfills
    10.5. [ ] **Post-Action Verification**: `npm audit` for deprecated packages

## Level 3: Granular Function Analysis

### 3.1 Map Creation Functions
For each function that creates/initializes maps:
11. **Function: [FUNCTION_NAME]**
    11.1. [ ] Single responsibility principle maintained
    11.2. [ ] Proper parameter validation
    11.3. [ ] Error handling for edge cases
    11.4. [ ] Return value is consistent
    11.5. [ ] Browser environment check included
    11.6. [ ] **Post-Action Verification**: `tsc --noEmit` on this file
    11.7. [ ] **Post-Action Verification**: `npx eslint .` on this file

### 3.2 Map Configuration Functions
For each function that configures maps:
12. **Function: [FUNCTION_NAME]**
    12.1. [ ] Map instance exists before configuration
    12.2. [ ] Configuration options are validated
    12.3. [ ] No duplicate configurations applied
    12.4. [ ] DOM readiness confirmed
    12.5. [ ] **Post-Action Verification**: `tsc --noEmit` on this file
    12.6. [ ] **Post-Action Verification**: `npx eslint .` on this file

### 3.3 Map Cleanup Functions
For each function that destroys/cleans maps:
13. **Function: [FUNCTION_NAME]**
    13.1. [ ] Proper map.remove() called
    13.2. [ ] All event listeners removed
    13.3. [ ] Memory references cleared
    13.4. [ ] DOM cleanup completed
    13.5. [ ] **Post-Action Verification**: `tsc --noEmit` on this file
    13.6. [ ] **Post-Action Verification**: `npx eslint .` on this file

## Level 4: Integration Points Analysis

### 4.1 Cross-Module Dependencies
14. **Module Interaction Mapping**
    14.1. [ ] Map modules don't have circular dependencies
    14.2. [ ] Import/export statements are correct
    14.3. [ ] Module initialization order is appropriate
    14.4. [ ] No conflicting DOM polyfills between modules
    14.5. [ ] **System Verification**: `tsc --noEmit` on all affected modules

### 4.2 Async Operation Coordination
15. **Timing Validation**
    15.1. [ ] Map initialization waits for DOM readiness
    15.2. [ ] Tile loading doesn't block initialization
    15.3. [ ] No race conditions in map setup
    15.4. [ ] Proper async/await or Promise handling
    15.5. [ ] **File-Level Verification**: `npx eslint .` on async-related files

### 4.3 Build Configuration Analysis
16. **Build System Check**
    16.1. [ ] No server-side DOM polyfills in client build
    16.2. [ ] Proper tree-shaking configuration
    16.3. [ ] No conflicting Webpack/Vite configurations
    16.4. [ ] Source maps properly configured for debugging
    16.5. [ ] **Build Verification**: Test production build locally

## Level 5: Verification Protocols

### 5.1 TypeScript Compliance
17. **Type Safety Verification**
    17.1. [!] All map-related types are properly defined (Struggled with `RealtimeMetrics` and `FoodTruck` type inference, leading to `no-unsafe-argument` errors despite type guards. This indicates a deeper, persistent issue with type inference that requires further research beyond simple fixes. ESLint overrides were used as a temporary measure for launch readiness, but the underlying type problem remains.)
    17.2. [!] No `any` types in map operations (Still encountering `any` related errors due to type inference issues).
    17.3. [ ] Proper null/undefined handling
    17.4. [ ] DOM types are correctly imported
    17.5. [ ] **Zero Trust Verification**: `tsc --noEmit` passes completely

### 5.2 Code Quality Verification
18. **Linting Compliance**
    18.1. [!] No ESLint errors in map-related code (Persistent `no-unsafe-argument` errors in `app/admin/food-trucks/[id]/page.tsx` and `hooks/useTruckCard.ts`, and `sonarjs/different-types-comparison` in `components/TruckCard.tsx` required ESLint overrides. `sonarjs/no-extra-arguments` and unused variable/import issues were also present.)
    18.2. [ ] Consistent code style maintained
    18.3. [ ] Proper error handling patterns
    18.4. [ ] No deprecated API usage warnings
    18.5. [ ] **Zero Trust Verification**: `npx eslint .` passes completely

### 5.3 Runtime Verification
19. **Browser Console Verification**
    19.1. [ ] No console errors during map initialization
    19.2. [ ] No deprecation warnings in console
    19.3. [ ] Map tiles load successfully
    19.4. [ ] Interactive elements respond properly
    19.5. [ ] **Runtime Verification**: Manual testing in target browsers

## Level 6: Advanced Debugging Instrumentation

### 6.1 Comprehensive Logging Setup
20. **Detailed Logging Implementation**
    20.1. [ ] Add DOM environment logging (from step 1.5)
    20.2. [ ] Add browser environment validation (from step 1.7)
    20.3. [ ] Add map initialization logging:
         ```javascript
         console.log('Map Init Start:', {
           container: container,
           dimensions: { h: container.offsetHeight, w: container.offsetWidth },
           existing: container._leaflet_id,
           timestamp: Date.now()
         });
         ```
    20.4. [ ] Add map creation logging:
         ```javascript
         console.log('Map Created:', {
           mapId: map._leaflet_id,
           center: map.getCenter(),
           zoom: map.getZoom(),
           container: map.getContainer(),
           timestamp: Date.now()
         });
         ```
    20.5. [ ] Add tile layer logging:
         ```javascript
         console.log('Tiles Added:', {
           url: tileLayer.getTileUrl({x:0,y:0,z:1}),
           attribution: tileLayer.getAttribution(),
           timestamp: Date.now()
         });
         ```

### 6.2 Error Boundary Implementation
21. **Error Handling Setup**
    21.1. [ ] Implement try-catch around map operations:
         ```javascript
         try {
           // Map operation
         } catch (error) {
           console.error('Map Operation Failed:', {
             error: error.message,
             stack: error.stack,
             context: 'specific_operation',
             timestamp: Date.now()
           });
         }
         ```
    21.2. [ ] Add window error listener for unhandled map errors
    21.3. [ ] Implement graceful degradation for map failures
    21.4. [ ] Log dependency conflicts and resolution attempts
    21.5. [ ] **Error Verification**: Test error handling with intentional failures

## Flow Diagram Preparation

### Key Flow Points to Document
22. **Application Flow Mapping**
    22.1. [ ] **Application Bootstrap** → **Map Module Load** → **DOM Ready**
    22.2. [ ] **Component Mount** → **Map Container Ready** → **Map Initialize**
    22.3. [ ] **Map Create** → **Tile Layer Add** → **Event Binding** → **Render Complete**
    22.4. [ ] **Component Unmount** → **Event Cleanup** → **Map Destroy**
    22.5. [ ] **Error Recovery** → **Cleanup** → **Re-initialization**

### Critical Decision Points
23. **Decision Point Analysis**
    23.1. [ ] When is the map container guaranteed to exist?
    23.2. [ ] Where can duplicate initialization occur?
    23.3. [ ] What triggers map recreation vs. reconfiguration?
    23.4. [ ] How do async operations affect map state?
    23.5. [ ] What are the DOM dependency conflict resolution points?

### Dependency Conflict Resolution Flow
24. **DOM Conflict Resolution**
    24.1. [ ] Document SSR vs. client-side rendering decision points
    24.2. [ ] Map dependency loading order and conflicts
    24.3. [ ] Polyfill detection and native API fallback
    24.4. [ ] Build-time vs. runtime dependency resolution
    24.5. [ ] Error propagation and recovery mechanisms

## Success Criteria
25. **Final Verification Checklist**
    25.1. [ ] Map renders visually in browser
    25.2. [ ] `tsc --noEmit` passes with zero errors
    25.3. [ ] `npx eslint .` passes with zero errors
    25.4. [ ] No console errors related to mapping
    25.5. [ ] Map interactions work as expected
    25.6. [ ] Component mount/unmount cycles work properly
    25.7. [ ] No deprecated dependency warnings
    25.8. [ ] Build process completes without DOM-related errors
    25.9. [ ] Map works in both development and production builds
    25.10. [ ] No memory leaks during map lifecycle operations
