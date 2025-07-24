# GitHub Actions ESM Module Resolution Debugging

## Current Setup Analysis

### Project Configuration
- The project is configured as an ESM (ECMAScript Modules) project with `"type": "module"` in `package.json`
- TypeScript is configured with:
  - `"module": "NodeNext"`
  - `"moduleResolution": "NodeNext"`
  - Targeting modern JavaScript with `"target": "ESNext"`

### Mixed Module Systems
The project is currently mixing different module systems:
1. **Next.js Application Code**
   - Uses Next.js's module resolution system
   - Uses path aliases (e.g., `@/*`)
   - Located in the `app/` directory

2. **Library Code**
   - Located in the `lib/` directory
   - Using Node.js ESM modules
   - Contains shared utilities and services

3. **GitHub Action Code**
   - Needs to run in Node.js ESM environment
   - Located in `lib/pipeline/`
   - Imports from other library modules

## Identified Issues

### 1. Module Resolution Conflicts
- The GitHub Action code is trying to use ESM imports but running into resolution issues
- TypeScript compilation is set up correctly for ESM, but the runtime environment has different expectations
- Import paths in the compiled JavaScript need `.js` extensions for Node.js ESM

### 2. Type Definition Challenges
- Type imports are not properly resolved in the ESM context
- The mix of Next.js types and pure Node.js types creates conflicts

### 3. Build Process Complications
- The build process needs to handle different module systems
- The GitHub Action code needs a separate build configuration from the main Next.js application

## Attempted Solutions

### 1. Separate TypeScript Configuration
- Created `tsconfig.action.json` for GitHub Action-specific builds
- Attempted to isolate the action code from Next.js dependencies

### 2. Module Resolution Strategy
- Configured TypeScript to use `NodeNext` resolution
- Set up proper ESM module settings

## Next Steps

1. **Isolation Strategy**
   - Create a separate build process for GitHub Action code
   - Isolate dependencies to prevent Next.js configuration from affecting the action

2. **Type Management**
   - Create separate type definitions for the action code
   - Use `.d.ts` files to properly handle type imports

3. **Build Process Improvement**
   - Set up distinct build scripts for different parts of the application
   - Ensure proper file extension handling in the compiled output

## Outstanding Questions

1. Should we completely separate the action code into its own package?
2. How can we share types between Next.js and Node.js ESM code more effectively?
3. What's the best way to handle path aliases in the action code?

## Lessons Learned

1. Mixed module systems in a monorepo require careful configuration
2. Node.js ESM requires explicit file extensions
3. Next.js project structure can complicate pure Node.js modules
4. TypeScript configuration needs to be environment-specific

## Research Areas

1. Best practices for mixing Next.js and pure Node.js code
2. ESM module resolution in GitHub Actions
3. TypeScript configuration for mixed module systems
4. Strategies for sharing types between different module systems
